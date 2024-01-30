'use client'

import Loader from "@/app/components/loader/loader";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

type StorageItemType = {
    _id: string,
    toolStorageId: string,
    identifier: string,
    productId: string,
    quantities: {
        available: number,
        reparation: number,
        terrain: number,
        total: number,
        discard: number,
    },
    stockRanges: {
        min: number,
        max: number,
    },
    product: IProduct,
    borrowedTo: {
        avatarImg: string,
        name: string,
        quantity: number,
        date: Date,
    }[],
}

export default function Consultas() {
    const [storageItems, setStorageItems] = useState<StorageItemType[]>([]);
    const [state, setState] = useState<boolean | any>([]);
    const [loading, setLoading] = useState(false);

    async function getStorageItems() {
        const res = await fetch(`/api/storageItems`)
        res.json().then((data: StorageItemType[] | any) => {
            setState(new Array(data.items.length).fill(false));
            setStorageItems(data.items);
            console.log("ITEMS", data.items);
        });
    }

    const toggleState = (index: number) => {
        let newState = new Array(storageItems.length).fill(false);
        newState[index] = !state[index];
        setState(newState);
    }

    const getStatus = (storageItemId: string): { color: string, text: string } => {
        const si = storageItems.find(si => storageItemId == si._id);
        const available = si?.quantities ? si.quantities.available : 0;
        const minStock = si?.stockRanges ? si.stockRanges.min : 0;
        const maxStock = si?.stockRanges ? si.stockRanges.max : 0;
        return available > maxStock ?
            { color: 'blue', text: 'Sobre stock' } : available >= minStock ?
                { color: 'green', text: 'Normal' } : available < minStock ?
                    { color: 'orangered', text: 'Quiebre Stock' } : { color: 'red', text: 'ERROR!' };
    }

    useEffect(() => {
        getStorageItems();
    }, [])

    return (
        <main className="p-6 mt-8 h-screen overflow-y-scroll">
            <div className="w-full p-6">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                        <div>
                            <div id="dropdownAction" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
                                    <li>
                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reward</a>
                                    </li>
                                    <li>
                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Promote</a>
                                    </li>
                                    <li>
                                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Activate account</a>
                                    </li>
                                </ul>
                                <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete User</a>
                                </div>
                            </div>
                        </div>
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
                    <div className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <div className="w-full text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <div className="flex">
                                <div className="w-3/12 px-6 py-3">
                                    Nombre/Codigo
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    Stock
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    Terreno
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    Reparación
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    A desechar
                                </div>
                                <div className="w-3/12 px-6 py-3">
                                    Prestada a
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    Status
                                </div>
                                <div className="w-1/12 px-6 py-3">
                                    Acción
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            {storageItems.length > 0 && storageItems.map((item, indice) => (
                                <div className="w-full">
                                    <div className="w-full flex bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <div className="w-3/12 flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="ps-3">
                                                <div className="text-base font-semibold">{item.product.name}</div>
                                                <div className="font-normal text-gray-500">{item.identifier}</div>
                                            </div>
                                        </div>
                                        <div className="w-1/12 px-6 py-4">
                                            {item.quantities.available}
                                        </div>
                                        <div className="w-1/12 px-6 py-4">
                                            {item.quantities.terrain}
                                        </div>
                                        <div className="w-1/12 px-6 py-4">
                                            {item.quantities.reparation}
                                        </div>
                                        <div className="w-1/12 px-6 py-4">
                                            {item.quantities.discard}
                                        </div>
                                        <div className="w-3/12 px-6 py-4">
                                            <div className="flex -space-x-4 mr-2">
                                                {item.borrowedTo.length > 0 && item.borrowedTo.map((bt, index) => (
                                                    bt.avatarImg == "" ? <FaUserCircle key={item._id + index} className="w-10 h-10 text-slate-300 rounded-full border-white border-2 bg-white" size="1rem" />
                                                        : <img key={item._id + index} className="w-10 h-10 rounded-full border-white border-2" src={bt.avatarImg} alt={bt.avatarImg} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-1/12 px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`h-2.5 w-2.5 rounded-full bg-${getStatus(item._id).color}-500 me-2`}></div> {getStatus(item._id).text}
                                            </div>
                                        </div>
                                        {item.borrowedTo.length > 0 && <div className="w-1/12 px-6 py-4">
                                            <div className="flex font-medium text-blue-600">Revisar
                                                {state[indice] == false ? <IoIosArrowUp onClick={() => { toggleState(indice) }} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem" />
                                                    : <IoIosArrowDown onClick={() => { toggleState(indice) }} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem" />}
                                            </div>
                                        </div>}
                                    </div>
                                    <div>
                                        <div>
                                            <div className={`w-full bg-stone-100 mb-4 bg-white border-b overflow-y-scroll ${state[indice] == false ? 'max-h-0' : 'max-h-72'} transition-all duration-500 ease`}>
                                                <p className="text-md font-bold mt-2 ml-4">En posesión de</p>
                                                <div className="flex space-x-4">
                                                    {item.borrowedTo.map((bt, indice) => (
                                                        <div key={item._id + indice} className="w-fit shadow-lg rounded-md m-4 p-2 break-inside-avoid-column bg-blue-100">
                                                            <div className="mt-2 text-center">
                                                                {bt.avatarImg == "" ? <FaUserCircle className="w-20 h-20 mx-auto mb-2 text-slate-300 rounded-full border-white border-2 bg-white" size="1rem" />
                                                                    : <img className="w-20 h-20 mx-auto mb-2 rounded-full border-white border-2" src={bt.avatarImg} alt={bt.avatarImg} />}
                                                                <p className="text-sm ml-2 text-gray-800">{bt.name}</p>
                                                                <p className="text-xs ml-2 text-gray-500">x{bt.quantity} desde {dayjs(bt.date).format('DD/MMM/YY HH:mm')}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}