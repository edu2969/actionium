type ClientItemListType = {
    id: string,
    _id: string,
    imgLogo: string,
    name: string,
    email: string
}

type ClientFormType = {
    id: string | undefined,
    name: string,
    completeName: string,
    identificationId: string,
    identificationType: string,
    email: string,
    address: string,
    imgLogo: string
}

type UserListType = {
    id: string,
    avatarImg: string | null,
    clientImg: string | null,
    email: string,
    name: string,
    role: number
}

type UserFormType = {
    id: string | undefined,
    _id: string,
    name: string,
    email: string,
    password: string,
    role: string,
    rut: string,
    gener: string | null,
    birthDate: Date,    
    avatarImg: string | null,
}

type ContractItemListType = {
<<<<<<< HEAD
    id: string,
=======
>>>>>>> 257f9fa7eff636670c761e23e7b8cee25c807e20
    _id: string,
    clientImg: string,
    clientName: string,
    identifier: number,
    title: string,
    status: number,
    currency: string,
    netAmount: number,
    rentability: number,
    termsOfPayment: string
}

type ContractFormType = {
    id: string | undefined,
    title: string,
    clientId: string | null,
    vendorId: string | null,
    status: string,
    currency: string | null,
    netAmount: number,
    termsOfPayment: string | null   
}

type ProjectItemListType = {
    id: string,
    identifier: number,
    clientImg: string,
    clientName: string,
    contractId: string,
    projectType: number,                
    title: string,
    status: number,
    progress: number,
    rentability: number,
    kickOff: Date,
    end: Date,
}

type ProjectFormType = {
    id: string | undefined,
    projectType: number,
    contractId: string,
    clientId: string,
    title: string,
    status: number,
    kickOff: Date,
    end: Date
}

type SprintView = {
    lastUpdate: Date,
    endDate: Date | null,
    estimatedEndDate: Date | null,
    progress: number,
    sprints: SprintItemView[],
}

type SprintItemView = {
    title: string,
    taskIndexFrom: string,
    taskIndexTo: string,
    startDate: Date,
    endDate: Date,
    percentaje: number,
}

type TaskItemListType = {
    id: string,
    asignedToImg: string,
    identifier: number,
    taskType: number,
    title: string,
    status: number,
    weight: number,
    estimatedWeight: number,
    startDate: Date,
    endDate: Date,
    progress: number,
    updatedAt: Date,
    todos: TodoType[],
}

type TodoType = {
    finishedAt: Date | null,
    title: string,
    hours: number,
}

type TaskFormType = {
    id: string | undefined,
    projectId: string,
    priority: number,
    title: string,
    asignedTo: string | null,
    taskType: number | null,
    status: number,
    description: string,
    weight: number,
    estimatedWeight: number,
    startDate: Date | null,
    endDate: Date | null,
    todos: TodoFormType[],
    logs: LogFromType[],
}

type TodoFormType = {
    finishedAt: Date | null,
    title: string,
    hours: number,
}

type LogFromType = {
    collaboratorId: string,
    date: Date,
    entry: string,
}

type IBIToolStorage = {
    date: Date,
    value: number,
}


// types/dashboard.ts
import { Types } from 'mongoose';

// ============================================
// TIPOS PARA LA RESPUESTA DEL API
// ============================================

// Notificación de contrato
export interface ContractNotification {
    type: string;
    message: string;
}

// Contrato en la respuesta
export interface DashboardContract {
    id: string;
    name: string;
    status: 'active' | 'pending' | 'completed' | 'suspended' | 'expired' | 'cancelled';
    profitability: number;
    netAmount: number;
    notifications: ContractNotification[];
}

// Cliente en la respuesta
export interface DashboardClient {
    id: string;
    type: 'client';
    health: number;
    alerts: string[];
    logo: string;
    revenue: number;
    growth: number;
    contracts: DashboardContract[];
}

// Compañía central en la respuesta
export interface DashboardCentral {
    id: string;
    type: 'company' | 'contract' | 'central';
    health: number;
    power: number;
    efficiency: number;
    logo: string;
}

// Respuesta completa del dashboard
export interface DashboardResponse {
    central: DashboardCentral;
    clients: DashboardClient[];
}

// ============================================
// TIPOS PARA LOS DATOS DE MONGODB (LEAN)
// ============================================

// Documento de Cliente (lean)
export interface LeanClient {
    _id: Types.ObjectId;
    name: string;
    imgLogo?: string;
    [key: string]: any;
}

// Documento de Contrato (lean)
export interface LeanContract {
    _id: Types.ObjectId;
    clientId: Types.ObjectId;
    title: string;
    identifier: number;
    status: number;
    netAmount: number;
    balance?: number;
    [key: string]: any;
}

// Documento de Proyecto (lean)
export interface LeanProject {
    _id: Types.ObjectId;
    contractId: Types.ObjectId;
    netAmount?: number;
    rentability?: number;
    [key: string]: any;
}

// Documento de Tarea (lean)
export interface LeanTask {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    priority: number;
    taskType: number;
    status: number;
    assignedTo?: Types.ObjectId;
    weight?: number;
    estimatedWeight?: number;
    title?: string;
    description?: string;
    logs?: Array<{
        collaboratorId: Types.ObjectId;
        date: Date;
        entry: string;
        hours?: number;
    }>;
    todos?: Array<{
        finishedAt?: Date;
        title: string;
        hours: number;
    }>;
    startDate?: Date;
    endDate?: Date;
    progress?: number;
    hours?: number;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}

// ============================================
// TIPOS INTERNOS PARA EL PROCESAMIENTO
// ============================================

// Tarea procesada con datos calculados
export interface ProcessedTask {
    id: Types.ObjectId;
    title: string;
    status: number;
    progress: number;
    hours: number;
    completed: boolean;
    endDate?: Date;
}

// Proyecto procesado con tareas
export interface ProcessedProject {
    _id: Types.ObjectId;
    contractId: Types.ObjectId;
    progress: number;
    totalHours: number;
    rentability: number;
    tasks: ProcessedTask[];
    [key: string]: any;
}

// Contrato procesado
export interface ProcessedContract {
    id: string;
    name: string;
    status: 'active' | 'pending' | 'completed' | 'suspended' | 'expired' | 'cancelled';
    profitability: number;
    netAmount: number;
    notifications: ContractNotification[];
}

// Cliente procesado
export interface ProcessedClient {
    id: string;
    type: 'client';
    health: number;
    alerts: string[];
    logo: string;
    revenue: number;
    growth: number;
    contracts: ProcessedContract[];
}