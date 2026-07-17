'use client'

import { use, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link'
import { useState } from 'react';
import { AiFillHome, AiOutlineMenu, AiOutlineClose, AiFillAliwangwang, AiOutlineLogout } from 'react-icons/ai'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react';

export default function Nav() {
    const [role, setRole] = useState(0);    
    const [menuActivo, setMenuActivo] = useState(false);    
    const path = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    
    useEffect(() => {
        if(status === 'loading') return;
        if(session && session.user && session.user?.role) {
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
                    <AiOutlineMenu size="1.7rem" className="m-4 text-white cursor-pointer"
                        onClick={() => setMenuActivo(true)} />
                    <div className="w-full flex justify-end">
                        <Link href={`/`} onClick={() => setMenuActivo(false)}>
                            <AiFillHome size="1.7rem" className="m-4 text-white justify-end cursor-pointer" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className={`min-w-2xl min-h-full z-50 absolute transition-all bg-[#9cb6dd] p-6 ${menuActivo ? 'left-0' : '-left-full'}`}>
                <AiOutlineClose size="2rem" className="text-white m-auto cursor-pointer absolute top-4 right-4"
                    onClick={() => setMenuActivo(false)} />
                <div className="mt-12 text-white space-y-6">
                    <Link href="/about" onClick={() => setMenuActivo(false)}>
                        <div className="flex hover:bg-white hover:text-[#9cb6dd] rounded-md p-2 cursor-pointer">
                            <AiFillAliwangwang size="4rem" />
                            <p className="text-2xl ml-2 mt-4">Acerca de...</p>
                        </div>
                    </Link>
                    <button className="min-w-2xl flex hover:bg-white hover:text-[#9cb6dd] rounded-md p-2"
                        onClick={async () => { 
                            setMenuActivo(false);
                            signOut({ redirect: false }).then(() => {
                                router.push('/logingOut'); 
                            });
                        }}>
                        <AiOutlineLogout size="4rem" />
                        <p className="text-2xl ml-2 mt-4">Cerrar sesión</p>
                    </button>
                </div>
            </div>
        </div>
    )
}