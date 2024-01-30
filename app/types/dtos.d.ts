
interface IPurchaseOrderDTO {
    id: string,
    identifier: string,
    site: string,
    invoiceAccount: string,
    vendorName: string,
    approvalStatus: number,
    status: number,
    currency: string,
    requestReceiptDate: Date,
    projectId: string,
    requesterName: string,
    termsOfPayment: string,
    creatorName: string,
    createdAt: Date,
    items: IPurchaseOrderItemDTO[],
}

interface IPurchaseOrderItemDTO {
    lineNumber: number,
    identifier: string,
    productName: string,
    description: string,
    quantity: number,
    unit: string,
    unitPrice: number,
    netAmount: number,
}

interface IPurchaseOrderListDTO {
    id: string,
    identifier: string,
    totalItems: number,
    totalAmount: number,
    currency: string,
    requestDate: Date,
    status: number,
    items: IPurchaseOrderItemDTO[],
}