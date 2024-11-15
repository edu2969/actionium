"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgressbar } from "react-circular-progressbar";
import { forEach } from "lodash";
import dayjs from "dayjs";
import Loader from "@/app/components/loader/loader";
import { PROJECT_STATUS } from "@/app/utils/constants";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";

export default function Sprints() {
    const [sprints, setSprints] = useState<SprintView[]>([]);
    const [project, setProject] = useState<ProjectFormType | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const initData = useRef(false);
    const router = useRouter();
    const params = useSearchParams();

    async function getProjectById() {
        const res = await fetch(`/api/projects/${params.get("projectId")}`);
        const data = await res.json();
        console.log("Project Data", data);
        setProject(data.project);
    }

    async function getSprints() {
        const res = await fetch(`/api/tasks?projectId=${params.get("projectId")}`);
        res.json().then((data: TaskItemListType[] | any) => {
            const tasks = data.tasks;
            console.log("TASKS", data.tasks);
            const sprints: SprintView[] = [];
            let currentSprint: SprintItemView[] = [];
            let currentSprintHours = 0;
            let sprintStartDate = dayjs(tasks[0].startDate);
            let totalHours = 0;
    
            tasks.forEach((task: TaskItemListType) => {
                const taskWeight = project?.status === PROJECT_STATUS.defining ? task.estimatedWeight : task.weight;
                totalHours += taskWeight;
    
                if (currentSprintHours + taskWeight > 40) {
                    // Close current sprint and start a new one
                    if (currentSprint.length > 0) {
                        sprints.push({
                            lastUpdate: new Date(),
                            endDate: null,
                            estimatedEndDate: sprintStartDate.add(totalHours / 40, 'week').toDate(),
                            progress: currentSprint.reduce((acc, t) => acc + t.percentaje, 0) / currentSprint.length || 0,
                            sprints: currentSprint,
                        });
                    }
                    currentSprint = [];
                    currentSprintHours = 0;
                    sprintStartDate = sprintStartDate.add(1, 'week');
                }
    
                const taskStartDate = dayjs(task.startDate);
                const taskEndDate = dayjs(task.endDate);
                const taskShortDescription = task.title + (taskEndDate.isAfter(sprintStartDate.add(1, 'week')) ? ' (*)' : '');
    
                currentSprint.push({
                    title: task.title,
                    taskIndexFrom: taskStartDate.format('DD/MMM/YYYY'),
                    taskIndexTo: taskEndDate.format('DD/MMM/YYYY'),
                    taskShortDescription: taskShortDescription,
                    percentaje: task.progress ?? 0,
                    from: taskStartDate.toDate(),
                    to: taskEndDate.toDate(),
                });
    
                currentSprintHours += taskWeight;
            });
    
            // Add the last sprint if it has tasks
            if (currentSprint.length > 0) {
                sprints.push({
                    lastUpdate: new Date(),
                    endDate: null,
                    estimatedEndDate: sprintStartDate.add(totalHours / 40, 'week').toDate(),
                    progress: currentSprint.reduce((acc, t) => acc + t.percentaje, 0) / currentSprint.length || 0,
                    sprints: currentSprint,
                });
            }
    
            setSprints(sprints);
            console.log("Sprints", sprints);
            setLoadingList(false);
        });
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
                    <Link href="/modulos">
                        <AiFillHome size="1.4rem" className="text-gray-700 dark:text-gray-300 ml-2" />
                    </Link>
                    <IoIosArrowForward size="1.5rem" className="text-gray-700 dark:text-gray-300" />
                    <Link href={`/modulos/homeneo/proyectos${params.get("contractId") ? '?contractId=' + params.get("contractId") : ''}`}>
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