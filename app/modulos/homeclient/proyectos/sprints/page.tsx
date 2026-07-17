"use client"
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import SprintView from "@/components/SprintView";

export default function ClientSprints() {
    const [view, setView] = useState<SprintView | null>(null);
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

    return (<SprintView project={project} view={view} loader={loadingList}/>);
}