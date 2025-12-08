"use client"

import { useEffect, useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { Phone, User, Ship, Loader2, Filter } from 'lucide-react'

import { getOrdersApi, getOrderByIdApi } from '@/api/Order/orderApi'
import type { OrderResponseData, OrderDetailResponseData, OrderStatus } from '@/types/Order/order'
import { useToast } from '@/hooks/use-toast'

// Chỉ sử dụng các status đã định nghĩa trong OrderStatus type
const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']

export default function SupplierOrders() {
    const { toast } = useToast()
    const [allOrders, setAllOrders] = useState<OrderResponseData[]>([]) // All orders from API
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // Filter state
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // detail dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponseData | null>(null)
    const [newStatus, setNewStatus] = useState<string | null>(null)

    // contact dialog state
    const [contactDialogOpen, setContactDialogOpen] = useState(false)
    const [contactOrder, setContactOrder] = useState<OrderResponseData | null>(null)
    const [contactLoading, setContactLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setError(null)
        // Fetch all orders - we'll do pagination and filtering on client-side
        getOrdersApi({ page: 1, pageSize: 100 })
            .then((res) => {
                const items = (res as any)?.data?.items ?? []
                setAllOrders(items)
            })
            .catch((err) => {
                console.error('getOrdersApi', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải đơn hàng')
            })
            .finally(() => setLoading(false))
    }, [])

    // Filter orders by status
    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') {
            return allOrders
        }
        return allOrders.filter((order) => {
            const orderStatus = (order.status || '').toLowerCase()
            return orderStatus === statusFilter.toLowerCase()
        })
    }, [allOrders, statusFilter])

    // Paginate filtered orders
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredOrders.slice(startIndex, endIndex)
    }, [filteredOrders, currentPage, pageSize])

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredOrders.length / pageSize)
    }, [filteredOrders.length, pageSize])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter])

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

    const openContact = async (order: OrderResponseData) => {
        setContactOrder(order)
        setContactDialogOpen(true)

        // If order doesn't have contact info, fetch it from API
        if (!order.phone && !order.shipName && !order.boatyardName) {
            setContactLoading(true)
            try {
                const res = await getOrderByIdApi(order.id)
                if (res && res.data) {
                    const detail = res.data as OrderDetailResponseData
                    setContactOrder({
                        ...order,
                        phone: (detail as any).phone || order.phone,
                        shipName: (detail as any).shipName || order.shipName,
                        boatyardName: (detail as any).boatyardName || order.boatyardName,
                    })
                }
            } catch (err) {
                console.error('Error fetching contact info', err)
            } finally {
                setContactLoading(false)
            }
        }
    }

    const closeContact = () => {
        setContactDialogOpen(false)
        setContactOrder(null)
        setContactLoading(false)
    }

    // Chỉ map các status có trong OrderStatus type
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
        return <Badge className={`${st.bg} ${st.text} font-semibold text-xs px-2 py-1`}>{st.label}</Badge>
    }

    // Chỉ cho phép chuyển đổi giữa các status có trong OrderStatus type
    const allowedStatusesFor = (current?: string): OrderStatus[] => {
        const c = (current || '').toLowerCase()
        if (c === 'pending') return ['Pending', 'Approved', 'Delivered', 'Completed', 'Rejected']
        if (c === 'approved') return ['Approved', 'Delivered', 'Completed']
        if (c === 'delivered') return ['Delivered', 'Completed']
        if (c === 'completed') return ['Completed']
        if (c === 'rejected') return ['Rejected']
        // Default: return all statuses
        return ORDER_STATUSES
    }

    const updateStatus = async () => {
        if (!selectedOrder || !newStatus) return
        try {
            setDetailLoading(true)
            await (await import('@/api/Order/orderApi')).updateOrderApi(selectedOrder.id, { status: newStatus as any })
            // Refresh orders list
            const res = await getOrdersApi({ page: 1, pageSize: 100 })
            setAllOrders((res as any)?.data?.items ?? [])
            // Refresh detail
            const detailRes = await (await import('@/api/Order/orderApi')).getOrderByIdApi(selectedOrder.id)
            if (detailRes && detailRes.data) setSelectedOrder(detailRes.data as OrderDetailResponseData)
            toast({
                title: "Thành công",
                description: "Trạng thái đơn hàng đã được cập nhật",
                variant: "success",
            })
        } catch (err) {
            console.error('updateOrderApi', err)
            const errorMsg = 'Không thể cập nhật trạng thái'
            setDetailError(errorMsg)
            toast({
                title: "Lỗi",
                description: errorMsg,
                variant: "destructive",
            })
        } finally {
            setDetailLoading(false)
        }
    }

    // Get last 6 characters of ID
    const getShortId = (id: string) => {
        return id.length > 6 ? id.slice(-6) : id
    }

    // Generate page numbers for pagination
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Đơn hàng</h1>
                <p className="text-muted-foreground">Quản lý và theo dõi các đơn hàng của bạn</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Danh sách đơn hàng</CardTitle>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    {ORDER_STATUSES.map((status) => {
                                        const statusKey = status.toLowerCase()
                                        return (
                                            <SelectItem key={status} value={statusKey}>
                                                {statusMap[statusKey]?.label || status}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải đơn hàng...</p>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}

                    {!loading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-base font-semibold">Mã đơn hàng</TableHead>
                                            <TableHead className="text-base font-semibold">Tổng tiền</TableHead>
                                            <TableHead className="text-base font-semibold">Trạng thái</TableHead>
                                            <TableHead className="text-right text-base font-semibold">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                    {statusFilter === 'all'
                                                        ? 'Không có đơn hàng nào'
                                                        : `Không có đơn hàng nào với trạng thái "${statusMap[statusFilter]?.label || statusFilter}"`}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedOrders.map((o) => (
                                                <TableRow key={o.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium py-4">
                                                        <button
                                                            className="text-primary hover:underline text-left font-mono text-sm"
                                                            onClick={() => openDetail(o.id)}
                                                        >
                                                            #{getShortId(o.id)}
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm font-medium">{o.totalAmount?.toLocaleString('vi-VN')} đ</TableCell>
                                                    <TableCell className="py-4">{renderStatus(o.status)}</TableCell>
                                                    <TableCell className="text-right py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="default"
                                                                variant="outline"
                                                                onClick={() => openContact(o)}
                                                            >
                                                                Liên hệ
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, filteredOrders.length)}</span> của <span className="font-semibold text-foreground">{filteredOrders.length}</span> đơn hàng
                                    </div>
                                    <Pagination>
                                        <PaginationContent className="gap-0">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                                                    }}
                                                    className={`h-10 px-4 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
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
                                                                    setCurrentPage(page)
                                                                }
                                                            }}
                                                            className={`h-10 px-4 ${page === currentPage ? "bg-primary text-primary-foreground" : ""}`}
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
                                                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                                    }}
                                                    className={`h-10 px-4 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}

                    {/* detail dialog */}
                    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDetail(); setDialogOpen(open) }}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                            </DialogHeader>
                            <div className="p-4">
                                {detailLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : detailError ? (
                                    <div className="text-destructive">{detailError}</div>
                                ) : selectedOrder ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Mã đơn hàng</div>
                                            <div className="text-lg font-semibold font-mono">#{getShortId(selectedOrder.id)}</div>
                                        </div>

                                        <Separator />

                                        {/* Tên đơn hàng / Tên khách hàng */}
                                        {(selectedOrder.shipName || selectedOrder.boatyardName) && (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Tên đơn hàng</div>
                                                    <div className="text-base font-semibold">
                                                        {selectedOrder.shipName || selectedOrder.boatyardName || '-'}
                                                    </div>
                                                </div>
                                                <Separator />
                                            </>
                                        )}

                                        {selectedOrder.orderCode && (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Mã code</div>
                                                    <div className="text-base font-medium">{selectedOrder.orderCode}</div>
                                                </div>
                                                <Separator />
                                            </>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">Trạng thái</div>
                                                <div>{renderStatus(selectedOrder.status)}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={newStatus || ''}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm flex-1"
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

                                        <Separator />

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">Tổng tiền</div>
                                            <div className="text-xl font-bold text-primary">{selectedOrder.totalAmount?.toLocaleString('vi-VN') || 0} đ</div>
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

                    {/* Contact dialog */}
                    <Dialog open={contactDialogOpen} onOpenChange={(open) => { if (!open) closeContact(); setContactDialogOpen(open) }}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Thông tin liên hệ</DialogTitle>
                                <DialogDescription>
                                    Thông tin khách hàng đặt đơn hàng #{contactOrder ? getShortId(contactOrder.id) : ''}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {contactLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : contactOrder ? (
                                    <>
                                        {/* Customer Name */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {contactOrder.shipName ? (
                                                    <Ship className="h-4 w-4" />
                                                ) : contactOrder.boatyardName ? (
                                                    <User className="h-4 w-4" />
                                                ) : (
                                                    <User className="h-4 w-4" />
                                                )}
                                                <span>Tên người đặt</span>
                                            </div>
                                            <p className="text-base font-semibold pl-6">
                                                {contactOrder.shipName || contactOrder.boatyardName || 'Chưa có thông tin'}
                                            </p>
                                        </div>

                                        <Separator />

                                        {/* Phone Number */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>Số điện thoại</span>
                                            </div>
                                            {contactOrder.phone ? (
                                                <a
                                                    href={`tel:${contactOrder.phone}`}
                                                    className="text-base font-semibold pl-6 text-primary hover:underline flex items-center gap-2"
                                                >
                                                    {contactOrder.phone}
                                                </a>
                                            ) : (
                                                <p className="text-base text-muted-foreground pl-6">Chưa có thông tin</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">Không có thông tin</p>
                                )}
                            </div>
                            <DialogFooter>
                                {contactOrder?.phone && (
                                    <Button
                                        asChild
                                        className="flex-1"
                                    >
                                        <a href={`tel:${contactOrder.phone}`}>
                                            <Phone className="h-4 w-4 mr-2" />
                                            Gọi ngay
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={closeContact}>
                                    Đóng
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
