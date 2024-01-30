'use client'
import { USER_ROLE } from "@/app/utils/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";


export default function Usuarios() {
    const [users, setUsers] = useState<IUser[]>([]);
    async function getUsers() {
        const res = await fetch(`/api/users`)
        res.json().then((data: IUser[] | any) => {
            setUsers(data.users)
            console.log(data.users);
        });
    }

    const roleNames = Object.keys(USER_ROLE).map((k: string) => {
        return {
            label: k.toUpperCase().replace("_", " "),
            value: USER_ROLE[k],
        }
    })

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <main className="p-6 mt-8 h-screen overflow-y-scroll">
            <div className="w-full p-6">
                <div className="relative shadow-md sm:rounded-lg">
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
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Rol
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">                                    
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        {user.avatarImg && <img className="w-10 h-10 rounded-full" src={user.avatarImg} alt={`${user.name} avatar`} />}
                                        {user.avatarImg=="" && <FaUserCircle className="w-10 h-10 text-slate-400" size="1em"/>}
                                        <div className="ps-3">
                                            <div className="text-base font-semibold">{user.name}</div>
                                            <div className="font-normal text-gray-500">{user.email}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        {roleNames.find(rn => rn.value == (user.role ?? 0))?.label}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={{
                                            pathname: "/modulos/administrador/usuarios/edicion",
                                            query: { _id: user._id }
                                        }}>
                                            <span className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit user</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}