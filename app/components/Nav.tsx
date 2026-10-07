'use client'

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link'
import { useState } from 'react';
import { AiFillHome, AiOutlineMenu, AiOutlineClose, AiFillAliwangwang, AiOutlineLogout } from 'react-icons/ai'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { GoHomeFill } from 'react-icons/go';

export default function Nav() {
    const [role, setRole] = useState(0);
    const [menuActivo, setMenuActivo] = useState(false);
    const path = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        if (session && session.user && session.user?.role) {
            setRole(session.user.role);
        }
    }, [session, setRole, status]);

    useEffect(() => {
        console.log("ROLE", role);
    }, [role]);

    return (
        <div className={`w-screen fixed top-0 left-0 ${path === '/' ? 'hidden' : 'visible'}`}>
            <div className="absolute w-full">
                <div className="w-full bg-transparent flex">
                    {!menuActivo && <AiOutlineMenu size="1.7rem" className="m-4 text-[#08F2F1] cursor-pointer"
                        onClick={() => setMenuActivo(true)} />}                    
                </div>
            </div>            
            <div
                className={`
        absolute top-10 left-0
        w-[360px] h-[calc(100vh-80px)]
        z-50
        transition-all duration-300
        ${menuActivo ? "translate-x-0" : "-translate-x-full"}
    `}
            >
                {/* Fondo */}
                <Image
                    src="/panel/marco_001.png"
                    alt="Marco"
                    fill
                    priority
                    className="object-fill pointer-events-none select-none"
                />

                {/* Contenido */}
                <div className="relative h-full p-6">

                    <AiOutlineClose
                        size="2rem"
                        className="absolute top-8 right-8 cursor-pointer text-[#08F2F1] hover:text-white transition-colors"
                        onClick={() => setMenuActivo(false)}
                    />

                    <div className="mt-12 space-y-6 text-[#08F2F1]">

                        <Link
                            href="/mainPanel"
                            onClick={() => setMenuActivo(false)}
                        >
                            <div className="flex items-center rounded-lg p-3 transition-all hover:bg-[#08F2F1]/15 hover:text-white">
                                <GoHomeFill size="3rem" />
                                <span className="ml-3 text-2xl">
                                    Panel Principal
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/about"
                            onClick={() => setMenuActivo(false)}
                        >
                            <div className="flex items-center rounded-lg p-3 transition-all hover:bg-[#08F2F1]/15 hover:text-white">
                                <AiFillAliwangwang size="3rem" />
                                <span className="ml-3 text-2xl">
                                    Acerca de...
                                </span>
                            </div>
                        </Link>                       

                    </div>

                    <button
                        className="absolute bottom-6 left-24 flex items-center rounded-lg p-3 transition-all hover:bg-[#08F2F1]/15 hover:text-white text-[#08F2F1]"
                        onClick={async () => {
                            setMenuActivo(false);

                            signOut({ redirect: false }).then(() => {
                                router.push("/logingOut");
                            });
                        }}
                    >
                        <span className="text-2xl">
                            Cerrar sesión
                        </span>
                    </button>

                </div>
            </div>
        </div>
    )
}