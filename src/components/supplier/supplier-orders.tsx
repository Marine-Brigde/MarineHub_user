"use client"

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOrdersApi } from '@/api/Order/orderApi'
import type { OrderResponseData } from '@/types/Order/order'
import { Link } from 'react-router-dom'

export default function SupplierOrders() {
    const [orders, setOrders] = useState<OrderResponseData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        // The backend should scope orders by authenticated supplier token
        getOrdersApi({ page: 1, pageSize: 20 })
            .then((res) => {
                const items = (res as any)?.data?.items ?? []
                setOrders(items)
            })
            .catch((err) => {
                console.error('getOrdersApi', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải đơn hàng')
            })
            .finally(() => setLoading(false))
    }, [])

    return (
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
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((o) => (
                                <TableRow key={o.id}>
                                    <TableCell className="truncate max-w-[200px]">{o.id}</TableCell>
                                    <TableCell>{o.totalAmount?.toLocaleString()} đ</TableCell>
                                    <TableCell>{o.status}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/supplier/orders/${o.id}`} className="text-primary underline">
                                                Xem
                                            </Link>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`mailto:orders@yourcompany.example?subject=Order%20${o.id}`}>Liên hệ</a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
