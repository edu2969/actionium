'use client'
import React, { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import RadioGroup from '@/app/components/radio-group/radio-group';

import { AiFillAlert, AiFillTool } from 'react-icons/ai'
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { FaHelmetSafety, FaRegCircleUser, FaToolbox } from "react-icons/fa6";
import { GiGloves, GiCapeArmor, GiUpgrade } from "react-icons/gi";
import { MdElectricBolt, MdLocalActivity, MdOutlineLocalActivity, MdOutlineSupport } from "react-icons/md";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { TbAlertTriangleFilled } from "react-icons/tb"
import { USER_ROLE } from '@/app/utils/constants';
import { RiUserStarLine } from 'react-icons/ri';
import { SiQuantcast } from 'react-icons/si'
import { STORAGE_ITEM_STATE } from '@/app/utils/constants';
import dayjs from 'dayjs';
import Loader from '@/app/components/loader/loader';

type FormEntradaType = {
    operacion: number,
    trabajador: string,
    codigoHerramienta: string,
    cantidad: number,
    estado: number,
}

type TeamType = {
    _id: string,
    name: string,
    rut: string,
    birthDate: Date,
    avatarImg: string,
    role: number,
    hasSome: boolean,
}

type QuantityType = {
    operative: number,
    reparation: number,
    terrain: number,
    total: number,
}

type StockRangeType = {
    min: number,
    max: number,
}

type ProductType = {
    _id: string,
    name: string,
}

type StorageItemType = {
    _id: string,
    toolStorageId: string,
    productId: string,
    product: ProductType,
    identifier: string,
    quantities: QuantityType,
    stockRanges: StockRangeType,
}

type UserStorageItemSetType = {
    userStorageItemId: string,
    storageItemId: string,
    identifier: string,
    name: string,
    quantity: number,
}

const STEPS = {
    SELECCION_OPERACION: 0,
    ENTRADA: {
        QUIEN_ENTREGA: 1,
        CODIGO_HERRAMIENTA: 2,
        CONFIRMACION: 3,
        GUARDANDO: 4,
        OK: 5,
        ERROR: 6,
    },
    SALIDA: {
        QUIEN_RECIBE: 11,
        CODIGO_HERRAMIENTA: 12,
        CONFIRMACION: 13,
        GUARDANDO: 14,
        OK: 15,
        ERROR: 16,
    }
}

type TrabajadorType = {
    id: string,
    avatarImg: string,
    name: string,
    rut: string,
    yearsOld: number,
    birthDate: Date | null,
    set: UserStorageItemSetType[],
}

type UIType = {
    step: number,
    user: TrabajadorType | null,
    storageItem: StorageItemType | null,
    maxQuantity: number,
    minQuantity: number,
}

export default function Herramientas() {
    const radioGroupRef = useRef<{ reset: () => void } | null>(null);
    const [UI, setUI] = useState<UIType>({
        step: STEPS.SELECCION_OPERACION,
        user: null,
        storageItem: null,
        maxQuantity: 0,
        minQuantity: 0,
    });
    const [team, setTeam] = useState<TeamType[]>([]);
    const [storageItems, setStorageItems] = useState<StorageItemType[]>([]);
    const [resultado, setResultado] = useState<TeamType[]>([])
    const [resultadoHerramientas, setResultadoHerramientas] = useState<StorageItemType[]>([]);
    const { setValue, register, handleSubmit, watch, formState: { errors, isDirty, isValid }, reset } = useForm<FormEntradaType>({
        mode: "onChange",
        defaultValues: {
            cantidad: 1,
            estado: 0,
        }
    });
    const watchEntrega = watch("trabajador");

    async function getTeam() {
        const res = await fetch(`/api/users/team`)
        res.json().then((data: TeamType[] | any) => {
            setTeam(data.users);
            console.log("DATA -->", data.users);
        });
    }

    async function getHerramientas() {
        const res = await fetch(`/api/storageItems`)
        res.json().then((data: StorageItemType[] | any) => {
            setStorageItems(data.items);
        })
    }

    async function getUserStorageItemsSet(user: TrabajadorType) {
        const res = await fetch(`/api/userStorageItemSet/${user.id}`)
        res.json().then((data: UserStorageItemSetType[] | any) => {
            var ui = JSON.parse(JSON.stringify(UI));
            user.set = data.set;
            ui.user = user;
            ui.step++;
            setUI(ui);
        });
    }

    const setearCodigoHerramienta = (storageItemId: string, glosa: string) => {
        var ui = JSON.parse(JSON.stringify(UI));
        setResultadoHerramientas([]);
        setValue("codigoHerramienta", glosa);
        ui.storageItem = storageItems.find(si => si._id == storageItemId);
        ui.step++;
        setUI(ui);
    }

    const setearTrabajador = (id: string, nombre: string) => {
        setResultado([]);
        setValue("trabajador", nombre);
        var ui = JSON.parse(JSON.stringify(UI));
        ui.step++;
        const user = team.find(u => u._id == id);
        var uiuser: TrabajadorType = {
            id: user?._id || '',
            name: user?.name || '',
            rut: user?.rut || '',
            birthDate: user?.birthDate || null,
            avatarImg: user?.avatarImg || '',
            yearsOld: 33,
            set: [],
        }
        getUserStorageItemsSet(uiuser);
    }

    function goAhead() {
        var ui = JSON.parse(JSON.stringify(UI));
        ui.step++;
        setUI(ui);
    }

    const onSubmit: SubmitHandler<FormEntradaType> = data => {
        var ui = JSON.parse(JSON.stringify(UI));
        const userId = ui.user ? ui.user.id : false;
        if (!userId) return false;
        ui.step++;
        setUI(ui);
        const operacion = ui.step == STEPS.ENTRADA.GUARDANDO ? 'in' : 'out';
        const body = operacion == 'in' ? {
            userId: userId,
            storageItemId: ui.storageItem._id,
            quantity: data.cantidad,
            state: data.estado
        } : {
            userId: userId,
            storageItemId: ui.storageItem._id,
            quantity: data.cantidad,
        }
        fetch(`/api/storageItems/${operacion}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        }).then(resp => {
            var ui = JSON.parse(JSON.stringify(UI));
            if (resp.ok) {
                ui.step++;
                ui.user = null;
                setValue("trabajador", "");
                setUI(ui);
            } else {
                ui.step += 2;
                console.log("ERROR", resp);
            }
            radioGroupRef.current?.reset();
        })

    }

    useEffect(() => {
        getTeam();
        getHerramientas();
    }, [])

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            var ui = JSON.parse(JSON.stringify(UI));
            if (ui.step == STEPS.ENTRADA.QUIEN_ENTREGA || ui.step == STEPS.SALIDA.QUIEN_RECIBE) {
                const trabajador = value.trabajador || '';
                if (team.length > 0) {
                    const filtrados = team.filter((u => {
                        return u.name.toLocaleLowerCase().includes(trabajador.toLocaleLowerCase());
                    }));
                    if (filtrados.length > 0) {
                        setResultado(filtrados);
                    } else {
                        setResultado([]);
                    }
                }
                if (trabajador.length == 0) {
                    var ui = JSON.parse(JSON.stringify(UI));
                    ui.user = null;
                    setUI(ui);
                    setResultado([]);
                }
            }
            if (UI.step == STEPS.ENTRADA.CODIGO_HERRAMIENTA || UI.step == STEPS.SALIDA.CODIGO_HERRAMIENTA) {
                const codigoHerramienta = value.codigoHerramienta || '';
                if (codigoHerramienta.length > 0 && storageItems.length > 0) {
                    const filtrados = storageItems.filter((u => {
                        return u.identifier.toLocaleLowerCase().includes(codigoHerramienta.toLocaleLowerCase())
                            || u.product.name.toLocaleLowerCase().includes(codigoHerramienta.toLocaleLowerCase());
                    }));
                    if (filtrados.length > 0) {
                        setResultadoHerramientas(filtrados);
                    } else {
                        setResultadoHerramientas([]);
                    }
                }
                if (codigoHerramienta.length == 0) {
                    var ui = JSON.parse(JSON.stringify(UI));
                    ui.storageItemId = null;
                    setResultadoHerramientas([]);
                }
            }
        });
    })

    return (
        <div className="w-full p-6 max-w-2xl mx-auto mt-14">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <RadioGroup
                    onChange={(index) => {
                        if (index > 0) {
                            setResultado([]);
                            setResultadoHerramientas([]);
                            setValue("trabajador", "");
                            setValue("codigoHerramienta", "");
                            setValue("cantidad", 1);
                            setValue("estado", 0);
                            var step = 0;
                            var ui = {
                                step: index == 1 ? STEPS.ENTRADA.QUIEN_ENTREGA : STEPS.SALIDA.QUIEN_RECIBE,
                                user: null,
                                storageItem: null,
                                maxQuantity: 0,
                                minQuantity: 0,
                            }
                            setUI(ui);
                        } else {
                            goAhead();
                        }
                    }}
                    ref={radioGroupRef}
                    options={[
                        <div className="flex flex-1 justify-around">
                            <IoEnterOutline className="text-6xl" />
                            <span className="text-3xl mt-3">ENTRADA</span>
                        </div>,
                        <div className="flex  flex-1 justify-around">
                            <span className="text-3xl mt-3">SALIDA</span>
                            <IoExitOutline className="text-6xl" />
                        </div>,
                    ]}
                />

                {(UI.step == STEPS.SELECCION_OPERACION || UI.step == STEPS.ENTRADA.OK || UI.step == STEPS.SALIDA.OK) &&
                    <div className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 mt-4" role="alert">
                        <p className="font-bold">Selecciona operación</p>
                        <p className="text-sm">Indica si las entramientras entran o salen de bodega.</p>
                    </div>
                }


                <div className="w-full mt-4">
                    {((UI.step >= STEPS.ENTRADA.QUIEN_ENTREGA && UI.step < STEPS.ENTRADA.OK) ||
                        (UI.step >= STEPS.SALIDA.QUIEN_RECIBE && UI.step < STEPS.SALIDA.OK))
                        && ((UI.step == STEPS.ENTRADA.QUIEN_ENTREGA && team.filter(r => r.hasSome).length > 0 || UI.step == STEPS.SALIDA.QUIEN_RECIBE) ?
                            (<div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600">
                                <input
                                    {...register("trabajador", { required: true })}
                                    autoComplete='off'
                                    type="text" id="trabajador" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="trabajador" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    Quién {UI.step >= STEPS.SALIDA.QUIEN_RECIBE ? 'recibe' : 'entrega'}</label>
                            </div>) :
                            ((UI.step >= STEPS.ENTRADA.QUIEN_ENTREGA && UI.step < STEPS.ENTRADA.OK && resultado.filter(r => r.hasSome).length == 0) 
                                && <div className="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md" role="alert">
                                <div className="flex">
                                    <div className="py-1">
                                        <svg className="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20">
                                            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p><b>Nada que recibir</b></p>
                                        <p className="text-sm">Todas las herramientas en bodega</p>
                                    </div>
                                </div>
                            </div>)
                    )}                    
                            

                    {(UI.step == STEPS.ENTRADA.QUIEN_ENTREGA ? resultado.filter(r => r.hasSome) : resultado).length > 0 && UI.user == null &&
                        (
                            <div>
                                <ul className="bg-white border border-gray-100 w-full mt-2 ">
                                    {(UI.step == STEPS.ENTRADA.QUIEN_ENTREGA ? resultado.filter(r => r.hasSome) : resultado).map(r => (
                                        <li key={r._id} className="flex pl-8 pr-2 py-1 border-b-2 border-gray-100 relative cursor-pointer hover:bg-yellow-50 hover:text-gray-900"
                                            onClick={() => { setearTrabajador(r._id, r.name) }}>
                                            {r.role == USER_ROLE.cap ? <MdOutlineLocalActivity className="scale-125 mr-4 mt-1" />
                                                : r.role == USER_ROLE.cap_electrician ? <MdLocalActivity className="scale-125 mr-4 mt-1" />
                                                    : r.role == USER_ROLE.coladaOverseer ? <RiUserStarLine className="scale-125 mr-4 mt-1" />
                                                        : r.role == USER_ROLE.electrician ? <MdElectricBolt className="scale-125 mr-4 mt-1" />
                                                            : r.role == USER_ROLE.hidraulicMechanical ? <MdElectricBolt className="scale-125 mr-4 mt-1" />
                                                                : r.role == USER_ROLE.ito_cap ? <GiUpgrade className="scale-125 mr-4 mt-1" />
                                                                    : r.role == USER_ROLE.mechanic ? <AiFillTool className="scale-125 mr-4 mt-1" />
                                                                        : r.role == USER_ROLE.quant_cl07 ? <SiQuantcast className="scale-125 mr-4 mt-1" />
                                                                            : r.role == USER_ROLE.telctrician ? <MdElectricBolt className="scale-125 mr-4 mt-1" />
                                                                                : r.role == USER_ROLE.toolManager ? <FaToolbox className="scale-125 mr-4 mt-1" />
                                                                                    : r.role == USER_ROLE.upp ? <MdOutlineSupport className="scale-125 mr-4 mt-1" />
                                                                                        : <MdOutlineLocalActivity className="scale-125 mr-4 mt-1" />}
                                            <FaHelmetSafety className="scale-125 mr-4 mt-1" />
                                            <span>{r.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>

                {(UI.step >= STEPS.ENTRADA.CODIGO_HERRAMIENTA && UI.step < STEPS.ENTRADA.OK) &&
                    <div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600">
                        <input {...register("codigoHerramienta", { required: true })} type="text" id="codigoHerramienta"
                            autoComplete='off'
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label htmlFor="codigoHerramienta" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                            Código herramienta</label>
                        {resultadoHerramientas.length > 0 && UI.storageItem == null &&
                            (
                                <div>
                                    <ul className="bg-white border border-gray-100 w-full mt-2 ">
                                        {resultadoHerramientas.map(r => (
                                            <li key={r._id} className="flex pl-8 pr-2 py-1 border-b-2 border-gray-100 relative cursor-pointer hover:bg-yellow-50 hover:text-gray-900"
                                                onClick={() => { setearCodigoHerramienta(r._id, `[${r.identifier}] ${r.product.name}`) }}>
                                                <span>[{r.identifier}] {r.product.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </div>}


                {UI.step > STEPS.SALIDA.QUIEN_RECIBE && UI.user != null && UI.step < STEPS.SALIDA.OK && <div className="flex">
                    <div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600">
                        <input {...register("cantidad", { required: true, valueAsNumber: true, min: 1, max: 10 })}
                            type="number" id="cantidad"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label htmlFor="cantidad" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                            Cantidad</label>
                    </div>
                    <div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600 w-full ml-4">
                        <input {...register("codigoHerramienta", { required: true })} type="text" id="codigoHerramienta"
                            autoComplete='off'
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label htmlFor="codigoHerramienta" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                            Código herramienta</label>
                        {resultadoHerramientas.length > 0 && UI.storageItem == null &&
                            (
                                <div className="absolute">
                                    <ul className="bg-white border border-gray-100 w-full mt-2 ">
                                        {resultadoHerramientas.map(r => (
                                            <li key={r._id} className="flex pl-8 pr-2 py-1 border-b-2 border-gray-100 relative cursor-pointer hover:bg-yellow-50 hover:text-gray-900"
                                                onClick={() => { setearCodigoHerramienta(r._id, `[${r.identifier}] ${r.product.name}`) }}>
                                                <span>[{r.identifier}] {r.product.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </div>
                </div>}

                {(UI.step == STEPS.ENTRADA.CODIGO_HERRAMIENTA || UI.step == STEPS.SALIDA.CODIGO_HERRAMIENTA)
                    && UI.user != null && UI.storageItem == null && <div className="shadow-xl rounded-lg p-4 w-full">
                        <div className="flex justify-center">
                            {UI.user.avatarImg != "" ?
                                <img className="w-32 h-32 rounded-full" src={UI.user.avatarImg} alt="Jese image" />
                                :
                                <FaRegCircleUser className="text-slate-300 bg-slate-400 rounded-full w-32 h-32" />
                            }
                            <div className="ml-4">
                                <p className="text-3xl">{UI.user.name}</p>
                                <p className="text-sm text-gray-500">RUT {UI.user.rut || '--.---.-----'}</p>
                                <p className="flex text-2xl">{UI.user.yearsOld || '--'} años</p>
                                <div className="flex">
                                    <LiaBirthdayCakeSolid size="2rem" />
                                    <span className="ml-2 mt-2">
                                        {UI.user.birthDate && dayjs(UI.user.birthDate).diff(new Date(), 'days')} - {UI.user.birthDate ? UI.user.birthDate.toDateString() : '--/--/----'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {false && <div className="columns-2 gap-4">
                            <div className="w-full shadow-lg rounded-md m-2 p-2 break-inside-avoid-column cursor-pointer hover:scale-105">
                                <div className="flex">
                                    <FaHelmetSafety className="text-slate-600 m-2" size="5rem" />
                                    <div className="mt-10">
                                        <p className="text-xs ml-2 text-gray-500">Estado</p>
                                        <div className="flex">
                                            <div className="h-3 w-3 rounded-full bg-green-500 m-1"></div>
                                            <span className="text-green-500 text-sm">Bueno</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">Reemplazo: 6/dic/23</p>
                            </div>
                            <div className="w-full shadow-lg rounded-md m-2 p-2 break-inside-avoid-column cursor-pointer hover:scale-105">
                                <div className="flex">
                                    <GiGloves className="text-slate-600 m-2" size="5rem" />
                                    <div className="mt-10">
                                        <p className="text-xs ml-2 text-gray-500">Estado</p>
                                        <div className="flex">
                                            <div className="h-3 w-3 rounded-full bg-orange-500 m-1"></div>
                                            <span className="text-orange-500 text-sm">Regular</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">Reemplazo: 6/dic/23</p>
                                <p className="text-white bg-red-400 rounded-md flex p-1"><AiFillAlert size="2rem" className="mr-2" />
                                    <span className="text-sm">Debe 2 pares - 6/dic<br />2 días atrás</span>
                                </p>
                            </div>
                            <div className="w-full shadow-lg rounded-md m-2 p-2 break-inside-avoid-column cursor-pointer hover:scale-105">
                                <div className="flex">
                                    <GiCapeArmor className="text-slate-600 m-2" size="5rem" />
                                    <div className="mt-10">
                                        <p className="text-xs ml-2 text-gray-500">Estado</p>
                                        <div className="flex">
                                            <div className="h-3 w-3 rounded-full bg-red-500 m-1"></div>
                                            <span className="text-red-500 text-sm">Deplorable</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white bg-red-400 rounded-md flex p-1"><TbAlertTriangleFilled size="2rem" className="mr-2" />
                                    <span className="text-sm">Exigir Reemplazo 6/dic/23<br />2 días atrás</span>
                                </p>
                            </div>
                        </div>}

                        {UI.user != null && UI.user.set.length > 0 &&
                            <div>
                                <p className="pt-2">Herramientas en su poder</p>
                                <div className="columns-3 p-2">                                                                    
                                    {UI.user.set.length != 0 && UI.user.set.map(item => (
                                        <div key={item.identifier} className="bg-blue-100 rounded-md p-2 mb-2 break-inside-avoid-column shadow-md cursor-pointer hover:scale-105"
                                            onClick={() => { setearCodigoHerramienta(item.storageItemId, `[${item.identifier}] ${item.name}`) }}>
                                            <div>
                                                <p><b>{item.identifier}</b></p>
                                                <p className="text-sm text-slate-600">{item.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }                        

                        {UI.user.set.length == 0 && (
                            <div className="bg-yellow-100 border-t-4 border-yellow-500 rounded-b text-yellow-900 px-4 py-3 shadow-md mt-4" role="alert">
                                <div className="flex">
                                    <div className="py-1">
                                        <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                                    <div>
                                        <p className="mt-1 font-bold">Sin implementos en su poder</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>}

                {UI.step > STEPS.ENTRADA.CODIGO_HERRAMIENTA && UI.step < STEPS.ENTRADA.OK && UI.user != null && <div className="flex">
                    <div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600">
                        <input {...register("cantidad", { required: true, valueAsNumber: true, min: 1, max: 10 })} 
                        type="number" id="cantidad"
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label htmlFor="cantidad" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                            Cantidad</label>
                    </div>
                    <div className="relative border-2 rounded-md border-gray-300 focus:border-blue-600 w-full ml-4">
                        <select id="estado"
                            {...register("estado", { required: true, min: 1, valueAsNumber: true })}
                            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            <option value={0}>Seleccione uno</option>
                            <option value={STORAGE_ITEM_STATE.operative}>Operativo</option>
                            <option value={STORAGE_ITEM_STATE.reparation}>No funciona</option>
                            <option value={STORAGE_ITEM_STATE.discard}>A Desechar</option>
                        </select>
                        <label htmlFor="estado" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Estado</label>
                    </div>
                </div>}

                {isDirty && isValid
                    && (UI.step == STEPS.ENTRADA.CONFIRMACION || UI.step == STEPS.SALIDA.CONFIRMACION) &&
                    <div>
                        <button type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Guardar</button>
                    </div>}

                {(UI.step == STEPS.ENTRADA.GUARDANDO || UI.step == STEPS.SALIDA.GUARDANDO) &&
                    <Loader />}

                {(UI.step == STEPS.ENTRADA.OK || UI.step == STEPS.SALIDA.OK) &&
                    <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
                        <div className="flex">
                            <div className="py-1">
                                <svg className="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20">
                                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                                </svg>
                            </div>
                            <div>
                                <p><b>{UI.step == STEPS.ENTRADA.OK ? 'Entrada' : 'Salida'} de {UI.storageItem?.product.name}</b> correcto</p>
                                <p className="text-sm">Todos los indicadores han sido actualizados</p>
                            </div>
                        </div>
                    </div>}
            </form>
        </div>
    )
}