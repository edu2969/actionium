interface IUser {
    _id: string,
    name: string,
    email: string,
    role: number | null,
    gender: string | undefined,
    birthDate: Date | undefined,
    rut: string | undefined,
    avatarImg: string | undefined,
}

interface IVendor {
    _id: string | undefined,
    userId: string | undefined,
    name: string,
    rut: string | undefined,
}

interface IBIVendor {
    _id: string | undefined,
    vendorId: string,
    productId: string | undefined,
    price: number | undefined,
    date: Date,
    period: "week" | "moth" | "year",
    totalAmount: number,
}

interface IPurchaseOrder {
    identifier: string,
    site: string,
    invoiceAccount: string,
    vendorId: string,
    approvalStatus: number,
    status: number,
    currency: string,
    requesterId: string,
    requestReceiptDate: Date,
    projectId: string,
    termsOfPayment: string,
    creatorId: string,
    createdAt: Date    
}

interface IPurchaseOrderItem {
    _id: string | undefined,
    purchaseOrderId: string,
    lineNumber: number,
    productId: string,
    quantity: number,
    unitPrice: number,
    netAmount: number,
}

interface IProduct {
    _id: string | undefined,
    identifier: string,
    name: string,
    unit: string,
    description: string,
    stockRanges: {
        min: number,
        max: number,
    },
}

interface IPriceLog {
    _id: string | undefined,
    productId: string,
    date: Date,
    value: number,
    currency: string,    
}

interface IToolStorage {
    _id: string | undefined,
    managerId: string,
    startAt: Date,
    endAt: Date
}

interface IStorageItem {
    _id: string | undefined,
    identifier: string,
    quantities: {
        operatives: number,
        reparation: number,
        terrain: number,
        disposables: number,
        total: number,
    },    
    stockRanges: {
        min: number,
        max: number
    },
}

interface IDateValuePoint {
    date: Date,
    value: number,
}

interface IBIToolStorage {
    date: Date,
    period: string,
    quantities: {
        operative: number,
        reparation: number,
        terrain: number,
        total: number,
    },
    toolStorageId: string,
    totalAmount: number,
    _id: string,
}

