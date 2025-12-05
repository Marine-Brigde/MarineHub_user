"use client"


import { useNavigate, useSearchParams } from 'react-router-dom'
import PaymentResult from '@/components/payment/PaymentResult'
import Header from '@/components/common/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // determine payment status from query params (mirror PaymentResult logic)
    const statusRaw = (searchParams.get('status') || searchParams.get('payment_status') || searchParams.get('paymentStatus') || searchParams.get('result') || '')?.toLowerCase()
    const isSuccess = ['success', 'paid', 'completed', 'ok'].includes(statusRaw)

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
