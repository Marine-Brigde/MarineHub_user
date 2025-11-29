"use client"

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PaymentResult from '@/components/payment/PaymentResult'
import Header from '@/components/common/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { getOrderByIdApi } from '@/api/Order/orderApi'
import type { OrderResponseData } from '@/types/Order/order'

export default function PaymentSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [order, setOrder] = useState<OrderResponseData | null>(null)

    // determine payment status from query params (mirror PaymentResult logic)
    const statusRaw = (searchParams.get('status') || searchParams.get('payment_status') || searchParams.get('paymentStatus') || searchParams.get('result') || '')?.toLowerCase()
    const isSuccess = ['success', 'paid', 'completed', 'ok'].includes(statusRaw)

    useEffect(() => {
        // look for common param names that payment providers might use
        const id = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('order') || searchParams.get('order_id') || searchParams.get('token')
        if (!id) return

        let mounted = true
        setLoading(true)
        setError(null)

        getOrderByIdApi(id)
            .then((res) => {
                if (!mounted) return
                if (res && res.data) {
                    setOrder(res.data)
                } else {
                    setError('Không tìm thấy đơn hàng.')
                }
            })
            .catch((err) => {
                console.error('getOrderByIdApi error', err)
                if (!mounted) return
                setError(err?.response?.data?.message || 'Lỗi khi lấy thông tin đơn hàng.')
            })
            .finally(() => {
                if (!mounted) return
                setLoading(false)
            })

        return () => { mounted = false }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircle className="text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Kết quả thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 text-center">Trạng thái thanh toán sẽ hiển thị bên dưới. Nếu bạn được chuyển hướng tới trang thanh toán, hãy hoàn tất giao dịch — sau đó bạn sẽ được trả về trang này.</p>

                            <div className="flex flex-col items-center gap-4">
                                <PaymentResult />

                                <div className="w-full max-w-md">
                                    {loading && <p className="text-sm text-muted-foreground">Đang tải thông tin đơn hàng...</p>}
                                    {error && <p className="text-sm text-destructive">{error}</p>}

                                    {order && (
                                        <div className="rounded-md border p-4 bg-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-sm font-medium">Mã đơn hàng</div>
                                                <div className="text-sm text-muted-foreground truncate">{order.id}</div>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="text-sm font-medium">Tổng tiền</div>
                                                <div className="text-sm">{order.totalAmount?.toLocaleString()} đ</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium">Trạng thái</div>
                                                <div className="text-sm">{order.status}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 justify-center mt-4">
                                        {/* Confirm -> go to repair-shop orders when payment success */}
                                        {isSuccess && (
                                            <Button onClick={() => navigate('/repair-shop/orders')}>Xác nhận</Button>
                                        )}

                                        <Button variant="outline" onClick={() => navigate('/')}>Về trang chủ</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
