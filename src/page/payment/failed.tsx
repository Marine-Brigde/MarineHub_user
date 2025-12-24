"use client"

import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/common/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PaymentFailedPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const statusRaw = (searchParams.get('status') || searchParams.get('payment_status') || searchParams.get('paymentStatus') || searchParams.get('result') || '').toLowerCase()
    const message = searchParams.get('message') || searchParams.get('msg') || ''
    const orderCode = searchParams.get('orderCode') || searchParams.get('order_code') || searchParams.get('order') || ''
    const cancel = searchParams.get('cancel') || ''

    // Determine if it was cancelled or failed
    const isCancelled = cancel === 'true' || statusRaw === 'cancelled' || statusRaw === 'canceled'

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-lg border-destructive/50">
                        <CardHeader className="text-center pb-4">
                            <div className="flex items-center justify-center mb-4">
                                <div className={`rounded-full p-4 ${isCancelled ? 'bg-amber-100' : 'bg-red-100'}`}>
                                    {isCancelled ? (
                                        <AlertTriangle className="h-12 w-12 text-amber-600" />
                                    ) : (
                                        <XCircle className="h-12 w-12 text-red-600" />
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                {isCancelled ? 'Thanh toán đã bị hủy' : 'Thanh toán thất bại'}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                {isCancelled
                                    ? 'Bạn đã hủy giao dịch thanh toán'
                                    : 'Giao dịch không thể hoàn tất'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Error Details */}
                            <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                                <AlertDescription className="text-sm">
                                    {message || (isCancelled
                                        ? 'Giao dịch đã bị hủy bỏ. Không có khoản tiền nào được trừ từ tài khoản của bạn.'
                                        : 'Không thể xử lý thanh toán. Vui lòng kiểm tra lại thông tin và thử lại.')}
                                </AlertDescription>
                            </Alert>

                            {/* Order Info */}
                            {orderCode && (
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Mã đơn hàng:</span>
                                        <span className="font-mono font-medium">{orderCode}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Trạng thái:</span>
                                        <span className="text-destructive font-medium">
                                            {isCancelled ? 'Đã hủy' : 'Thất bại'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                                    {isCancelled ? 'Bạn có thể:' : 'Gợi ý xử lý:'}
                                </h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5 list-disc list-inside">
                                    {isCancelled ? (
                                        <>
                                            <li>Thử thanh toán lại nếu bạn vẫn muốn đặt hàng</li>
                                            <li>Kiểm tra lại thông tin đơn hàng trước khi thanh toán</li>
                                            <li>Liên hệ hỗ trợ nếu cần trợ giúp</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Kiểm tra lại số dư tài khoản của bạn</li>
                                            <li>Đảm bảo thông tin thẻ/tài khoản chính xác</li>
                                            <li>Thử lại với phương thức thanh toán khác</li>
                                            <li>Liên hệ ngân hàng nếu vấn đề vẫn tiếp tục</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={() => navigate(-1)}
                                    variant="default"
                                    className="flex-1 gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Thử lại thanh toán
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outline"
                                    className="flex-1 gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Về trang chủ
                                </Button>
                            </div>

                            {/* Support Link */}
                            <div className="text-center pt-2">
                                <p className="text-xs text-muted-foreground">
                                    Cần hỗ trợ?{' '}
                                    <button
                                        onClick={() => {/* Add support chat or contact logic */ }}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Liên hệ bộ phận chăm sóc khách hàng
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
