"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, PrinterIcon, X } from "lucide-react"
import { getOrderByIdApi } from "@/api/Order/orderApi"

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

export default function OrderDetailPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!orderId) return

            setLoading(true)
            setError(null)
            try {
                const res = await getOrderByIdApi(orderId)
                const orderData = (res as any)?.data ?? (res as any)
                setOrder(orderData)
            } catch (err: any) {
                setError(err?.message || 'Không thể tải chi tiết đơn hàng')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [orderId])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tải...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-destructive">{error}</div>
                <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
            </div>
        )
    }

    if (!order) return null

    // Nhóm items theo supplier
    const itemsBySupplier = order.orderItems?.reduce((acc: any, item: any) => {
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
    }, {}) || {}

    // Tính toán phí 5%
    const platformFee = order.totalAmount * 0.05
    const netAmount = order.totalAmount - platformFee

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">HÓA ĐƠN ĐƠN HÀNG</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Mã: <span className="font-mono font-semibold">{order.id.slice(0, 12)}...</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => window.print()}>
                        <PrinterIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="print:shadow-none">
                <CardContent className="p-4 space-y-4">
                    {/* Thông tin chung */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Thông tin tàu</h3>
                            <div className="space-y-1 text-xs">
                                <p><span className="text-muted-foreground">Tên tàu:</span> <span className="font-medium">{order.shipName || '-'}</span></p>
                                <p><span className="text-muted-foreground">SĐT:</span> <span className="font-medium">{order.phone || '-'}</span></p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Thông tin đơn</h3>
                            <div className="space-y-1 text-xs">
                                <p><span className="text-muted-foreground">Trạng thái:</span> <Badge variant={statusVariant(order.status)} className="ml-2 text-xs">{statusText[order.status?.toLowerCase()] || order.status}</Badge></p>
                                {order.boatyardName && (
                                    <p><span className="text-muted-foreground">Xưởng:</span> <span className="font-medium text-xs">{order.boatyardName}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Chi tiết sản phẩm/dịch vụ - nhóm theo nhà cung cấp */}
                    {order.orderItems && order.orderItems.length > 0 && (
                        <>
                            <div className="space-y-4">
                                {Object.values(itemsBySupplier).map((supplierGroup: any) => {
                                    const supplierSubtotal = supplierGroup.items.reduce((sum: number, item: any) => 
                                        sum + (item.price || 0) * (item.quantity || 1), 0
                                    )
                                    
                                    return (
                                        <div key={supplierGroup.supplierId}>
                                            <h4 className="font-semibold text-xs mb-2">{supplierGroup.supplierName}</h4>
                                            <div className="border rounded overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-muted">
                                                        <tr>
                                                            <th className="text-left p-2 font-medium">Sản phẩm</th>
                                                            <th className="text-center p-2 font-medium">SL</th>
                                                            <th className="text-right p-2 font-medium">Giá</th>
                                                            <th className="text-right p-2 font-medium">Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {supplierGroup.items.map((item: any, idx: number) => (
                                                            <tr key={idx} className="border-t">
                                                                <td className="p-2">{item.productVariantName || item.productOptionName || '-'}</td>
                                                                <td className="text-center p-2">{item.quantity || 1}</td>
                                                                <td className="text-right p-2">{fmtCurrency(item.price || 0)} đ</td>
                                                                <td className="text-right p-2 font-medium">{fmtCurrency((item.price || 0) * (item.quantity || 1))} đ</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="text-right mt-1 pr-2">
                                                <p className="text-xs font-medium">Cộng: <span>{fmtCurrency(supplierSubtotal)} đ</span></p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Separator className="my-2" />
                        </>
                    )}

                    {/* Tổng kết thanh toán */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm mb-2">Tổng kết</h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng tiền:</span>
                                <span className="font-medium">{fmtCurrency(order.totalAmount)} đ</span>
                            </div>
                            <div className="flex justify-between text-destructive">
                                <span>Phí nền tảng (5%):</span>
                                <span>- {fmtCurrency(platformFee)} đ</span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between font-bold text-sm">
                                <span>Nhà cung cấp nhận:</span>
                                <span className="text-primary">{fmtCurrency(netAmount)} đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-2">
                        <p>• Số tiền trên đã trừ 5% phí nền tảng</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
