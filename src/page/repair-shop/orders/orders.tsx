"use client"

import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getOrdersApi } from '@/api/Order/orderApi'
import type { OrderResponseData } from '@/types/Order/order'

export default function RepairShopOrdersPage() {
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState<OrderResponseData[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        getOrdersApi({ page: 1, pageSize: 20 })
            .then((res) => {
                if (res && res.data && res.data.items) {
                    setOrders(res.data.items)
                } else {
                    setOrders([])
                }
            })
            .catch((err) => {
                console.error('getOrdersApi error', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng')
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && <div>Đang tải...</div>}
                            {error && <div className="text-destructive">{error}</div>}
                            {!loading && !error && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Tổng tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((o) => (
                                            <TableRow key={o.id}>
                                                <TableCell className="truncate max-w-[200px]">
                                                    <Link to={`/repair-shop/orders/${o.id}`} className="text-primary underline">{o.id}</Link>
                                                </TableCell>
                                                <TableCell>{o.totalAmount?.toLocaleString()} đ</TableCell>
                                                <TableCell>{o.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
