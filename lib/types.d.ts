type ClientItemListType = {
    id: string,
    imgLogo: string,
    name: string,
    email: string
}

type UserFormType = {
    id: string | undefined,
    name: string,
    email: string,
    avatarImg: string | null,
}

type ContractItemListType = {
    id: string,
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
    taskShortDescription: string,
    percentaje: number,
    from: Date,
    to: Date,
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
    todos: TodoFormType[] = [],
    logs: LogFromType[] = [],
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