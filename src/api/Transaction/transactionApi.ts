import axiosClient from '../axiosClient'

export type Transaction = {
    id: string
    transactionReference: string
    amount: number
    createdDate: string
    lastModifiedDate: string
    status: string
    type: string
}

export type TransactionListResponse = {
    size: number
    page: number
    total: number
    totalPages: number
    items: Transaction[]
}

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

    return response.data
}
