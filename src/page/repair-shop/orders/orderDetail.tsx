"use client"

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOrderByIdApi } from '@/api/Order/orderApi'
import type { OrderDetailResponseData } from '@/types/Order/order'

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

export default function RepairShopOrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [order, setOrder] = useState<OrderDetailResponseData | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setError(null)
        getOrderByIdApi(id)
            .then((res) => {
                if (res && res.data) setOrder(res.data as OrderDetailResponseData)
                else setError('Không tìm thấy đơn hàng')
            })
            .catch((err) => {
                console.error('getOrderByIdApi error', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải đơn hàng')
            })
            .finally(() => setLoading(false))
    }, [id])

    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && <div>Đang tải...</div>}
                            {error && <div className="text-destructive">{error}</div>}

                            {order && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã đơn hàng</div>
                                        <div className="truncate">{getShortId(order.id)}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã đơn hàng (code)</div>
                                        <div>{order.orderCode || '-'}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Trạng thái</div>
                                        <div>{order.status}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Tổng tiền</div>
                                        <div>{order.totalAmount?.toLocaleString() || 0} đ</div>
                                    </div>
                                    <div>
                                        <div className="font-medium mb-2">Sản phẩm</div>
                                        {order.items && order.items.length > 0 ? (
                                            <div className="space-y-2">
                                                {order.items.map((it, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <div className="truncate">{it.productVariantName || it.productVariantId || it.productOptionName || 'Sản phẩm'}</div>
                                                        <div className="text-sm">{(it.quantity || 0)} x {it.price ? `${it.price.toLocaleString()} đ` : '-'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">Không có sản phẩm chi tiết.</div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Button variant="outline" onClick={() => navigate('/repair-shop/orders')}>Quay lại</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
