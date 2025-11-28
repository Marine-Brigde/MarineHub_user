"use client"

import { useEffect, useState } from "react"
// link navigation removed; details open in-dialog
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getOrderByIdApi } from "@/api/Order/orderApi"
import type { OrderDetailResponseData } from "@/types/Order/order"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrdersApi } from "@/api/Order/orderApi"
import type { OrderResponseData } from "@/types/Order/order"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
    approved: { bg: "bg-blue-100", text: "text-blue-700" },
    delivered: { bg: "bg-purple-100", text: "text-purple-700" },
    completed: { bg: "bg-green-100", text: "text-green-700" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ xử lý",
    approved: "Đã duyệt",
    delivered: "Đã giao",
    completed: "Hoàn tất",
    rejected: "Bị từ chối",
}

export default function RepairShopOrders() {
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState<OrderResponseData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 10

    // Dialog / detail state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponseData | null>(null)
    const [, setSelectedOrderId] = useState<string | null>(null)

    const handleOpenDetail = async (id: string) => {
        setSelectedOrderId(id)
        setDialogOpen(true)
        setDetailLoading(true)
        setDetailError(null)
        setSelectedOrder(null)
        try {
            const res = await getOrderByIdApi(id)
            if (res && res.data) setSelectedOrder(res.data as OrderDetailResponseData)
            else setDetailError('Không tìm thấy đơn hàng')
        } catch (err: any) {
            console.error('getOrderByIdApi error', err)
            setDetailError(err?.response?.data?.message || 'Lỗi khi tải đơn hàng')
        } finally {
            setDetailLoading(false)
        }
    }

    // status update helpers (same rules)
    const allowedStatusesFor = (current?: string) => {
        const c = (current || '').toLowerCase()
        if (c === 'pending') return ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']
        if (c === 'approved') return ['Approved', 'Delivered', 'Completed']
        if (c === 'delivered') return ['Delivered', 'Completed']
        if (c === 'completed') return ['Completed']
        if (c === 'rejected') return ['Rejected']
        return ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']
    }

    const updateOrderStatus = async (newStatus: string) => {
        if (!selectedOrder) return
        setDetailLoading(true)
        try {
            await (await import('@/api/Order/orderApi')).updateOrderApi(selectedOrder.id, { status: newStatus })
            // refresh order list and selected order
            loadOrders(currentPage)
            const res = await (await import('@/api/Order/orderApi')).getOrderByIdApi(selectedOrder.id)
            if (res && res.data) setSelectedOrder(res.data as OrderDetailResponseData)
        } catch (err) {
            console.error('updateOrderApi', err)
            setDetailError('Không thể cập nhật trạng thái')
        } finally {
            setDetailLoading(false)
        }
    }

    const handleCloseDetail = () => {
        setDialogOpen(false)
        setSelectedOrder(null)
        setSelectedOrderId(null)
        setDetailError(null)
        setDetailLoading(false)
    }

    const loadOrders = async (page: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getOrdersApi({ page, pageSize })
            if (res?.data?.items) {
                setOrders(res.data.items)
                setTotalPages(Math.ceil((res.data.total || res.data.items.length) / pageSize))
                setCurrentPage(page)
            } else {
                setOrders([])
            }
        } catch (err: any) {
            console.error("getOrdersApi error", err)
            setError(err?.response?.data?.message || "Lỗi khi tải danh sách đơn hàng")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders(1)
    }, [])

    const getStatusBadge = (status: string) => {
        const colors = STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.pending
        const label = STATUS_LABELS[status?.toLowerCase()] || status

        return <Badge className={`${colors.bg} ${colors.text} font-semibold text-xs px-2 py-1`}>{label}</Badge>
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="min-h-screen bg-background px-4">
            <div className="container mx-auto py-4 px-4">

                <div className="mb-4 flex items-center gap-2">

                    <SidebarTrigger className="h-5 w-5" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>

                                <BreadcrumbLink href="/repair-shop" className="text-xs">
                                    Xưởng sửa chữa
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-xs">Đơn hàng</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <h1 className="text-3xl font-semibold py-4">Quản lý đơn hàng</h1>

                <Card className="border shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <p className="text-xs text-muted-foreground">Đang tải...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-destructive font-medium mb-2">{error}</p>
                                <button onClick={() => loadOrders(1)} className="text-xs text-primary hover:underline font-medium">
                                    Thử lại
                                </button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-xs text-muted-foreground">Không có đơn hàng nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="text-left px-4 py-2 font-semibold text-xs">Mã đơn</th>
                                                <th className="text-right px-4 py-2 font-semibold text-xs">Tổng tiền</th>
                                                <th className="text-center px-4 py-2 font-semibold text-xs">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => handleOpenDetail(order.id)}
                                                            className="text-primary hover:underline font-medium text-xs"
                                                        >
                                                            #{order.id}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-semibold text-xs">
                                                        {order.totalAmount?.toLocaleString("vi-VN")} đ
                                                    </td>
                                                    <td className="px-4 py-2 text-center">{getStatusBadge(order.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-1 py-3 px-4 border-t bg-muted/30">
                                        <Pagination>
                                            <PaginationContent className="gap-0">
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            if (currentPage > 1) loadOrders(currentPage - 1)
                                                        }}
                                                        className={`text-xs h-8 px-2 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                                    />
                                                </PaginationItem>

                                                {getPageNumbers().map((page, idx) => (
                                                    <PaginationItem key={idx}>
                                                        {page === "..." ? (
                                                            <PaginationEllipsis />
                                                        ) : (
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={page === currentPage}
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    if (typeof page === "number") {
                                                                        loadOrders(page)
                                                                    }
                                                                }}
                                                                className={`text-xs h-8 px-2 ${page === currentPage ? "bg-primary text-primary-foreground" : ""}`}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        )}
                                                    </PaginationItem>
                                                ))}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            if (currentPage < totalPages) loadOrders(currentPage + 1)
                                                        }}
                                                        className={`text-xs h-8 px-2 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}

                                <div className="px-4 py-1.5 bg-muted/20 text-center text-xs text-muted-foreground border-t">
                                    Trang {currentPage}/{totalPages}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
                {/* Order detail dialog */}
                <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDetail(); setDialogOpen(open) }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        </DialogHeader>

                        <div className="p-4">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : detailError ? (
                                <div className="text-destructive text-sm">{detailError}</div>
                            ) : selectedOrder ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã đơn hàng</div>
                                        <div className="truncate">{selectedOrder.id}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã (code)</div>
                                        <div>{selectedOrder.orderCode || '-'}</div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">Trạng thái</div>
                                            <div>{getStatusBadge(selectedOrder.status)}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                defaultValue={selectedOrder.status}
                                                onChange={(e) => updateOrderStatus(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm"
                                            >
                                                {allowedStatusesFor(selectedOrder.status).map((s) => (
                                                    <option key={s} value={s}>{STATUS_LABELS[s.toLowerCase()] || s}</option>
                                                ))}
                                            </select>
                                            <div className="text-sm text-muted-foreground">Chọn trạng thái để cập nhật</div>
                                        </div>

                                        <div className="flex justify-between">
                                            <div className="font-medium">Tổng tiền</div>
                                            <div>{selectedOrder.totalAmount?.toLocaleString() || 0} đ</div>
                                        </div>

                                        <div>
                                            <div className="font-medium mb-2">Sản phẩm</div>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedOrder.items.map((it, idx) => (
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
                                    </div>




                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                            )}
                        </div>

                        <DialogFooter>
                            <div className="w-full flex justify-end">
                                <Button variant="outline" onClick={handleCloseDetail}>Đóng</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
