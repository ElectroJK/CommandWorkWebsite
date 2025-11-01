function ProjectDetail({ project, onSave, onDelete }){
    const [name,setName]=useState(project?.name||"");
    const [desc,setDesc]=useState(project?.description||"");
    const [progress,setProgress]=useState(project?.progress||0);
    const [status,setStatus]=useState(project?.status||'planned');
    const [deadline,setDeadline]=useState(project?.deadline||'');
    useEffect(()=>{ if(project){ setName(project.name); setDesc(project.description||""); setProgress(project.progress||0); setStatus(project.status||'planned'); setDeadline(project.deadline||'');} },[project?.id]);
    const locked = (project?.progress===100);
    if(!project) return (
        <div className="content"><div className="panel muted">Проект не найден</div></div>
    );
    return (
        <div className="content">
            <div className="panel grid-2">
                <div>
                    <div className="panel-title">Название</div>
                    <input className="input" value={name} onChange={e=>setName(e.target.value)} disabled={locked} />
                    <div className="panel-title" style={{marginTop:12}}>Описание</div>
                    <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} disabled={locked} />
                    <div className="panel-title" style={{marginTop:12}}>Статус</div>
                    <select className="input" value={status} onChange={e=>setStatus(e.target.value)} disabled={locked}>
                        <option value="planned">Запланирован</option>
                        <option value="in_progress">В работе</option>
                        <option value="done">Готов</option>
                    </select>
                    <div className="panel-title" style={{marginTop:12}}>Дедлайн</div>
                    <input className="input" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} disabled={locked} />
                </div>
                <div>
                    <div className="panel-title">Прогресс: {progress}%</div>
                    <input className="input" type="range" min="0" max="100" value={progress} onChange={e=>setProgress(Number(e.target.value))} disabled={locked} />
                    <div className="progress large" style={{marginTop:12}}><span style={{width: progress+'%', background: project.color}}/></div>
                </div>
            </div>
            <div className="toolbar" style={{justifyContent:'flex-end'}}>
                <button className="button" onClick={()=>onDelete(project.id)}>Удалить</button>
                {!locked && (
                    <button className="button primary" onClick={()=>onSave(project.id,{ name:name.trim(), description:desc.trim(), progress, status, deadline })}>Сохранить</button>
                )}
            </div>
        </div>
    );
}

const { useState, useMemo, useEffect } = React;

function Icon({ name }) {
    const map = {
        search: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ),
        calendar: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 3V7M8 3V7M3 11H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ),
        board: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="6" height="16" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="10" y="4" width="5" height="10" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="16" y="4" width="5" height="6" rx="1.5" stroke="currentColor" strokeWidth="2"/></svg>
        ),
        bell: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2"/><path d="M9.73 21a2.5 2.5 0 004.54 0" stroke="currentColor" strokeWidth="2"/></svg>
        ),
        plus: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        )
    };
    return <span className="icon">{map[name]}</span>;
}

function useHashPath(){
    const get = () => {
        const h = window.location.hash.replace(/^#/, '');
        return h || '/';
    };
    const [path,setPath]=useState(get());
    useEffect(()=>{
        const onChange=()=>setPath(get());
        window.addEventListener('hashchange', onChange);
        return ()=>window.removeEventListener('hashchange', onChange);
    },[]);
    const navigate=(to)=>{ window.location.hash = to; };
    return { path, navigate };
}

function Placeholder({ title, note }){
    return (
        <div className="content">
            <div className="panel" style={{ height: 300, display:'grid', placeItems:'center' }}>
                <div className="muted">{title}{note? ` — ${note}`:''}</div>
            </div>
        </div>
    );
}

function Topbar({ navigate }) {
    return (
        <header className="topbar">
            <div className="title" onClick={()=>navigate('/')} style={{cursor:'pointer'}}>
                <div className="logo">PH</div>
                <div>
                    <div className="app-name">ProjectHub</div>
                    <div className="muted small">Управляйте проектами эффективно</div>
                </div>
            </div>
            <div className="top-actions">
                <button className="icon-btn" onClick={() => navigate('/search')}><Icon name="search"/></button>
                <button className="icon-btn" onClick={() => navigate('/kanban')}><Icon name="board"/></button>
                <button className="icon-btn" onClick={() => navigate('/calendar')}><Icon name="calendar"/></button>
                <button className="icon-btn" onClick={() => navigate('/notifications')}><Icon name="bell"/></button>
            </div>
        </header>
    );
}

function Subnav({ title, right }){
    return (
        <div className="subnav panel">
            <div className="subnav-title">{title}</div>
            {right}
        </div>
    );
}

function Sidebar({ projects, team, path }) {
    return (
        <aside className="sidebar">
            <nav className="menu">
                <a className={`menu-item${path==='/'?' active':''}`} href="#/">Главная</a>
                <a className={`menu-item${path.startsWith('/projects')?' active':''}`} href="#/projects">Проекты</a>
                <a className={`menu-item${path==='/calendar'?' active':''}`} href="#/calendar">Календарь</a>
                <a className={`menu-item${path==='/team'?' active':''}`} href="#/team">Команда</a>
                <a className={`menu-item${path==='/messages'?' active':''}`} href="#/messages">Сообщения</a>
                <a className={`menu-item${path==='/settings'?' active':''}`} href="#/settings">Настройки</a>
            </nav>
            <div className="sidebar-block">
                <div className="block-title">Проекты</div>
                <div className="project-list">
                    {projects.length === 0 && <div className="muted small">Пока нет проектов</div>}
                    {projects.map(p => (
                        <a key={p.id} href={`#/projects/${p.id}`} className="project-item">
                            <span className="dot" style={{ background: p.color }} />
                            <span className="project-name">{p.name}</span>
                            <span className="progress"><span style={{ width: p.progress + '%', background: p.color }} /></span>
                        </a>
                    ))}
                </div>
            </div>
            <div className="sidebar-block">
                <div className="block-title">Команда</div>
                <div>
                    {team.length === 0 && <div className="muted small">Добавьте участников на странице Команда</div>}
                    {team.map((m, i) => (
                        <div key={i} className="team-item">
                            <div className="avatar">{m.name.slice(0,1).toUpperCase()}</div>
                            <div>
                                <div className="team-name">{m.name}</div>
                                <div className="muted small">{m.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

function Stat({ label, value, delta, icon, color }) {
    return (
        <div className="stat">
            <div className="stat-icon" style={{ background: color }}>{icon}</div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="muted small">{label}{delta ? ` · ${delta}` : ''}</div>
            </div>
        </div>
    );
}

function HomePage({ projects, activities, path, navigate }) {
    return (
        <div className="content">
            <div className="tabs">
                <button className={`tab${path==='/'?' active':''}`} onClick={()=>navigate('/')}>Обзор</button>
                <button className={`tab${path==='/kanban'?' active':''}`} onClick={()=>navigate('/kanban')}>Канбан</button>
                <button className={`tab${path==='/calendar'?' active':''}`} onClick={()=>navigate('/calendar')}>Календарь</button>
            </div>
            <div className="cards">
                <div className="panel"><Stat label="Активные проекты" value={projects.length} delta="+1" icon={<span>🗂️</span>} color="#60a5fa"/></div>
                <div className="panel"><Stat label="Участники команды" value={4} delta="+2" icon={<span>👥</span>} color="#34d399"/></div>
                <div className="panel"><Stat label="Выполненные задачи" value={1} delta="+8%" icon={<span>✅</span>} color="#a78bfa"/></div>
                <div className="panel"><Stat label="Средний прогресс" value={'47%'} delta="+5%" icon={<span>📈</span>} color="#f97316"/></div>
            </div>
            <div className="two-col">
                <div className="panel">
                    <div className="panel-title">Прогресс проектов</div>
                    <div className="stack">
                        {projects.map(p => (
                            <div key={p.id} className="progress-row">
                                <div className="progress-name"><span className="dot" style={{ background: p.color }} />{p.name}</div>
                                <div className="progress"><span style={{ width: p.progress + '%', background: p.color }} /></div>
                                <div className="muted small">{p.progress}%</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-title">Последняя активность</div>
                    <div className="stack">
                        {activities.map((a, i) => (
                            <div key={i} className="activity">
                                <div className="avatar">{a.author.slice(0,1).toUpperCase()}</div>
                                <div>
                                    <div className="activity-text">{a.text}</div>
                                    <div className="muted small">{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectsPage({ projects, onAdd }) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    function add(e){
        e.preventDefault();
        if(!name.trim()) return;
        onAdd({ name: name.trim(), description: desc.trim() || 'Без описания' });
        setName("");
        setDesc("");
    }
    return (
        <div className="content">
            <form className="panel toolbar" onSubmit={add}>
                <input className="input" placeholder="Название проекта" value={name} onChange={e=>setName(e.target.value)} />
                <input className="input" placeholder="Краткое описание" value={desc} onChange={e=>setDesc(e.target.value)} />
                <button className="button" type="submit"><Icon name="plus"/>Добавить</button>
            </form>
            <div className="grid" style={{ marginTop: 16 }}>
                {projects.map(p => (
                    <div key={p.id} className="panel card">
                        <div className="card-head">
                            <div className="dot" style={{ background: p.color }} />
                            <div className="card-title">{p.name}</div>
                        </div>
                        <div className="muted" style={{ marginTop: 8 }}>{p.description}</div>
                        <div className="progress large" style={{ marginTop: 12 }}><span style={{ width: p.progress + '%', background: p.color }} /></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function monthMatrix(d){
    const year=d.getFullYear();
    const month=d.getMonth();
    const first=new Date(year,month,1);
    const start=new Date(first);
    start.setDate(first.getDay()===0? -5 : 1 - (first.getDay()-1));
    const days=[];
    for(let i=0;i<42;i++){
        const cur=new Date(start);
        cur.setDate(start.getDate()+i);
        days.push(cur);
    }
    return days;
}

function CalendarPage({ events, onAddEvent }){
    const [current, setCurrent]=useState(new Date());
    const days=useMemo(()=>monthMatrix(current),[current]);
    const [title,setTitle]=useState("");
    const [date,setDate]=useState("");
    function add(e){
        e.preventDefault();
        if(!title.trim()||!date) return;
        onAddEvent({ title: title.trim(), date });
        setTitle("");
        setDate("");
    }
    return (
        <div className="content">
            <div className="panel calendar-head">
                <div className="calendar-title">{current.toLocaleString('ru-RU',{ month:'long', year:'numeric'})}</div>
                <div className="calendar-actions">
                    <button className="button" onClick={()=>setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1))}>‹</button>
                    <button className="button" onClick={()=>setCurrent(new Date())}>Сегодня</button>
                    <button className="button" onClick={()=>setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1))}>›</button>
                    <form className="inline" onSubmit={add}>
                        <input className="input" placeholder="Событие" value={title} onChange={e=>setTitle(e.target.value)} />
                        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
                        <button className="button" type="submit">+ Событие</button>
                    </form>
                </div>
            </div>
            <div className="calendar-grid">
                {["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"].map((d,i)=>(<div key={i} className="dow muted small">{d}</div>))}
                {days.map((d,i)=>{
                    const key=d.toISOString().slice(0,10);
                    const dayEvents=events.filter(e=>e.date===key);
                    const isCur=d.getMonth()===current.getMonth();
                    return (
                        <div key={i} className={`day ${isCur? 'cur':''}`}>
                            <div className="day-num">{d.getDate()}</div>
                            {dayEvents.map((e,idx)=>(<div key={idx} className="pill">{e.title}</div>))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TeamPage({ presence }){
    return (
        <div className="content">
            <div className="panel" style={{marginTop:0}}>
                <div className="panel-title">Участники онлайн</div>
                <div className="stack" style={{marginTop:8}}>
                    {presence.length===0 && <div className="muted">Никого нет в сети</div>}
                    {presence.map((name,i)=>(
                        <div key={i} className="team-row" style={{display:'flex',alignItems:'center',gap:10}}>
                            <div className="avatar large">{name.slice(0,1).toUpperCase()}</div>
                            <div className="team-name">{name}</div>
                            <div className="muted">Онлайн</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SearchPage(){
    const [q,setQ]=useState("");
    const [res,setRes]=useState({ projects:[], messages:[], events:[] });
    const [loading,setLoading]=useState(false);
    function run(e){
        if(e) e.preventDefault();
        const s=q.trim();
        if(!s){ setRes({ projects:[], messages:[], events:[] }); return; }
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(s)}`).then(r=>r.json()).then(setRes).finally(()=>setLoading(false));
    }
    return (
        <div className="content">
            <form className="panel toolbar" onSubmit={run}>
                <input className="input" placeholder="Поиск по проектам, событиям и сообщениям" value={q} onChange={e=>setQ(e.target.value)} />
                <button className="button" type="submit">Найти</button>
            </form>
            <div className="grid" style={{marginTop:16}}>
                <div className="panel">
                    <div className="panel-title">Проекты {loading? '…' : ''}</div>
                    <div className="stack" style={{marginTop:8}}>
                        {res.projects.length===0 && <div className="muted">Ничего не найдено</div>}
                        {res.projects.map(p=> (
                            <a key={p.id} href={`#/projects/${p.id}`} className="activity">
                                <div className="dot" style={{ background: p.color, width:10, height:10, borderRadius:9999, marginRight:10 }} />
                                <div>
                                    <div className="activity-text">{p.name}</div>
                                    <div className="muted small">{p.description}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-title">События</div>
                    <div className="stack" style={{marginTop:8}}>
                        {res.events.length===0 && <div className="muted">Ничего не найдено</div>}
                        {res.events.map(e=> (
                            <div key={e.id} className="activity">
                                <div className="activity-text">{e.title}</div>
                                <div className="muted small">{e.date}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-title">Сообщения</div>
                    <div className="stack" style={{marginTop:8}}>
                        {res.messages.length===0 && <div className="muted">Ничего не найдено</div>}
                        {res.messages.map(m=> (
                            <div key={m.id} className="activity">
                                <div className="avatar">{(m.author||'?').slice(0,1).toUpperCase()}</div>
                                <div>
                                    <div className="activity-text">{m.text}</div>
                                    <div className="muted small">{m.author} • {m.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MessagesPage({ meId, meName, messages, onSend, onDelete }){
    const [text,setText]=useState("");
    function send(e){
        e.preventDefault();
        if(!text.trim()) return;
        onSend(text.trim());
        setText("");
    }
    function tryDelete(id){
        if(confirm('Удалить это сообщение?')) onDelete(id);
    }
    return (
        <div className="content">
            <div className="panel" style={{ height: 360, overflow: 'auto' }}>
                <div className="stack">
                    {messages.map((m)=>(
                        <div key={m.id} className="activity">
                            <div className="avatar">{(m.author||'?').slice(0,1).toUpperCase()}</div>
                            <div>
                                <div className="activity-text">{m.text}</div>
                                <div className="muted small">{m.author} • {m.time}</div>
                            </div>
                            {m.authorId===meId && (
                                <div style={{marginLeft:'auto'}}>
                                    <button className="button" onClick={()=>tryDelete(m.id)}>Удалить</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <form className="toolbar panel" onSubmit={send}>
                <input className="input" placeholder={`Сообщение от ${meName}`} value={text} onChange={e=>setText(e.target.value)} />
                <button className="button" type="submit">Отправить</button>
            </form>
        </div>
    );
}

function SettingsPage({ theme, setTheme, meName, setMeName, onBroadcastName, onOpenAdmin, onQuickClear }){
    const [email,setEmail]=useState(localStorage.getItem('email')||"");
    const [notify,setNotify]=useState(true);
    useEffect(()=>{ localStorage.setItem('email', email); },[email]);
    return (
        <div className="content">
            <div className="panel grid-2">
                <div>
                    <div className="panel-title">Профиль</div>
                    <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                    <div className="panel-title" style={{marginTop:12}}>Никнейм</div>
                    <input className="input" placeholder="Ваш ник" value={meName} onChange={e=>setMeName(e.target.value)} onBlur={onBroadcastName} />
                </div>
                <div>
                    <div className="panel-title">Тема</div>
                    <div className="toolbar">
                        <button className="button" onClick={()=>setTheme('light')}>Светлая</button>
                        <button className="button" onClick={()=>setTheme('dark')}>Тёмная</button>
                        <div className="muted small">Текущая: {theme==='dark' ? 'dark' : 'light'}</div>
                    </div>
                </div>
            </div>
            <div className="panel" style={{marginTop:16}}>
                <div className="panel-title">Быстрые действия администратора</div>
                <div className="toolbar">
                    <button className="button" onClick={onQuickClear}>Очистить все сообщения</button>
                    <div className="muted small">Требуется пароль администратора</div>
                </div>
            </div>
            <div className="panel" style={{marginTop:16}}>
                <div className="panel-title">Администрирование</div>
                <div className="toolbar">
                    <button className="button" onClick={onOpenAdmin}>Открыть админ‑панель</button>
                </div>
            </div>
        </div>
    );
}

function AppShell(){
    const { path, navigate } = useHashPath();
    const [projects, setProjects] = useState([]);
    const [team,setTeam]=useState([]);
    const [activities,setActivities]=useState([
        { author:'Д.К.', text:'Завершил задачу Интеграция с API банка', time:'2 часа назад' },
        { author:'А.Н.', text:'Создала новый проект Мобильное приложение', time:'4 часа назад' },
        { author:'А.Т.', text:'Обновила статус Тестирование безопасности', time:'6 часов назад' }
    ]);
    const [events,setEvents]=useState([]);
    const [messages,setMessages]=useState([]);
    const [presence,setPresence]=useState([]);
    const [adminOpen,setAdminOpen]=useState(false);
    const [adminPw,setAdminPw]=useState('');
    const [adminSel,setAdminSel]=useState({ messages:true, projects:false, events:false });
    const [meId] = useState(()=>{
        let v = sessionStorage.getItem('meId');
        if(!v){ v = 't'+Date.now()+String(Math.floor(Math.random()*100000)); sessionStorage.setItem('meId', v); }
        return v;
    });
    const [meName, setMeNameState] = useState(()=>{
        let n = sessionStorage.getItem('meName');
        if(!n){ n = `Пользователь-${Math.floor(Math.random()*1000)}`; sessionStorage.setItem('meName', n); }
        return n;
    });
    function setMeName(v){ setMeNameState(v); sessionStorage.setItem('meName', v); }

    const [theme,setThemeState]=useState('dark');
    useEffect(()=>{
        const initialTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.dataset.theme = initialTheme;
        setThemeState(initialTheme);
        fetch('/api/projects').then(r=>r.json()).then(setProjects).catch(()=>{});
        fetch('/api/messages').then(r=>r.json()).then(setMessages).catch(()=>{});
        fetch('/api/events').then(r=>r.json()).then(setEvents).catch(()=>{});
        const s = io();
        s.emit('presence:hello', meName);
        s.on('presence:list', setPresence);
        s.on('message:new', (m)=>setMessages(prev=>[...prev, m]));
        s.on('message:delete', (id)=>setMessages(prev=>prev.filter(m=>m.id!==id)));
        s.on('projects:created', (p)=>setProjects(prev=> prev.some(x=>x.id===p.id) ? prev : [p, ...prev]));
        s.on('projects:updated', (p)=>setProjects(prev=>prev.map(x=>x.id===p.id? p:x)));
        s.on('projects:deleted', (id)=>setProjects(prev=>prev.filter(x=>x.id!==id)));
        s.on('activity:new', (a)=>setActivities(prev=>[a, ...prev]));
        s.on('admin:cleared', ()=>{ refreshAll(); });
        window.__socket__ = s;
        return ()=>{ s.disconnect(); };
    },[]);

    function broadcastName(){
        if(window.__socket__){ window.__socket__.emit('presence:hello', meName); }
    }

    function setTheme(t){
        document.documentElement.dataset.theme = t;
        localStorage.setItem('theme', t);
        setThemeState(t);
    }

    const [toast,setToast]=useState("");
    function showToast(msg){
        setToast(msg);
        setTimeout(()=>setToast(""), 1800);
    }

    function refreshAll(){
        fetch('/api/projects').then(r=>r.json()).then(setProjects).catch(()=>{});
        fetch('/api/messages').then(r=>r.json()).then(setMessages).catch(()=>{});
        fetch('/api/events').then(r=>r.json()).then(setEvents).catch(()=>{});
    }

    function addProject({ name, description }){
        fetch('/api/projects',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name, description }) })
            .then(r=>r.json()).then(()=>{
                navigate('/projects');
            });
    }
    function saveProject(id, data){
        fetch(`/api/projects/${id}`,{ method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(data) })
            .then(r=>r.json()).then(p=>{
                setProjects(prev=>prev.map(x=>x.id===p.id? p : x));
                showToast(p.progress===100 ? 'команда мечты!' : 'Успешно сохранено');
                navigate('/projects');
            });
    }
    function deleteProject(id){
        fetch(`/api/projects/${id}`,{ method:'DELETE' })
            .then(r=>r.json()).then(p=>{
                setProjects(prev=>prev.filter(x=>x.id!==id));
                navigate('/projects');
            });
    }
    function addMember(m){ setTeam(prev=>[m,...prev]); }
    function addEvent(e){ setEvents(prev=>[e,...prev]); }
    function sendMessage(text){
        fetch('/api/messages',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ authorId: meId, author: meName, text }) });
    }
    function deleteMessage(id){
        fetch(`/api/messages/${id}`,{ method:'DELETE', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ authorId: meId }) });
    }

    function createRoom(name, password){
        if(!name) return;
        fetch('/api/rooms/create',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ room: name, password }) })
            .then(r=>{ if(!r.ok) throw new Error('room'); return r.json(); })
            .then(()=> setRoom(name))
            .catch(()=> alert('Комната уже существует или ошибка'));
    }
    function joinRoom(id, password){
        if(!id) return;
        fetch('/api/rooms/check',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ room:id, password }) })
            .then(r=>{ if(!r.ok) throw new Error('auth'); return r.json(); })
            .then(()=> setRoom(id))
            .catch(()=> alert('Неверный ID или пароль'));
    }

    function openAdmin(){ setAdminOpen(true); }
    function runAdminClear(){
        const what = Object.entries(adminSel).filter(([,v])=>v).map(([k])=>k);
        fetch('/api/admin/clear',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ password: adminPw, what }) })
            .then(r=>{ if(!r.ok) throw 0; return r.json(); })
            .then(()=>{ setAdminOpen(false); setAdminPw(''); refreshAll(); })
            .catch(()=> alert('Неверный пароль'));
    }
    function quickClearMessages(){
        const pw = prompt('Пароль администратора');
        if(!pw) return;
        fetch('/api/admin/clear/messages',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ password: pw }) })
            .then(r=>{ if(!r.ok) throw 0; return r.json(); })
            .then(()=> refreshAll())
            .catch(()=> alert('Неверный пароль или ошибка запроса'));
    }

    const headerTitle = useMemo(()=>{
        if(path.startsWith('/projects/')){
            const p = projects.find(p=>p.id===path.split('/')[2]);
            return p?.name || 'Проект';
        }
        if(path==='/projects') return 'Проекты';
        if(path==='/calendar') return 'Календарь';
        if(path==='/team') return 'Команда';
        if(path==='/messages') return 'Сообщения';
        if(path==='/settings') return 'Настройки';
        if(path==='/search') return 'Поиск';
        if(path==='/kanban') return 'Канбан';
        if(path==='/notifications') return 'Уведомления';
        return 'Главная';
    },[path, projects]);

    return (
        <div className="layout">
            <Sidebar projects={projects} team={team} path={path} />
            <main className="main">
                <Topbar navigate={navigate} />
                <Subnav title={headerTitle} />
                {path==='/' && <HomePage projects={projects} activities={activities} path={path} navigate={navigate} />}
                {path==='/projects' && <ProjectsPage projects={projects} onAdd={addProject} />}
                {path.startsWith('/projects/') && (
                    <ProjectDetail
                        project={projects.find(p=>p.id===path.split('/')[2])}
                        onSave={saveProject}
                        onDelete={deleteProject}
                    />
                )}
                {path==='/calendar' && <CalendarPage events={events} onAddEvent={addEvent} />}
                {path==='/team' && <TeamPage presence={presence} />}
                {path==='/search' && <SearchPage />}
                {path==='/messages' && <MessagesPage meId={meId} meName={meName} messages={messages} onSend={sendMessage} onDelete={deleteMessage} />}
                {path==='/settings' && <SettingsPage theme={theme} setTheme={setTheme} meName={meName} setMeName={setMeName} onBroadcastName={broadcastName} onOpenAdmin={openAdmin} onQuickClear={quickClearMessages} />}
                {path==='/settings' && adminOpen && (
                    <div className="panel" style={{marginTop:16}}>
                        <div className="panel-title">Админ‑панель</div>
                        <div className="toolbar">
                            <input className="input" placeholder="Пароль администратора" type="password" value={adminPw} onChange={e=>setAdminPw(e.target.value)} />
                            <label><input type="checkbox" checked={adminSel.messages} onChange={e=>setAdminSel(s=>({...s,messages:e.target.checked}))}/> Сообщения</label>
                            <label><input type="checkbox" checked={adminSel.projects} onChange={e=>setAdminSel(s=>({...s,projects:e.target.checked}))}/> Проекты</label>
                            <label><input type="checkbox" checked={adminSel.events} onChange={e=>setAdminSel(s=>({...s,events:e.target.checked}))}/> События</label>
                            <button className="button" onClick={runAdminClear}>Очистить</button>
                        </div>
                    </div>
                )}
                {['/kanban','/notifications'].includes(path) && <Placeholder title="Скоро здесь будет страница" note={path.replace('/','')} />}
                {toast && (
                    <div style={{position:'fixed', right:16, bottom:16, background:'rgba(0,0,0,0.7)', color:'#fff', padding:'10px 12px', borderRadius:10}}>{toast}</div>
                )}
            </main>
        </div>
    );
}

function App(){
    return <AppShell />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
