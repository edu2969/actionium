"use client"

import { CircularProgressbar } from "react-circular-progressbar";
import Loader from "@/app/components/loader/loader";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { RiTimerFlashLine } from "react-icons/ri";

export default function RegisterForm({ project, view, loader }) {    
    const router = useRouter();
    const params = useSearchParams();

    return (<main className="pt-10 px-6 pb-16 h-screen overflow-y-auto">
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
            {view && view.sprints.length > 0 ? <>
                <div className="flex flex-wrap justify-center gap-2 uppercase">
                    {view.sprints.map((sprint, index) => (
                        <div key={index} className="w-[180px] m-2">
                            <div className={`px-2 bg-${sprint.percentaje == 100 ? 'green' : 'ship-cove'}-200 rounded-lg shadow-lg pb-2`}>
                                <div className="bg-green-600 text-sm font-semibold text-gray-200 pl-2 max-w-24 rounded-lg rounded-bl-none rounded-tr-none -ml-2">
                                    Sprint {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="min-h-20 max-h-20 w-[160px] overflow-hidden text-ellipsis">
                                    <p className="text-xs text-gray-800 font-bold mt-2 mb-0">
                                        {sprint.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0 mb-2">
                                        {sprint.taskIndexTo}
                                    </p>
                                </div>
                                <div className="text-center text-4xl text-gray-700 mb-0 orbitron">
                                    {Math.round(sprint.percentaje)}<small>%</small>
                                </div>
                                <div className="w-full bg-ship-cove-800 h-4 dark:bg-gray-700 rounded-full">
                                    <div
                                        className="bg-ship-cove-800 h-4 rounded-full"
                                        style={{ width: `${sprint.percentaje}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="flex justify-center text-xs text-gray-700 mt-2">
                                <RiTimerFlashLine size="1.2em" className="mr-1" />
                                {dayjs(sprint.estimatedEndDate).format('DD/MMM/YYYY HH:MM')}
                            </p>
                        </div>
                    ))}
                    <div className="flex justify-center mt-8">
                        <div className="w-full flex justify-center">
                            <div className="w-1/2 flex justify-end">
                                <CircularProgressbar
                                    className="orbitron"
                                    value={view ? view.progress.toFixed(0) : 0}
                                    text={`${view ? view.progress.toFixed(0) : 0}%`}
                                    styles={{
                                        root: { width: '204px' },
                                        path: { stroke: `rgba(138,159,208,0.4)` },
                                        text: { fill: 'rgba(138,159,208)', fontSize: '18px', textAnchor: 'middle', dominantBaseline: 'middle' },
                                        trail: { stroke: '#d6d6d6' },
                                    }}
                                />
                            </div>
                            {view && <div className="w-1/2 mt-14 ml-6 uppercase">
                                <p className="text-md text-gray-500">
                                    Fecha de término</p>
                                <p className="text-lg text-gray-600 uppercase">
                                    {dayjs(view.estimatedEndDate).format('DD/MMM/YYYY HH:mm')}
                                </p>
                                <p className="text-xs text-gray-500 mt-4">
                                    Última actualización</p>
                                <p className="text-md text-gray-500">
                                    {view.sprints?.length > 0 ? dayjs(view.sprints[0].lastUpdate).format('DD/MMM/YYYY HH:mm') : '--/--/--'}
                                </p>
                            </div>}
                        </div>
                    </div>
                </div>
            </> : <div className="flex justify-center mt-12 h-screen">
                <Loader />
            </div>}
        </main>);
}