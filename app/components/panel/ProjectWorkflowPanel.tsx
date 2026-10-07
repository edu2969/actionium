"use client";

import type { FormEvent } from "react";

export interface WorkflowTodo {
    title: string;
    hours: number;
    finishedAt: string | null;
}

export interface WorkflowLog {
    collaboratorId: string;
    date: string;
    entry: string;
}

export interface WorkflowTask {
    id: string;
    identifier: number;
    priority: number;
    title: string;
    taskType: number;
    status: number;
    weight: number;
    estimatedWeight: number;
    description: string;
    assignedTo?: string;
    startDate: string | null;
    endDate: string | null;
    progress: number;
    todos: WorkflowTodo[];
    logs: WorkflowLog[];
}

export interface WorkflowProject {
    title: string;
}

export interface WorkflowUser {
    id: string;
    name: string;
}

export interface WorkflowTaskForm {
    title: string;
    taskType: string;
    status: string;
    assignedTo: string;
    description: string;
    startDate: string;
    endDate: string;
    todos: WorkflowTodo[];
    logs: WorkflowLog[];
}

export interface WorkflowSprint {
    taskTitles: string[];
    todoTitles: string[];
    hours: number;
    completedHours: number;
    startDate: Date | null;
    endDate: Date | null;
}

interface ProjectWorkflowPanelProps {
    view: "tasks" | "sprints" | "edit-task";
    project: WorkflowProject;
    tasks: WorkflowTask[];
    users: WorkflowUser[];
    taskForm: WorkflowTaskForm;
    sprints: WorkflowSprint[];
    isLoading: boolean;
    error: string | null;
    isSaving: boolean;
    onAddTask: () => void;
    onEditTask: (task: WorkflowTask) => void;
    onTaskFormChange: (
        update: (current: WorkflowTaskForm) => WorkflowTaskForm
    ) => void;
    onSaveTask: (event: FormEvent<HTMLFormElement>) => void;
}

const TASK_TYPE_OPTIONS = [
    { value: "1", label: "Desarrollo" },
    { value: "2", label: "Corrección" },
    { value: "3", label: "Garantía" },
    { value: "4", label: "Terreno" },
    { value: "5", label: "Gestión" },
    { value: "6", label: "Capacitación" },
];

const TASK_STATUS_OPTIONS = [
    { value: "0", label: "En definición" },
    { value: "1", label: "Activo" },
    { value: "2", label: "Inactivo" },
    { value: "3", label: "Cerrado" },
];

function TaskList({
    project,
    tasks,
    isLoading,
    error,
    onAddTask,
    onEditTask,
}: ProjectWorkflowPanelProps) {
    return (
        <>
            <p className="control-panel-kicker">{project.title}</p>
            <div className="control-panel-contract-heading">
                <h2 className="control-panel-title">Tareas</h2>
                <button
                    className="control-panel-primary-button control-panel-contract-add"
                    onClick={onAddTask}
                    type="button"
                >
                    Agregar tarea
                </button>
            </div>
            {isLoading ? (
                <p className="control-panel-copy" role="status">
                    Cargando tareas...
                </p>
            ) : error ? (
                <p className="control-panel-archive-error" role="alert">
                    {error}
                </p>
            ) : tasks.length > 0 ? (
                <div className="control-panel-list">
                    {tasks.map((task) => (
                        <button
                            className="control-panel-list-item"
                            key={task.id}
                            onClick={() => onEditTask(task)}
                            type="button"
                        >
                            <span>
                                #{task.identifier} · {task.title}
                            </span>
                            <span>
                                {TASK_TYPE_OPTIONS.find(
                                    (option) =>
                                        Number(option.value) === task.taskType
                                )?.label ?? "Tarea"}{" "}
                                ·{" "}
                                {TASK_STATUS_OPTIONS.find(
                                    (option) =>
                                        Number(option.value) === task.status
                                )?.label ?? "Sin estado"}{" "}
                                · {Math.round(task.progress)}% · {task.weight ?? 0}
                                h
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="control-panel-copy">
                    Este proyecto aún no tiene tareas. Agrega una para organizar
                    el trabajo por sprints.
                </p>
            )}
        </>
    );
}

function SprintList({
    project,
    sprints,
    isLoading,
    error,
}: ProjectWorkflowPanelProps) {
    const totalHours = sprints.reduce((sum, sprint) => sum + sprint.hours, 0);
    const completedHours = sprints.reduce(
        (sum, sprint) => sum + sprint.completedHours,
        0
    );

    return (
        <>
            <p className="control-panel-kicker">{project.title}</p>
            <h2 className="control-panel-title">Sprints</h2>
            {isLoading ? (
                <p className="control-panel-copy" role="status">
                    Calculando sprints...
                </p>
            ) : error ? (
                <p className="control-panel-archive-error" role="alert">
                    {error}
                </p>
            ) : sprints.length > 0 ? (
                <>
                    <div className="control-panel-sprint-summary">
                        <span>{sprints.length} sprints · {totalHours} h</span>
                        <strong>
                            {totalHours > 0
                                ? Math.round(
                                      (completedHours / totalHours) * 100
                                  )
                                : 0}
                            completado
                        </strong>
                    </div>
                    <div className="control-panel-sprint-list">
                        {sprints.map((sprint, index) => {
                            const progress =
                                sprint.hours > 0
                                    ? Math.round(
                                          (sprint.completedHours /
                                              sprint.hours) *
                                              100
                                      )
                                    : 0;
                            return (
                                <article
                                    className="control-panel-sprint-card"
                                    key={`${index}-${sprint.taskTitles[0]}`}
                                >
                                    <div className="control-panel-sprint-heading">
                                        <h3>
                                            Sprint{" "}
                                            {String(index + 1).padStart(2, "0")}
                                        </h3>
                                        <span>{sprint.hours} h</span>
                                    </div>
                                    <div
                                        aria-label={`Avance ${progress}%`}
                                        className="control-panel-sprint-progress"
                                    >
                                        <span
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p>
                                        {progress}% ·{" "}
                                        {sprint.startDate
                                            ? sprint.startDate.toLocaleDateString(
                                                  "es-CL"
                                              )
                                            : "Inicio por definir"}{" "}
                                        –{" "}
                                        {sprint.endDate
                                            ? sprint.endDate.toLocaleDateString(
                                                  "es-CL"
                                              )
                                            : "Fin por definir"}
                                    </p>
                                    <p>{sprint.taskTitles.join(", ")}</p>
                                    <small>{sprint.todoTitles.join(" · ")}</small>
                                </article>
                            );
                        })}
                    </div>
                </>
            ) : (
                <p className="control-panel-copy">
                    Aún no hay TODOs estimados para calcular sprints. Agrega
                    tareas con subtareas y horas.
                </p>
            )}
        </>
    );
}

function TaskEditor({
    project,
    users,
    taskForm,
    isLoading,
    error,
    isSaving,
    onTaskFormChange,
    onSaveTask,
}: ProjectWorkflowPanelProps) {
    const updateTodo = (
        index: number,
        update: (todo: WorkflowTodo) => WorkflowTodo
    ) =>
        onTaskFormChange((current) => ({
            ...current,
            todos: current.todos.map((todo, todoIndex) =>
                todoIndex === index ? update(todo) : todo
            ),
        }));

    return (
        <div className="control-panel-task-editor">
            <div className="control-panel-task-editor-heading">
                <p className="control-panel-kicker">Editar tarea</p>
                <h2 className="control-panel-title">
                    {taskForm.title || project.title}
                </h2>
            </div>
            {isLoading ? (
                <p className="control-panel-copy" role="status">
                    Cargando tarea...
                </p>
            ) : error ? (
                <p className="control-panel-archive-error" role="alert">
                    {error}
                </p>
            ) : (
                <form
                    className="control-panel-task-form"
                    id="edit-task-form"
                    onSubmit={onSaveTask}
                >
                    <div className="control-panel-task-form-fields">
                        <label className="control-panel-field control-panel-field-wide">
                            <span>Título *</span>
                            <input
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        title: event.target.value,
                                    }))
                                }
                                required
                                value={taskForm.title}
                            />
                        </label>
                        <label className="control-panel-field">
                            <span>Tipo</span>
                            <select
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        taskType: event.target.value,
                                    }))
                                }
                                value={taskForm.taskType}
                            >
                                {TASK_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="control-panel-field">
                            <span>Estado</span>
                            <select
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        status: event.target.value,
                                    }))
                                }
                                value={taskForm.status}
                            >
                                {TASK_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="control-panel-field control-panel-field-wide">
                            <span>Asignado a</span>
                            <select
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        assignedTo: event.target.value,
                                    }))
                                }
                                value={taskForm.assignedTo}
                            >
                                <option value="">Sin asignar</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="control-panel-field control-panel-field-wide">
                            <span>Fecha de inicio</span>
                            <input
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        startDate: event.target.value,
                                    }))
                                }
                                type="date"
                                value={taskForm.startDate}
                            />
                        </label>
                        <label className="control-panel-field control-panel-field-wide">
                            <span>Fecha estimada de término</span>
                            <input
                                readOnly
                                type="date"
                                value={taskForm.endDate}
                            />
                        </label>
                        <label className="control-panel-field control-panel-field-wide">
                            <span>Descripción</span>
                            <textarea
                                onChange={(event) =>
                                    onTaskFormChange((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                rows={3}
                                value={taskForm.description}
                            />
                        </label>
                        <section className="control-panel-field control-panel-field-wide control-panel-todos">
                            <div className="control-panel-contract-heading">
                                <span>TODOs y horas</span>
                                <button
                                    className="control-panel-secondary-button control-panel-contract-add"
                                    onClick={() =>
                                        onTaskFormChange((current) => ({
                                            ...current,
                                            todos: [
                                                ...current.todos,
                                                {
                                                    title: "",
                                                    hours: 0,
                                                    finishedAt: null,
                                                },
                                            ],
                                        }))
                                    }
                                    type="button"
                                >
                                    Agregar TODO
                                </button>
                            </div>
                            {taskForm.todos.map((todo, index) => (
                                <div className="control-panel-todo-row" key={index}>
                                    <input
                                        aria-label="TODO completado"
                                        checked={Boolean(todo.finishedAt)}
                                        onChange={(event) =>
                                            updateTodo(index, (current) => ({
                                                ...current,
                                                finishedAt: event.target.checked
                                                    ? new Date().toISOString()
                                                    : null,
                                            }))
                                        }
                                        type="checkbox"
                                    />
                                    <input
                                        aria-label="Título del TODO"
                                        onChange={(event) =>
                                            updateTodo(index, (current) => ({
                                                ...current,
                                                title: event.target.value,
                                            }))
                                        }
                                        required
                                        value={todo.title}
                                    />
                                    <input
                                        aria-label="Horas estimadas del TODO"
                                        min="0"
                                        onChange={(event) =>
                                            updateTodo(index, (current) => ({
                                                ...current,
                                                hours: Number(event.target.value),
                                            }))
                                        }
                                        required
                                        step="0.5"
                                        type="number"
                                        value={todo.hours}
                                    />
                                    <button
                                        aria-label="Eliminar TODO"
                                        className="control-panel-todo-remove"
                                        onClick={() =>
                                            onTaskFormChange((current) => ({
                                                ...current,
                                                todos: current.todos.filter(
                                                    (_, todoIndex) =>
                                                        todoIndex !== index
                                                ),
                                            }))
                                        }
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <strong>
                                Total:{" "}
                                {taskForm.todos.reduce(
                                    (sum, todo) => sum + todo.hours,
                                    0
                                )}
                                h
                            </strong>
                        </section>
                        <section className="control-panel-field control-panel-field-wide control-panel-todos">
                            <div className="control-panel-contract-heading">
                                <span>Bitácora</span>
                                <button
                                    className="control-panel-secondary-button control-panel-contract-add"
                                    onClick={() =>
                                        onTaskFormChange((current) => ({
                                            ...current,
                                            logs: [
                                                ...current.logs,
                                                {
                                                    collaboratorId: "",
                                                    date: new Date().toISOString(),
                                                    entry: "",
                                                },
                                            ],
                                        }))
                                    }
                                    type="button"
                                >
                                    Agregar registro
                                </button>
                            </div>
                            {taskForm.logs.map((log, index) => (
                                <div className="control-panel-log-row" key={index}>
                                    <select
                                        aria-label="Colaborador"
                                        onChange={(event) =>
                                            onTaskFormChange((current) => ({
                                                ...current,
                                                logs: current.logs.map(
                                                    (item, itemIndex) =>
                                                        itemIndex === index
                                                            ? {
                                                                  ...item,
                                                                  collaboratorId:
                                                                      event.target
                                                                          .value,
                                                              }
                                                            : item
                                                ),
                                            }))
                                        }
                                        required
                                        value={log.collaboratorId}
                                    >
                                        <option value="">Colaborador</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        aria-label="Fecha de bitácora"
                                        onChange={(event) =>
                                            onTaskFormChange((current) => ({
                                                ...current,
                                                logs: current.logs.map(
                                                    (item, itemIndex) =>
                                                        itemIndex === index
                                                            ? {
                                                                  ...item,
                                                                  date: new Date(
                                                                      `${event.target.value}T08:00:00`
                                                                  ).toISOString(),
                                                              }
                                                            : item
                                                ),
                                            }))
                                        }
                                        required
                                        type="date"
                                        value={
                                            log.date
                                                ? new Date(log.date)
                                                      .toISOString()
                                                      .slice(0, 10)
                                                : ""
                                        }
                                    />
                                    <textarea
                                        aria-label="Detalle de bitácora"
                                        onChange={(event) =>
                                            onTaskFormChange((current) => ({
                                                ...current,
                                                logs: current.logs.map(
                                                    (item, itemIndex) =>
                                                        itemIndex === index
                                                            ? {
                                                                  ...item,
                                                                  entry: event.target
                                                                      .value,
                                                              }
                                                            : item
                                                ),
                                            }))
                                        }
                                        required
                                        rows={2}
                                        value={log.entry}
                                    />
                                    <button
                                        aria-label="Eliminar registro"
                                        className="control-panel-todo-remove"
                                        onClick={() =>
                                            onTaskFormChange((current) => ({
                                                ...current,
                                                logs: current.logs.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index
                                                ),
                                            }))
                                        }
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </section>
                    </div>
                </form>
            )}
            {!isLoading && !error && (
                <div className="control-panel-task-form-actions">
                    <button
                        className="control-panel-task-save"
                        disabled={isSaving}
                        form="edit-task-form"
                        type="submit"
                    >
                        {isSaving ? "GUARDANDO..." : "GUARDAR"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ProjectWorkflowPanel(props: ProjectWorkflowPanelProps) {
    switch (props.view) {
        case "tasks":
            return <TaskList {...props} />;
        case "sprints":
            return <SprintList {...props} />;
        case "edit-task":
            return <TaskEditor {...props} />;
    }
}
