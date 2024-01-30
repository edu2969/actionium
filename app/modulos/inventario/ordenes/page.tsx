'use client'
import { useEffect, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import numberFormat from '@/app/utils/currency';
import Loader from '@/app/components/loader/loader';

export default function OrdenesHome() {
    const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrderListDTO[]>([]);
    const [state, setState] = useState<boolean | any>([]);
    const [loading, setLoading] = useState(false);

    const toggleState = (index: number) => {
        let newState = new Array(purchaseOrders.length).fill(false);
        newState[index] = !state[index];
        console.log("SET", newState);
        setState(newState);
    }

    async function getPurchaseOrders() {
        console.log("Working..");
        const res = await fetch(`/api/purchaseOrders`)
        res.json().then((data: IPurchaseOrderListDTO[] | any) => {
            console.log("DATA", data.purchaseOrders);
            setPurchaseOrders(data.purchaseOrders);
            setState(new Array(data.purchaseOrders.length).fill(false));
        });
    }

    function marcarRecibido(id: string) {
        setLoading(true);
        fetch(`/api/purchaseOrders/reception/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(() => {
            setLoading(false);
            getPurchaseOrders();
        });
    }

    useEffect(() => {
        getPurchaseOrders();
    }, []);

    return (
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
                            <div className="w-5/12 px-6 py-3">
                                Descripción
                            </div>
                            <div className="w-3/12 px-6 py-3">
                                Fecha requerido
                            </div>
                            <div className="w-2/12 px-6 py-3">
                                Estado
                            </div>
                            <div className="w-2/12 px-6 py-3">
                                Acción
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        {purchaseOrders && purchaseOrders.map((po, indice) => (
                            <div className="w-full">
                                <div className="w-full flex bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <div className="w-5/12 flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="ps-3">
                                            <div className="text-base font-semibold">{po.identifier}</div>
                                            <div className="font-normal text-gray-500">{po.totalItems} unidades x {po.currency} ${po.totalAmount}</div>
                                        </div>
                                    </div>
                                    <div className="w-3/12 px-6 py-4">
                                        {po.requestDate}
                                    </div>
                                    <div className="w-2/12 px-6 py-4">
                                        {po.status == 0 ?
                                            <div className="flex items-center">
                                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500 me-2"></div> Sin aprobación
                                            </div> :
                                            <div className="flex items-center">
                                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Aprobado
                                            </div>}
                                    </div>
                                    <div className="w-2/12 px-6 py-4">
                                        <div className="flex font-medium text-blue-600">Revisar
                                            {state[indice] == false ? <IoIosArrowUp onClick={() => { toggleState(indice) }} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem" />
                                                : <IoIosArrowDown onClick={() => { toggleState(indice) }} className="mt-0.5 ml-1 cursor-pointer" size="1.2rem" />}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <div className={`w-full mb-4 bg-white border-b overflow-y-scroll ${state[indice] == false ? 'max-h-0' : 'max-h-72'} transition-all duration-500 ease`}>
                                            <div className="w-full bg-slate-200 border-slate-300 rounded-lg text-lg border-4">
                                                <div className="flex text-center bg-blue-600 text-white">
                                                    <div className="w-1/12 p-2 border-slate-300 border-2">n&deg;</div>
                                                    <div className="w-3/12 p-2 border-slate-300 border-2">Código</div>
                                                    <div className="w-4/12 p-2 border-slate-300 border-2">Descripción</div>
                                                    <div className="w-2/12 p-2 border-slate-300 border-2">Cantidad</div>
                                                    <div className="w-2/12 p-2 border-slate-300 border-2">Costo</div>
                                                </div>
                                                {po.items.map(item => (
                                                    <div className="flex">
                                                        <div className="w-1/12 p-2 border-slate-300 border-2">{item.lineNumber}</div>
                                                        <div className="w-3/12 p-2 border-slate-300 border-2">{item.identifier}</div>
                                                        <div className="w-4/12 p-2 border-slate-300 border-2">{item.productName}</div>
                                                        <div className="w-2/12 p-2 border-slate-300 border-2 text-center">{item.quantity} {item.unit}</div>
                                                        <div className="w-2/12 p-2 border-slate-300 border-2 text-right">{po.currency}$ {numberFormat(item.netAmount)}</div>
                                                    </div>
                                                ))}
                                                <div className='flex'>
                                                    <div className="w-10/12 p-2 border-slate-300 border-2 col-span-4 text-right"><b>TOTAL</b></div>
                                                    <div className="w-2/12 p-2 border-slate-300 border-2 text-right">${numberFormat(po.totalAmount)}</div>
                                                </div>
                                            </div>                                            
                                            <div className='float-right m-6'>
                                                {loading == true ? <Loader></Loader> : 
                                                    <button className="justify-center rounded-md bg-indigo-600 px-7 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                        onClick={() => { marcarRecibido(po.id)}}>Marcar Recibido</button>}
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
    )
}