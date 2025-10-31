const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '..', 'client', 'public');
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'projects.json');
const messagesFile = path.join(dataDir, 'messages.json');
const eventsFile = path.join(dataDir, 'events.json');
const roomsFile = path.join(dataDir, 'rooms.json');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(publicDir));

function readProjects() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeProjects(list) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), 'utf8');
}

function readJson(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}
function writeJson(fp, v) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(v, null, 2), 'utf8');
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/projects', (_req, res) => {
  res.json(readProjects());
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name' });
  const colors = ['#7c3aed', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const list = readProjects();
  const p = { id: String(Date.now()), name: name.trim(), description: (description || '').trim(), progress: 0, color, status: 'planned', deadline: '' };
  list.unshift(p);
  writeProjects(list);
  res.status(201).json(p);
  io.emit('projects:created', p);
});

app.put('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  const list = readProjects();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).end();
  const prev = list[idx];
  const next = { ...prev, ...req.body };
  if (typeof next.name !== 'string' || !next.name.trim()) return res.status(400).json({ error: 'name' });
  list[idx] = next;
  writeProjects(list);
  if (next.deadline && next.deadline !== prev.deadline) {
    const evs = readJson(eventsFile);
    evs.push({ id: `e_${next.id}`, date: next.deadline, title: `Дедлайн: ${next.name}` });
    writeJson(eventsFile, evs);
  }
  res.json(next);
  io.emit('projects:updated', next);
});

app.delete('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  const list = readProjects();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).end();
  const [removed] = list.splice(idx, 1);
  writeProjects(list);
  res.json(removed);
  io.emit('projects:deleted', id);
});

app.get('/api/messages', (_req, res) => {
  res.json(readJson(messagesFile));
});
app.post('/api/messages', (req, res) => {
  const { room = 'public', authorId, author, text } = req.body || {};
  if (!text) return res.status(400).end();
  const msg = { id: String(Date.now()), room, authorId: String(authorId || ''), author: author || 'Гость', text: String(text), time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) };
  const list = readJson(messagesFile);
  list.push(msg);
  writeJson(messagesFile, list);
  io.to(room).emit('message:new', msg);
  res.status(201).json(msg);
});
app.delete('/api/messages/:id', (req, res) => {
  const id = req.params.id;
  const { authorId, room = 'public' } = req.body || {};
  const list = readJson(messagesFile);
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).end();
  if (!list[idx].authorId || String(list[idx].authorId) !== String(authorId || '')) return res.status(403).json({ error: 'forbidden' });
  const [removed] = list.splice(idx, 1);
  writeJson(messagesFile, list);
  io.to(room).emit('message:delete', id);
  res.json(removed);
});

app.get('/api/events', (_req, res) => {
  res.json(readJson(eventsFile));
});

function hash(pw){ return crypto.createHash('sha256').update(String(pw || '')).digest('hex'); }

app.post('/api/rooms/create', (req, res) => {
  const { room, password } = req.body || {};
  if(!room) return res.status(400).end();
  const rooms = readJson(roomsFile);
  if(rooms.find(r=>r.name===room)) return res.status(409).json({ error:'exists' });
  rooms.push({ name: room, password: hash(password) });
  writeJson(roomsFile, rooms);
  res.json({ ok:true });
});
app.post('/api/rooms/check', (req, res) => {
  const { room, password } = req.body || {};
  const rooms = readJson(roomsFile);
  const r = rooms.find(x=>x.name===room);
  if(!r) return res.status(404).end();
  if(r.password!==hash(password)) return res.status(403).end();
  res.json({ ok:true });
});


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
app.post('/api/admin/clear', (req, res) => {
  const { password, what = [] } = req.body || {};
  const pw = String(password || '').trim();
  if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: 'forbidden' });
  const set = new Set(what);
  if (set.has('messages')) writeJson(messagesFile, []);
  if (set.has('projects')) writeJson(dataFile, []);
  if (set.has('events')) writeJson(eventsFile, []);
  io.emit('admin:cleared', Array.from(set));
  res.json({ ok: true });
});

app.post('/api/admin/clear/messages', (req, res) => {
  const pw = String((req.body||{}).password || '').trim();
  if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: 'forbidden' });
  writeJson(messagesFile, []);
  io.emit('admin:cleared', ['messages']);
  res.json({ ok:true });
});
app.post('/api/admin/clear/projects', (req, res) => {
  const pw = String((req.body||{}).password || '').trim();
  if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: 'forbidden' });
  writeJson(dataFile, []);
  io.emit('admin:cleared', ['projects']);
  res.json({ ok:true });
});
app.post('/api/admin/clear/events', (req, res) => {
  const pw = String((req.body||{}).password || '').trim();
  if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: 'forbidden' });
  writeJson(eventsFile, []);
  io.emit('admin:cleared', ['events']);
  res.json({ ok:true });
});
app.post('/api/admin/clear/all', (req, res) => {
  const pw = String((req.body||{}).password || '').trim();
  if (pw !== ADMIN_PASSWORD) return res.status(403).json({ error: 'forbidden' });
  writeJson(messagesFile, []);
  writeJson(dataFile, []);
  writeJson(eventsFile, []);
  io.emit('admin:cleared', ['messages','projects','events']);
  res.json({ ok:true });
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const presence = new Map();
function listByRoom(room){
  return Array.from(presence.values()).filter(p=>p.room===room).map(p=>p.name);
}
io.on('connection', (socket) => {
  socket.join('public');
  socket.emit('presence:list', listByRoom('public'));

  socket.on('room:join', ({ room='public', name='Гость' }) => {
    const prev = presence.get(socket.id);
    if(prev){ socket.leave(prev.room || 'public'); }
    socket.join(room);
    presence.set(socket.id, { name:String(name), room:String(room) });
    io.to(room).emit('presence:list', listByRoom(room));
    socket.emit('room:joined', { room });
  });
  socket.on('presence:hello', (name) => {
    const cur = presence.get(socket.id) || { room: 'public' };
    presence.set(socket.id, { name:String(name || 'Гость'), room: cur.room });
    io.to(cur.room).emit('presence:list', listByRoom(cur.room));
  });
  socket.on('disconnect', () => {
    const cur = presence.get(socket.id);
    presence.delete(socket.id);
    if(cur){ io.to(cur.room || 'public').emit('presence:list', listByRoom(cur.room || 'public')); }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
