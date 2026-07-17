"use client"
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgressbar } from "react-circular-progressbar";
import { forEach } from "lodash";
import dayjs from "dayjs";

function SprintsContent() {
    const [sprints, setSprints] = useState<SprintView[]>([]);
    const [project, setProject] = useState<ProjectFormType | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const initData = useRef(false);
    const params = useSearchParams();

    async function getProjectById() {
        const res = await fetch(`/api/projects/${params.get("projectId")}`);
        const data = await res.json();
        console.log("Project Data", data);
        setProject(data.project);
    }

    async function getSprints() {
        const res = await fetch(`/api/tasks?projectId=${params.get("projectId")}`);
        const data = await res.json();
        const tasks = data.tasks;
        var sprints: SprintItemView[] = [];
        let lastupdate = new Date();
        let currentSprintHours = 0;
        let sprintStartDate = dayjs(tasks[0].startDate);

        const calculateEstimatedEndDate = (startDate: Date, hours: number) => {
            let endDate = dayjs(startDate);
            let remainingHours = hours;

            while (remainingHours > 0) {
                if (endDate.day() === 0 || endDate.day() === 6) {
                    endDate = endDate.add(1, 'day');
                } else {
                    const workHours = Math.min(remainingHours, 8);
                    endDate = endDate.add(workHours, 'hour');
                    remainingHours -= workHours;
                }
            }
            return endDate.toDate();
        };

        console.log("INIT SPRINTS >>", sprints);
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            console.log("TASK -->", task);
            if (task.todos) {
                for (let j = 0; j < task.todos.length; j++) {
                    const todo = task.todos[j];
                    console.log("TODO >>>", todo);
                    if (currentSprintHours + todo.hours > 40 || sprints.length === 0) {
                        sprints.push({
                            title: task.title,
                            taskIndexFrom: todo.title,
                            taskIndexTo: "",
                            startDate: sprintStartDate.toDate(),
                            endDate: calculateEstimatedEndDate(sprintStartDate.toDate(), currentSprintHours),
                            percentaje: 0
                        });
                        currentSprintHours = 0;
                        sprintStartDate = dayjs(sprints[sprints.length - 1].endDate);
                    }
                    sprints[sprints.length - 1].taskIndexTo = todo.title;
                    if (currentSprintHours > 40) {
                        sprints[sprints.length - 1].title += "*";
                        currentSprintHours -= 40;
                        sprintStartDate = sprintStartDate.add(1, 'week');
                    }
                    if (todo.finishedAt != null && todo.finishedAt > lastupdate) {
                        lastupdate = todo.finishedAt;
                    }
                    currentSprintHours += todo.hours;
                    const completedTodos = task.todos.filter((todo: TodoType) => todo.finishedAt != null).length;
                    const totalTodos = task.todos.length;
                    const todoCompletionPercentage = (completedTodos / totalTodos) * 100;
                    sprints[sprints.length - 1].percentaje = todoCompletionPercentage;
                }
            }
        }

        const totalWeight = tasks.reduce((acc: number, task: TaskItemListType) => acc + task.weight, 0);
        const completedWeight = tasks.reduce((acc: number, task: TaskItemListType) => acc + (task.progress / 100) * task.weight, 0);
        const currentProgress = (completedWeight / totalWeight) * 100;

        const view: SprintView = {
            lastUpdate: lastupdate,
            endDate: currentProgress === 100 ? calculateEstimatedEndDate(sprintStartDate.toDate(), currentSprintHours) : null,
            estimatedEndDate: calculateEstimatedEndDate(sprintStartDate.toDate(), currentSprintHours),
            progress: currentProgress,
            sprints
        };

        console.log("VIEW", view);
        setView(view);
        setLoadingList(false);
    }

    useEffect(() => {
        if (!initData.current) {
            initData.current = true;
            getProjectById().then(() => {
                getSprints();
            });
        }
    }, []);

    return (
        <main className="pt-6 px-6 pb-16 mt-12 h-screen overflow-y-auto">
            <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                <div className="flex items-start space-x-4 text-ship-cove-800 pt-4">
                    <Link href="/">
                        <AiFillHome size="1.4rem" className="text-gray-700 dark:text-gray-300 ml-2" />
                    </Link>
                    <IoIosArrowForward size="1.5rem" className="text-gray-700 dark:text-gray-300" />
                    <Link href={`/homeneo/proyectos${params.get("contractId") ? '?contractId=' + params.get("contractId") : ''}`}>
                    <span className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300">PROYECTOS</span>
                    </Link>
                    <IoIosArrowForward size="1.5rem" className="text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300">SPRINTS</span>
                </div>
            </div>
            {sprints.length > 0 ? <>
                <div className="flex flex-wrap justify-center gap-4 uppercase">
                    {sprints.map((sprint, index) => (
                        <div key={index} className="w-[180px] m-2">
                            <div className="p-4 bg-ship-cove-800 rounded-lg shadow-lg">
                                <h3 className="text-center text-sm font-semibold text-gray-200">
                                    Sprint {String(index + 1).padStart(2, '0')}
                                </h3>
                                <div className="flex justify-center min-h-20 max-h-20 overflow-hidden text-ellipsis">
                                    <p className="text-center text-xs text-gray-400 mt-2 mb-2">
                                        {sprint.sprints.map(task => task.taskShortDescription).join(', ')}
                                    </p>
                                </div>
                                <div className="text-center text-4xl text-gray-300 mb-4 orbitron">
                                    {sprint.progress}<small>%</small>
                                </div>
                                <div className="w-full bg-ship-cove-300 h-4 dark:bg-gray-700 rounded-full">
                                    <div
                                        className="bg-ship-cove-400 h-4 rounded-full"
                                        style={{ width: `${sprint.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                {sprint.sprints[0].taskIndexFrom} - {sprint.sprints[sprint.sprints.length - 1].taskIndexTo}
                            </p>
                        </div>
                    ))}
                    <div className="flex justify-center mt-8">
                        <div className="w-full flex justify-center">
                            <div className="w-1/2 flex justify-end">
                                <CircularProgressbar
                                    value={sprints.reduce((acc, sprint) => acc + sprint.progress, 0) / sprints.length}
                                    text={`${(sprints.reduce((acc, sprint) => acc + sprint.progress, 0) / sprints.length).toFixed(0)}%`}
                                    styles={{
                                        root: { width: '204px' },
                                        path: { stroke: `rgba(138,159,208,0.4)` },
                                        text: { fill: 'rgba(138,159,208)', fontSize: '18px', textAnchor: 'middle', dominantBaseline: 'middle', fontFamily: 'Orbitron' },
                                        trail: { stroke: '#d6d6d6' },
                                    }}
                                />
                            </div>
                            <div className="w-1/2 mt-14 ml-6 uppercase">
                                <p className="text-md text-gray-500">
                                    Fecha de término</p>
                                <p className="text-lg text-gray-600 uppercase">
                                    {(sprints?.length > 0 && sprints[0].endDate != null) ? dayjs(sprints[0].endDate).format('DD/MMM/YYYY') : (sprints?.length > 0 ? dayjs(sprints[0].estimatedEndDate).format('DD/MMM/YYYY') : '--/--/--')}
                                </p>
                                <p className="text-xs text-gray-500 mt-4">
                                    Última actualización</p>
                                <p className="text-md text-gray-500">
                                    {sprints?.length > 0 ? dayjs(sprints[0].lastUpdate).format('DD/MMM/YYYY') : '--/--/--'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <div className="flex justify-center mt-12 h-screen">
                <Loader />
            </div>}
        </main>
    );
}

export default function Sprints() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SprintsContent />
        </Suspense>
    )
}