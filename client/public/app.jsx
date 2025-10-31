const { useState } = React;

function Header() {
	return (
		<header className="app-header">
			<div className="brand">
				<span className="brand-accent">Co</span>Work Platform
			</div>
		</header>
	);
}

function ProjectCard({ project }) {
	return (
		<div className="panel">
			<h3 className="card-title">{project.name}</h3>
			<p className="muted">{project.description}</p>
		</div>
	);
}

function NewProjectForm({ onAdd }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	function submit(e) {
		e.preventDefault();
		if (!name.trim()) return;
		onAdd({ name: name.trim(), description: description.trim() || "Без описания" });
		setName("");
		setDescription("");
	}

	return (
		<form className="panel toolbar" onSubmit={submit}>
			<input className="input" placeholder="Название проекта" value={name} onChange={(e) => setName(e.target.value)} />
			<input className="input" placeholder="Краткое описание" value={description} onChange={(e) => setDescription(e.target.value)} />
			<button className="button" type="submit">Добавить</button>
		</form>
	);
}

function ProjectList() {
	const [projects, setProjects] = useState([
		{ name: 'Онбординг команды', description: 'Стартовые задачи и роли' },
		{ name: 'MVP Канбан', description: 'Доска задач и статусы' },
	]);

	function addProject(p) {
		setProjects((prev) => [p, ...prev]);
	}

	return (
		<section>
			<NewProjectForm onAdd={addProject} />
			<div className="grid" style={{ marginTop: 16 }}>
				{projects.map((p, idx) => (
					<ProjectCard key={idx} project={p} />
				))}
			</div>
		</section>
	);
}

function App() {
	return (
		<div>
			<Header />
			<div className="panel" style={{ marginTop: 8, marginBottom: 16 }}>
				<p className="muted">Создание веб‑платформы для совместной работы над проектами.</p>
			</div>
			<ProjectList />
		</div>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


