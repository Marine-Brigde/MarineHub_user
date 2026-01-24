"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, ArrowLeft, ChevronDown, X, PrinterIcon } from "lucide-react"
import { getOrdersApi, getOrderByIdApi } from "@/api/Order/orderApi"
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"

const statusText: Record<string, string> = {
    'approved': 'Đã duyệt',
    'pending': 'Chờ duyệt',
    'rejected': 'Từ chối',
    'cancelled': 'Đã hủy',
    'completed': 'Hoàn thành',
    'processing': 'Đang xử lý',
    'delivered': 'Đã giao'
}

const statusVariant = (status?: string): any => {
    switch ((status || '').toLowerCase()) {
        case 'approved':
        case 'completed':
        case 'delivered':
            return 'default'
        case 'pending':
        case 'processing':
            return 'secondary'
        case 'rejected':
        case 'cancelled':
            return 'destructive'
        default:
            return 'outline'
    }
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export default function OrdersListPage() {
    const { transactionId } = useParams()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<any[]>([])
    const [ordersDetail, setOrdersDetail] = useState<Record<string, any>>({})
    const [transaction, setTransaction] = useState<Transaction | null>(null)
    const [loading, setLoading] = useState(false)
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    // Tính commission percent từ so sánh transaction amount và orders total
    const commissionFeePercent = useMemo(() => {
        if (!transaction || !orders.length) return 5

        const totalOrdersAmount = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
        const transactionAmount = transaction.amount || 0

        if (totalOrdersAmount === 0) return 5

        // Platform fee = Tổng tiền orders - Tiền supplier nhận
        const platformFee = totalOrdersAmount - transactionAmount
        const percent = (platformFee / totalOrdersAmount) * 100

        return Math.max(0, Math.min(100, percent)) // Giới hạn từ 0-100%
    }, [transaction, orders])

    useEffect(() => {
        const load = async () => {
            if (!transactionId) return

            setLoading(true)
            setError(null)
            try {
                // Lấy thông tin transaction
                const transRes = await getTransactionsApi({ page: 1, size: 100 })
                const transData = (transRes as any)?.data ?? (transRes as any)
                const foundTrans = transData?.items?.find((t: Transaction) => t.id === transactionId)

                if (foundTrans) {
                    setTransaction(foundTrans)

                    // Lấy orders trong tháng của transaction
                    const createdDate = new Date(foundTrans.createdDate)
                    const firstDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1)
                    const lastDay = new Date(createdDate.getFullYear(), createdDate.getMonth() + 1, 0)

                    const ordersRes = await getOrdersApi({
                        startDate: firstDay.toISOString().split('T')[0],
                        endDate: lastDay.toISOString().split('T')[0],
                        page: 1,
                        pageSize: 100,
                    })

                    const ordersData = (ordersRes as any)?.data ?? (ordersRes as any)
                    const ordersList = ordersData?.items ?? []
                    setOrders(ordersList)

                    // Load detail cho mỗi order
                    const details: Record<string, any> = {}
                    for (const order of ordersList) {
                        try {
                            const detailRes = await getOrderByIdApi(order.id)
                            details[order.id] = (detailRes as any)?.data ?? (detailRes as any)
                        } catch (e) {
                            console.error(`Failed to load detail for order ${order.id}:`, e)
                        }
                    }
                    setOrdersDetail(details)
                }
            } catch (err: any) {
                setError(err?.message || 'Không thể tải đơn hàng')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [transactionId])

    const handlePreview = () => {
        setShowPreview(true)
    }

    const handlePrint = () => {
        // Giữ nguyên nội dung invoice và chỉ hiển thị phần cần in
        setTimeout(() => window.print(), 50)
    }

    const printStyles = `@media print {
        body { margin: 0; background: #ffffff; }
        .screen-only { display: none !important; }
        #printable-invoice { display: block !important; position: static !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 16px !important; }
        #printable-invoice, #printable-invoice * { visibility: visible !important; color: #000 !important; }
        body *:not(#printable-invoice):not(#printable-invoice *) { visibility: hidden !important; }
    }`

    return (
        <>
            <style>{printStyles}</style>
            <div className="p-4 space-y-4 print:hidden screen-only">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">Đơn hàng</h1>
                            {transaction && (
                                <p className="text-xs text-muted-foreground">
                                    {transaction.transactionReference}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePreview} disabled={loading || orders.length === 0}>
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Xem & In
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            title="Đóng"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Danh sách đơn hàng</CardTitle>
                        <CardDescription className="text-xs">
                            {orders.length} đơn hàng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang tải...</span>
                            </div>
                        ) : error ? (
                            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded">{error}</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Không có đơn hàng nào
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table className="text-sm">
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-xs h-9 w-8"></TableHead>
                                            <TableHead className="text-xs h-9">Mã đơn</TableHead>
                                            <TableHead className="text-xs h-9">Tàu</TableHead>
                                            <TableHead className="text-xs h-9">SĐT</TableHead>
                                            <TableHead className="text-xs text-right h-9">Tổng tiền</TableHead>
                                            <TableHead className="text-xs h-9">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => {
                                            const isExpanded = expandedOrderId === order.id
                                            const detail = ordersDetail[order.id]

                                            return (
                                                <>
                                                    <TableRow key={order.id} className="hover:bg-muted/50 h-9">
                                                        <TableCell className="text-center py-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                            >
                                                                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs py-2">
                                                            {order.id.slice(0, 8)}...
                                                        </TableCell>
                                                        <TableCell className="text-xs py-2">{order.shipName || '-'}</TableCell>
                                                        <TableCell className="text-xs py-2">{order.phone || '-'}</TableCell>
                                                        <TableCell className="text-xs text-right py-2 font-medium">
                                                            {fmtCurrency(order.totalAmount)} đ
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <Badge variant={statusVariant(order.status)} className="text-xs">
                                                                {statusText[order.status?.toLowerCase()] || order.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>

                                                    {isExpanded && detail?.orderItems && (
                                                        <TableRow key={`detail-${order.id}`} className="bg-muted/30">
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-3 space-y-2">
                                                                    <div className="text-xs font-semibold">Chi tiết sản phẩm:</div>
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="border-b">
                                                                                <th className="text-left p-2 font-medium">Sản phẩm</th>
                                                                                <th className="text-center p-2 font-medium w-12">SL</th>
                                                                                <th className="text-right p-2 font-medium w-24">Giá</th>
                                                                                <th className="text-right p-2 font-medium w-24">Thành tiền</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {detail.orderItems.map((item: any, idx: number) => (
                                                                                <tr key={idx} className="border-b">
                                                                                    <td className="p-2">{item.productVariantName || item.productOptionName || '-'}</td>
                                                                                    <td className="text-center p-2">{item.quantity || 1}</td>
                                                                                    <td className="text-right p-2">{fmtCurrency(item.price || 0)} đ</td>
                                                                                    <td className="text-right p-2 font-medium">{fmtCurrency((item.price || 0) * (item.quantity || 1))} đ</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Invoice Modal */}
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:hidden">
                        <DialogHeader className="sticky top-0 bg-white z-10">
                            <DialogTitle>Xem hóa đơn</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <PrintInvoice orders={orders} ordersDetail={ordersDetail} transaction={transaction} commissionFeePercent={commissionFeePercent} />
                            <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowPreview(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handlePrint}>
                                    <PrinterIcon className="h-4 w-4 mr-2" />
                                    In hóa đơn
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div id="printable-invoice" className="absolute -left-[9999px] top-0 print:static print:left-0 print:block print:w-full p-4 bg-white text-black">
                <PrintInvoice orders={orders} ordersDetail={ordersDetail} transaction={transaction} commissionFeePercent={commissionFeePercent} />
            </div>
        </>
    )
}

function PrintInvoice({ orders, ordersDetail, transaction, commissionFeePercent }: any) {
    const allItems = Object.values(ordersDetail).flatMap((detail: any) => detail?.orderItems || [])
    const totalAmount = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
    const platformFee = totalAmount * (commissionFeePercent / 100)
    const netAmount = totalAmount - platformFee

    const itemsBySupplier = allItems.reduce((acc: any, item: any) => {
        const supplierId = item.supplierId || 'unknown'
        if (!acc[supplierId]) {
            acc[supplierId] = {
                supplierId,
                supplierName: item.supplierName || 'Không xác định',
                items: []
            }
        }
        acc[supplierId].items.push(item)
        return acc
    }, {})

    return (
        <div className="w-full space-y-6 bg-white p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold">HÓA ĐƠN TỔNG HỢP</h1>
                <p className="text-xs text-gray-600 mt-1">Giao dịch: {transaction?.transactionReference}</p>
            </div>

            <div className="border-t border-b py-3">
                <p className="text-xs"><strong>Số đơn hàng:</strong> {orders.length}</p>
                <p className="text-xs"><strong>Ngày:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            {Object.values(itemsBySupplier).map((group: any) => {
                const supplierTotal = group.items.reduce((sum: number, item: any) =>
                    sum + (item.price || 0) * (item.quantity || 1), 0
                )
                return (
                    <div key={group.supplierId} className="mb-4">
                        <h3 className="font-semibold text-xs mb-2">{group.supplierName}</h3>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Sản phẩm</th>
                                    <th className="text-center p-2 w-10">SL</th>
                                    <th className="text-right p-2 w-20">Giá</th>
                                    <th className="text-right p-2 w-20">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b">
                                        <td className="p-2">{item.productVariantName || item.productOptionName || '-'}</td>
                                        <td className="text-center p-2">{item.quantity || 1}</td>
                                        <td className="text-right p-2">{new Intl.NumberFormat('vi-VN').format(item.price || 0)} đ</td>
                                        <td className="text-right p-2 font-medium">{new Intl.NumberFormat('vi-VN').format((item.price || 0) * (item.quantity || 1))} đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-right mt-1 pr-2">
                            <p className="text-xs font-semibold">Cộng: {new Intl.NumberFormat('vi-VN').format(supplierTotal)} đ</p>
                        </div>
                    </div>
                )
            })}

            <div className="border-t pt-3">
                <div className="flex justify-between text-xs mb-1">
                    <span>Tổng tiền:</span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</span>
                </div>
                <div className="flex justify-between text-xs text-red-600 mb-2">
                    <span>Phí nền tảng ({commissionFeePercent}%):</span>
                    <span>- {new Intl.NumberFormat('vi-VN').format(platformFee)} đ</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                    <span className="text-sm">Nhà cung cấp nhận:</span>
                    <span className="text-blue-600 text-sm">{new Intl.NumberFormat('vi-VN').format(netAmount)} đ</span>
                </div>
            </div>

            <div className="text-xs text-gray-600 text-center">
                • Số tiền trên đã trừ {commissionFeePercent}% phí nền tảng
            </div>
        </div>
    )
}
