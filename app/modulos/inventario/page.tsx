'use client'
import Link from 'next/link';
import { AiOutlineInbox } from 'react-icons/ai'
import { TbAlertSquareRoundedFilled } from "react-icons/tb";
import { FaClipboardQuestion } from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import { useEffect, useState } from 'react';

export default function HomeInventario() {
    const [contadores, setContadores] = useState({"pendingPOs":0,"tools":{"terrain":0,"repairing":0, "alerts": 0}, alerts: 0});
    async function getContadores() {
        const res = await fetch(`/api/modules`)
        res.json().then((data: IPurchaseOrderListDTO[] | any) => {   
            console.log("CONTADORES", data);         
            setContadores(data);
        });
    }
    useEffect(() => {
        getContadores();
    }, []);    
    return (
        <div className="w-full columns-2 p-2 md:p-6 max-w-lg mx-auto mt-14">
            <Link href="/modulos/inventario/herramientas">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <FaTools className="mx-auto mb-1" size="6rem"/>
                        {contadores.tools.terrain > 0 && 
                        (<div className="bg-green-500 rounded-full w-auto px-2 h-8 text-white text-center pt-1 absolute -left-1/3 translate-x-8">{contadores.tools.terrain}x terreno</div>)
                        }
                        {contadores.tools.repairing > 0 && 
                        (<div className="bg-orange-700 rounded-full w-auto px-2 h-8 text-white text-center pt-1 absolute -left-1/3 translate-x-8 translate-y-9">{contadores.tools.repairing}x repar.</div>)
                        }                        
                    </div>
                    <span>Herramientas</span>                
                </div>
            </Link>
            <Link href="/modulos/inventario/ordenes">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <AiOutlineInbox className="mx-auto mb-1" size="6rem"/>
                        {contadores.pendingPOs > 0 && 
                            (<div className="bg-orange-700 rounded-full w-8 h-8 text-white text-center pt-1 absolute left-1/2 translate-x-3">{contadores.pendingPOs > 9 ? '9+' : contadores.pendingPOs}</div>)
                        }                        
                    </div>
                    <span>Órdenes</span>                
                </div>
            </Link>
            <Link href="/modulos/inventario/consultas">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">                
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <FaClipboardQuestion className="mx-auto mb-1" size="6rem"/>
                    </div>
                    <span>Consultas</span>
                </div>
            </Link>
            <Link href="/modulos/inventario/alertas">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <TbAlertSquareRoundedFilled className="mx-auto mb-1" size="6rem"/>
                        {contadores.alerts > 0 && 
                            (<div className="bg-orange-700 rounded-full w-8 h-8 text-white text-center pt-1 absolute left-1/2 translate-x-5">{contadores.alerts > 9 ? '9+' : contadores.alerts}</div>)
                        }
                        
                    </div>
                    <span>Alertas</span>                
                </div>
            </Link>
        </div>
        );

}