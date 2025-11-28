"use client"

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

import { getOrdersApi, getOrderByIdApi } from '@/api/Order/orderApi'
import type { OrderResponseData, OrderDetailResponseData } from '@/types/Order/order'


export default function SupplierOrders() {
    const [orders, setOrders] = useState<OrderResponseData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // detail dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponseData | null>(null)
    const [newStatus, setNewStatus] = useState<string | null>(null)

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

    const openDetail = async (id: string) => {
        setDialogOpen(true)
        setDetailLoading(true)
        setDetailError(null)
        setSelectedOrder(null)
        try {
            const res = await getOrderByIdApi(id)
            if (res && res.data) {
                setSelectedOrder(res.data as OrderDetailResponseData)
                setNewStatus((res.data as any).status || null)
            }
            else setDetailError('Không tìm thấy đơn hàng')
        } catch (err: any) {
            console.error('getOrderByIdApi', err)
            setDetailError(err?.response?.data?.message || 'Lỗi khi tải đơn hàng')
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setDialogOpen(false)
        setSelectedOrder(null)
        setDetailError(null)
        setDetailLoading(false)
    }

    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
        pending: { label: 'Chờ xử lý', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        approved: { label: 'Đã duyệt', bg: 'bg-blue-100', text: 'text-blue-700' },
        delivered: { label: 'Đã giao', bg: 'bg-purple-100', text: 'text-purple-700' },
        completed: { label: 'Hoàn tất', bg: 'bg-green-100', text: 'text-green-700' },
        rejected: { label: 'Bị từ chối', bg: 'bg-red-100', text: 'text-red-700' },
    }

    const renderStatus = (s?: string) => {
        const key = (s || '').toLowerCase()
        const st = statusMap[key] || { label: s || '-', bg: 'bg-muted/20', text: 'text-muted-foreground' }
        return <span className={`${st.bg} ${st.text} px-2 py-1 rounded-full text-xs font-medium`}>{st.label}</span>
    }

    const allowedStatusesFor = (current?: string) => {
        const c = (current || '').toLowerCase()
        if (c === 'pending') return ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']
        if (c === 'approved') return ['Approved', 'Delivered', 'Completed']
        if (c === 'delivered') return ['Delivered', 'Completed']
        if (c === 'completed') return ['Completed']
        if (c === 'rejected') return ['Rejected']
        return ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']
    }

    const updateStatus = async () => {
        if (!selectedOrder || !newStatus) return
        try {
            setDetailLoading(true)
            await (await import('@/api/Order/orderApi')).updateOrderApi(selectedOrder.id, { status: newStatus })
            // refresh list and detail
            const res = await getOrdersApi({ page: 1, pageSize: 20 })
            setOrders((res as any)?.data?.items ?? [])
            const detailRes = await (await import('@/api/Order/orderApi')).getOrderByIdApi(selectedOrder.id)
            if (detailRes && detailRes.data) setSelectedOrder(detailRes.data as OrderDetailResponseData)
        } catch (err) {
            console.error('updateOrderApi', err)
            setDetailError('Không thể cập nhật trạng thái')
        } finally {
            setDetailLoading(false)
        }
    }

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
                                    <TableCell className="truncate max-w-[200px]">
                                        <button className="text-primary underline text-left" onClick={() => openDetail(o.id)}>
                                            {o.id}
                                        </button>
                                    </TableCell>
                                    <TableCell>{o.totalAmount?.toLocaleString()} đ</TableCell>
                                    <TableCell>{renderStatus(o.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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

                {/* detail dialog */}
                <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDetail(); setDialogOpen(open) }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                            {detailLoading ? (
                                <div>Đang tải...</div>
                            ) : detailError ? (
                                <div className="text-destructive">{detailError}</div>
                            ) : selectedOrder ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã</div>
                                        <div className="truncate">{selectedOrder.id}</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">Trạng thái</div>
                                            <div>{renderStatus(selectedOrder.status)}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={newStatus || ''}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm"
                                            >
                                                {allowedStatusesFor(selectedOrder.status).map((s) => (
                                                    <option key={s} value={s}>{statusMap[s.toLowerCase()]?.label || s}</option>
                                                ))}
                                            </select>
                                            <Button size="sm" onClick={updateStatus} disabled={detailLoading || !newStatus}>
                                                Cập nhật
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Tổng tiền</div>
                                        <div>{selectedOrder.totalAmount?.toLocaleString() || 0} đ</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Sản phẩm</div>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {selectedOrder.items.map((it, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{it.productVariantName || it.productVariantId || it.productOptionName || 'Sản phẩm'}</span>
                                                        <span className="text-sm">{(it.quantity || 0)} x {it.price ? `${it.price.toLocaleString()} đ` : '-'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">Không có sản phẩm.</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>Không có dữ liệu</div>
                            )}
                        </div>
                        <DialogFooter>
                            <div className="w-full flex justify-end">
                                <Button variant="outline" onClick={closeDetail}>Đóng</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
