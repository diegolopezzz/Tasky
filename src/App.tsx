import { useEffect, useState, type FormEvent } from "react";

type Category = "Trabajo" | "Hogar" | "Salud";
type Priority = "Alta" | "Media" | "Baja";

type Task = {
  id: number;
  title: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  done: boolean;
};

type Habit = {
  id: number;
  title: string;
  detail: string;
  done: boolean;
  emoji: string;
};

type NewTask = Pick<Task, "title" | "category" | "priority" | "dueDate">;

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Terminar informe de Ingeniería de Software",
    category: "Trabajo",
    priority: "Alta",
    dueDate: "Hoy",
    done: false,
  },
  {
    id: 2,
    title: "Comprar despensa de la semana",
    category: "Hogar",
    priority: "Media",
    dueDate: "Mañana",
    done: false,
  },
  {
    id: 3,
    title: "Rutina de ejercicio de 30 min",
    category: "Salud",
    priority: "Baja",
    dueDate: "18 Oct",
    done: false,
  },
];

const initialHabits: Habit[] = [
  { id: 1, title: "Meditar", detail: "10 min", done: false, emoji: "🧘" },
  {
    id: 2,
    title: "Tomar 2L de agua",
    detail: "8 vasos al día",
    done: false,
    emoji: "💧",
  },
  { id: 3, title: "Leer", detail: "15 páginas", done: false, emoji: "📖" },
];

const emptyNewTask: NewTask = {
  title: "",
  category: "Trabajo",
  priority: "Media",
  dueDate: "",
};

function readStoredData<T>(key: string, fallback: T): T {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return fallback;

  try {
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`No se pudieron leer los datos guardados (${key}).`, error);
    return fallback;
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>(emptyNewTask);

  useEffect(() => {
    setTasks(readStoredData("tasky_tasks", initialTasks));
    setHabits(readStoredData("tasky_habits", initialHabits));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem("tasky_tasks", JSON.stringify(tasks));
      localStorage.setItem("tasky_habits", JSON.stringify(habits));
    } catch (error) {
      console.error("No se pudieron guardar las tareas y hábitos.", error);
    }
  }, [tasks, habits, isLoaded]);

  const completedItems =
    tasks.filter((task) => task.done).length +
    habits.filter((habit) => habit.done).length;
  const totalItems = tasks.length + habits.length;
  const progress =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const urgentTask = tasks.find(
    (task) =>
      !task.done && (task.priority === "Alta" || task.dueDate === "Hoy"),
  );

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function toggleHabit(id: number) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit,
      ),
    );
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.title.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      {
        ...newTask,
        id: Date.now(),
        title,
        dueDate: newTask.dueDate.trim() || "Próximamente",
        done: false,
      },
    ]);
    setNewTask(emptyNewTask);
    setShowAddModal(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#resumen">
          <span aria-hidden="true">✓</span> Tasky
        </a>
        <nav className="navigation" aria-label="Navegación principal">
          <a className="navigation-link active" href="#resumen">
            ◫ <span>Resumen</span>
          </a>
          <a className="navigation-link" href="#tareas">
            ☷ <span>Mis tareas</span>
          </a>
          <a className="navigation-link" href="#habitos">
            ♡ <span>Hábitos</span>
          </a>
        </nav>
        <p className="sidebar-note">Pequeños pasos, grandes logros.</p>
      </aside>

      <div className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Tu espacio personal</p>
            <h1>¡Hola! 👋</h1>
            <p className="muted">Esto es lo que puedes avanzar hoy.</p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setShowAddModal(true)}
          >
            <span aria-hidden="true">＋</span> Nueva tarea
          </button>
        </header>

        <section className="panel progress-panel" id="resumen">
          <div className="progress-heading">
            <div>
              <p className="eyebrow">Tu progreso de hoy</p>
              <h2>
                {completedItems} de {totalItems} actividades completadas
              </h2>
            </div>
            <strong className="progress-number">{progress}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progreso de actividades"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-value" style={{ width: `${progress}%` }} />
          </div>
          {urgentTask && (
            <p className="reminder">
              <span aria-hidden="true">✦</span> Recuerda avanzar:{" "}
              <strong>{urgentTask.title}</strong>
            </p>
          )}
        </section>

        <section className="content-section" id="tareas">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Organízate</p>
              <h2>Mis tareas</h2>
            </div>
            <span className="item-count">{tasks.length}</span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              Aún no tienes tareas. Agrega una para comenzar.
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <label className="task-main">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Marcar "${task.title}" como ${
                        task.done ? "pendiente" : "completada"
                      }`}
                    />
                    <span className="task-copy">
                      <strong className={task.done ? "completed" : ""}>
                        {task.title}
                      </strong>
                      <small>
                        {task.category} <span aria-hidden="true">·</span>{" "}
                        {task.dueDate}
                      </small>
                    </span>
                  </label>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <button
                    className="icon-button delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Eliminar "${task.title}"`}
                    title="Eliminar tarea"
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="content-section" id="habitos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Rutinas que suman</p>
              <h2>Mis hábitos</h2>
            </div>
            <span className="item-count">{habits.length}</span>
          </div>
          <div className="habit-grid">
            {habits.map((habit) => (
              <label className="habit-card" key={habit.id}>
                <input
                  type="checkbox"
                  checked={habit.done}
                  onChange={() => toggleHabit(habit.id)}
                  aria-label={`Marcar "${habit.title}" como ${
                    habit.done ? "pendiente" : "completado"
                  }`}
                />
                <span className="habit-emoji" aria-hidden="true">
                  {habit.emoji}
                </span>
                <span className="habit-copy">
                  <strong className={habit.done ? "completed" : ""}>
                    {habit.title}
                  </strong>
                  <small>{habit.detail}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <button
          className="privacy-link"
          type="button"
          onClick={() => setShowPrivacy(true)}
        >
          Privacidad y almacenamiento
        </button>
      </div>

      {showAddModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddModal(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Un paso a la vez</p>
                <h2 id="add-task-title">Nueva tarea</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <form className="task-form" onSubmit={handleAddTask}>
              <label>
                Título
                <input
                  autoFocus
                  required
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask({ ...newTask, title: event.target.value })
                  }
                  placeholder="¿Qué necesitas hacer?"
                />
              </label>
              <div className="form-row">
                <label>
                  Categoría
                  <select
                    value={newTask.category}
                    onChange={(event) =>
                      setNewTask({
                        ...newTask,
                        category: event.target.value as Category,
                      })
                    }
                  >
                    <option value="Trabajo">Trabajo</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Salud">Salud</option>
                  </select>
                </label>
                <label>
                  Prioridad
                  <select
                    value={newTask.priority}
                    onChange={(event) =>
                      setNewTask({
                        ...newTask,
                        priority: event.target.value as Priority,
                      })
                    }
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </label>
              </div>
              <label>
                Fecha o recordatorio
                <input
                  value={newTask.dueDate}
                  onChange={(event) =>
                    setNewTask({ ...newTask, dueDate: event.target.value })
                  }
                  placeholder="Por ejemplo: Hoy o Mañana"
                />
              </label>
              <div className="form-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button className="button button-primary" type="submit">
                  Guardar tarea
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showPrivacy && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPrivacy(false);
          }}
        >
          <section
            className="modal privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Información</p>
                <h2 id="privacy-title">Tus datos</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowPrivacy(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p className="muted">
              Tus tareas y hábitos se guardan en el almacenamiento local de
              este navegador. No se envían a un servidor.
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setShowPrivacy(false)}
            >
              Entendido
            </button>
          </section>
        </div>
      )}
      <p>
        Proyecto final de la materia Ingeniería de software - Diego Alejandro
        López Santana - 222013939
      </p>
    </main>
  );
}
