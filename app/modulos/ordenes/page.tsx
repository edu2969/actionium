import Link from 'next/link';
import { RiFileExcel2Fill } from "react-icons/ri";
import { HiDocumentCheck } from "react-icons/hi2";

export default function HomeOrdenes() {
    return (
        <main className="w-full columns-2 p-2 md:p-6 max-w-lg mx-auto mt-14">
            <Link href="/modulos/ordenes/importar">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <RiFileExcel2Fill className="mx-auto mb-1" size="6rem"/>                        
                    </div>
                    <span>Importar OC</span>
                </div>
            </Link>
            <Link href="/modulos/ordenes/aprobaciones">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <HiDocumentCheck className="mx-auto mb-1" size="6rem"/>
                        <div className="bg-orange-700 rounded-full w-8 h-8 text-white text-center pt-1 absolute left-1/2 translate-x-3">2</div>
                    </div>
                    <span>Aprobaciones</span>                
                </div>
            </Link>            
        </main>
        );
}