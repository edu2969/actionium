'use client'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useState } from 'react';

export default function Aprobaciones() {
    const [state, setState] = useState([false, false, false]);
    
    const toggleState = (index: number) => {
        let newState = [false, false, false];
        newState[index] = !state[index];
        setState(newState);
    }

    return (
        <div className="w-full p-6">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="table-search-users" className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Codigo/Nombre" />
                    </div>
                </div>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Codigo OC
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Fecha ingreso
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Fecha aprobación
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Fecha recibo
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Aprobadores
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <div className="ps-3">
                                    <div className="text-base font-semibold">DD7986</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                17/dic/23
                            </td>
                            <td className="px-6 py-4">
                                --
                            </td>
                            <td className="px-6 py-4">
                                --
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex -space-x-2 mr-2">
                                    <img className="w-10 h-10 rounded-full border-white border-2 grayscale opacity-40" src="/profiles/profile_02.jpeg" alt="Jese image" />
                                    <img className="w-10 h-10 rounded-full border-white border-2" src="/profiles/profile_03.jpeg" alt="Jese image" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500 me-2"></div> En espera
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex font-medium text-blue-600">Revisar 
                                {state[0] == true ? <IoIosArrowUp onClick={() => { toggleState(0)}} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem"/>
                                : <IoIosArrowDown onClick={() => { toggleState(0)}} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem"/>}
                                </div>
                            </td>
                        </tr>
                        <tr className={`bg-white border-b block overflow-hidden ${state[0] == true ? 'max-h-0' : 'max-h-72'} transition-all duration-500 ease`}>
                            <td className="col-span-7">
                                <div className="p-6">
                                    <table className="bg-slate-200 border-slate-500 rounded-lg text-lg border-4">
                                        <tr className="text-center bg-blue-600 text-white">
                                            <th className="p-2 border-slate-500 border-2">n&deg;</th>
                                            <th className="p-2 border-slate-500 border-2">Código</th>
                                            <th className="p-2 border-slate-500 border-2">Descripción</th>
                                            <th className="p-2 border-slate-500 border-2">Cantidad</th>
                                            <th className="p-2 border-slate-500 border-2">Costo</th>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-slate-500 border-2"></td>
                                            <td className="p-2 border-slate-500 border-2">KJ7663</td>
                                            <td className="p-2 border-slate-500 border-2">Prensa hidraulica de mano</td>
                                            <td className="p-2 border-slate-500 border-2 text-center">1</td>
                                            <td className="p-2 border-slate-500 border-2 text-right">$57.890</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-slate-500 border-2">2</td>
                                            <td className="p-2 border-slate-500 border-2">GJ7663</td>
                                            <td className="p-2 border-slate-500 border-2">Guantes soldadura</td>
                                            <td className="p-2 border-slate-500 border-2 text-center">35 pares</td>
                                            <td className="p-2 border-slate-500 border-2 text-right">$16.990</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-slate-500 border-2">3</td>
                                            <td className="p-2 border-slate-500 border-2">TT7663</td>
                                            <td className="p-2 border-slate-500 border-2">Tuerca octagonal 8"</td>
                                            <td className="p-2 border-slate-500 border-2 text-center">15 unidades</td>
                                            <td className="p-2 border-slate-500 border-2 text-right">$30.660</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-slate-500 border-2 col-span-4 text-right" colSpan={4}><b>TOTAL</b></td>
                                            <td className="p-2 border-slate-500 border-2 text-right">$105.340</td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <div className="ps-3">
                                    <div className="text-base font-semibold">DD7986</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                17/nov/23
                            </td>
                            <td className="px-6 py-4">
                                19/nov/23
                            </td>
                            <td className="px-6 py-4">
                                24/nov/23
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex -space-x-2 mr-2">
                                    <img className="w-10 h-10 rounded-full border-white border-2" src="/profiles/profile_02.jpeg" alt="Jese image" />
                                    <img className="w-10 h-10 rounded-full border-white border-2" src="/profiles/profile_03.jpeg" alt="Jese image" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
                                    Cerrada
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <a href="#" className="flex font-medium text-blue-600 dark:text-blue-500 hover:underline">Revisar <IoIosArrowUp className="mt-0.5 ml-1" size="1.2rem"/></a>
                            </td>
                        </tr>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="flex items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <div className="ps-3">
                                    <div className="text-base font-semibold">DD7984</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                9/oct/23
                            </td>
                            <td className="px-6 py-4">
                                19/oct/23
                            </td>
                            <td className="px-6 py-4">
                                29/oct/23
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex -space-x-2 mr-2">
                                    <img className="w-10 h-10 rounded-full border-white border-2 grayscale opacity-40" src="/profiles/profile_02.jpeg" alt="Jese image" />
                                    <img className="w-10 h-10 rounded-full border-white border-2 grayscale opacity-40" src="/profiles/profile_03.jpeg" alt="Jese image" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div> Retrasada
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <a href="#" className="flex font-medium text-blue-600 dark:text-blue-500 hover:underline">Revisar <IoIosArrowUp className="mt-0.5 ml-1" size="1.2rem"/></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}