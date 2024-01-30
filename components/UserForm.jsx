"use client";
import { AiOutlineUser, AiFillEdit, AiFillSafetyCertificate } from 'react-icons/ai'
import Datepicker from 'react-tailwindcss-datepicker'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { USER_ROLE } from '@/app/utils/constants';

export default function UserForm({ user }) {
    const router = useRouter();
    const [fechaNacimiento, setFechaNacimiento] = useState({
        startDate: user.birthDate, endDate: user.birthDate
    })

    const handleFechaNacimientoChange = (newValue) => {
        console.log("NEWVALUE", newValue);
        setFechaNacimiento(newValue);
        setValue('birthDate', new Date(newValue.startDate));
    }

    const {
        register,
        formState: {
            errors
        },
        handleSubmit,
        setValue
    } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            rut: user.rut,
            gender: user.gender,
            birthDate: new Date(user.birthDate),
            avatarImg: user.avatarImg,
        }
    });

    const roles = Object.keys(USER_ROLE).map(k => {
        return {
            label: k.toUpperCase().replace("_", " "),
            value: USER_ROLE[k],
        }
    })

    const onSubmit = async (data) => {
        console.log("SUBMITING...", data);
        try {
            await fetch(`/api/users/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });
            router.back();
        } catch (error) {
            console.log("ERROR", error);
        }
    }

    return (
        <div className="w-full p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg m-auto">
                <div>
                    {user.avatarImg == "" ? <div className="block h-40 w-40 m-auto mb-6">
                        <div className="h-40 w-40 bg-slate-400 rounded-full text-white p-4 m-auto absolute">
                            <AiOutlineUser size="8rem" />
                        </div>
                    </div>
                        : <img className="m-auto w-40 h-40 rounded-full" src={user.avatarImg} alt={user.name} />
                    }
                </div>
                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium leading-6 text-gray-900">Avatar URL</label>
                    <div className="mt-2">
                        <input {...register('avatarImg')} id="avatarImg" name="avatarImg" type="text" autoComplete="avatarImg"
                            className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium leading-6 text-gray-900">Nombre</label>
                    <div className="mt-2">
                        <input {...register('name')} id="nombre" name="nombre" type="text" autoComplete="nombre" required
                            className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">E-mail</label>
                    <div className="mt-2">
                        <input {...register('email')} id="email" name="email" type="email" autoComplete="email" required
                            className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                </div>
                <div className="w-full flex">
                    <div>
                        <label htmlFor="rut" className="block text-sm font-medium leading-6 text-gray-900">Rut</label>
                        <div className="mt-2">
                            <input {...register('rut')} id="rut" name="rut" type="text" autoComplete="rut"
                                className="block w-full rounded-md px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                    <div className="w-full ml-4">
                        <label htmlFor="genero" className="block text-sm font-medium leading-6 text-gray-900">Genero</label>
                        <div className="mt-2">
                            <select {...register('gender')} id="genero" 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option>Seleccione uno</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="w-full flex">
                    <div className="w-1/2">
                        <label htmlFor="birthDate" className="block text-sm font-medium leading-6 text-gray-900">Fecha Nacimiento</label>
                        <div className="mt-2">
                            <Datepicker {...register('birthDate')}
                                useRange={false}
                                asSingle={true}
                                value={fechaNacimiento}
                                inputClassName="w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                displayFormat='DD/MMM/YYYY'
                                onChange={handleFechaNacimientoChange} />
                        </div>
                    </div>
                    <div className="w-1/2 ml-2">
                        <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Rol</label>
                        <div className="mt-2">
                            <select {...register('role', { valueAsNumber: true })} id="role" 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                <option>Sin rol</option>
                                {roles.map(r => (<option value={r.value}>{r.label}</option>))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <button className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 mr-2"
                        onClick={(e) => {
                            e.preventDefault();
                            router.back()
                        }}>&lt;&lt; Volver</button>
                    <button className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        type="submit">Guardar</button>
                </div>
            </form>
        </div>
    );
}