import axiosClient from '../axiosClient'

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processing'
export type TransactionType = 'Revenue' | 'Boatyard' | 'Supplier'

export type Transaction = {
    id: string
    transactionReference: string
    amount: number
    supplierId?: string
    supplierName?: string
    boatyardId?: string
    boatyardName?: string
    createdDate: string
    lastModifiedDate: string
    status: TransactionStatus
    type: TransactionType
}

export type TransactionListResponse = {
    size: number
    page: number
    total: number
    totalPages: number
    items: Transaction[]
}

// Get transactions with null fields removed
export const getTransactionsApi = async (params?: { page?: number; size?: number; sortBy?: string; isAsc?: boolean }) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 30,
        sortBy: params?.sortBy ?? 'createdDate',
        isAsc: params?.isAsc ?? false,
    }

    const response = await axiosClient.get<{ status: number; message: string; data: TransactionListResponse }>(
        '/v1/transactions',
        { params: queryParams }
    )

    if (response.data?.data?.items) {
        // Remove null values from each transaction
        response.data.data.items = response.data.data.items.map((item: any) => {
            const cleaned: any = {}
            Object.keys(item).forEach((key) => {
                if (item[key] !== null) {
                    cleaned[key] = item[key]
                }
            })
            return cleaned as Transaction
        })
    }

    return response.data
}
