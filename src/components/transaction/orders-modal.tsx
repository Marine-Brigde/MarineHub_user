"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { type Transaction } from "@/api/Transaction/transactionApi"
import { getOrdersApi } from "@/api/Order/orderApi"

interface OrdersModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
}

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(-8) : id
}

export function OrdersModal({ open, onOpenChange, transaction }: OrdersModalProps) {
    const [ordersData, setOrdersData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open || !transaction) {
            setOrdersData(null)
            setError(null)
            return
        }

        const loadOrders = async () => {
            setLoading(true)
            setError(null)
            try {
                if (!transaction.supplierId) {
                    setError('Không tìm thấy ID nhà cung cấp')
                    return
                }

                const createdDate = new Date(transaction.createdDate)
                const firstDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1)
                const lastDay = new Date(createdDate.getFullYear(), createdDate.getMonth() + 1, 0)

                const startDateStr = firstDay.toISOString().split('T')[0]
                const endDateStr = lastDay.toISOString().split('T')[0]

                console.log('Fetching orders with:', {
                    supplierId: transaction.supplierId,
                    startDate: startDateStr,
                    endDate: endDateStr,
                })

                const ordersRes = await getOrdersApi({
                    supplierId: transaction.supplierId,
                    startDate: startDateStr,
                    endDate: endDateStr,
                    page: 1,
                    pageSize: 100,
                })

                console.log('Orders response:', ordersRes)
                setOrdersData(ordersRes)
            } catch (err: any) {
                console.error('Error fetching orders:', err)
                setError(err?.response?.data?.message || err?.message || 'Lỗi khi tải đơn hàng')
            } finally {
                setLoading(false)
            }
        }

        loadOrders()
    }, [open, transaction])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng - Nhà cung cấp</DialogTitle>
                    <DialogDescription>
                        Giao dịch: #{transaction ? getShortId(transaction.id) : ''} | {transaction?.supplierName || '-'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Đang tải đơn hàng...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    ) : ordersData ? (
                        <>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Tổng số đơn hàng</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {ordersData?.data?.total ?? 0}
                                </p>
                            </div>

                            {ordersData?.data?.items && ordersData.data.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-sm font-semibold">Mã đơn hàng</TableHead>
                                                <TableHead className="text-sm font-semibold">Trạng thái</TableHead>
                                                <TableHead className="text-sm font-semibold">Ngày tạo</TableHead>
                                                <TableHead className="text-sm font-semibold">Tổng tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ordersData.data.items.map((order: any) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium text-sm">
                                                        #{order.id?.slice(-8) || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <Badge className="bg-blue-100 text-blue-700">
                                                            {order.status || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {order.createdDate ? new Date(order.createdDate).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium text-primary">
                                                        {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : '0'} đ
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Không có đơn hàng nào trong kỳ này
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    )
}
