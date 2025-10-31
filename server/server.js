const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use((_req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
	console.log(`✅ Server is running at http://localhost:${PORT}`);
});
