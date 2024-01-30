import Link from 'next/link';
import { TbAlertSquareRoundedFilled } from "react-icons/tb";
import { TbLockAccess } from "react-icons/tb";
import { RiFileExcel2Fill } from "react-icons/ri";
import { MdGroups2 } from "react-icons/md";

export default function HomeAdministrador() {
    return (
        <main className="w-full columns-2 p-2 md:p-6 max-w-lg mx-auto mt-14">
            <Link href="/modulos/administrador/usuarios">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <TbLockAccess className="mx-auto mb-1" size="6rem" />
                    </div>
                    <span>Accesos</span>
                </div>
            </Link>
            <Link href="/modulos/administrador/empresas">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <RiFileExcel2Fill className="mx-auto mb-1" size="6rem" />
                    </div>
                    <span>Imports</span>
                </div>
            </Link>
            <Link href="/modulos/administrador/imports">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <MdGroups2 className="mx-auto mb-1" size="6rem" />
                    </div>
                    <span>Empresas</span>
                </div>
            </Link>
            <Link href="/modulos/administrador/alertas">
                <div className="w-full shadow-lg rounded-lg py-4 hover:scale-105 border-2 hover:border-blue-100 mb-4 text-center">
                    <div className="w-full inline-flex text-center text-slate-500 p-4 relative">
                        <TbAlertSquareRoundedFilled className="mx-auto mb-1" size="6rem" />
                        <div className="bg-orange-700 rounded-full w-8 h-8 text-white text-center pt-1 absolute left-1/2 translate-x-5">9+</div>
                    </div>
                    <span>Alertas</span>
                </div>
            </Link>
        </main>
    );

}