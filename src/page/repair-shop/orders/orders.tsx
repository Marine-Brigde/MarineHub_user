"use client"

import { useEffect, useState } from "react"
import {
    Loader2,
    ShoppingCart,
    DollarSign,
    Package,
    Eye,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Search,
    Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getOrderByIdApi } from "@/api/Order/orderApi"
import type { OrderDetailResponseData } from "@/types/Order/order"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrdersApi } from "@/api/Order/orderApi"
import type { OrderResponseData } from "@/types/Order/order"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    approved: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2 },
    delivered: { bg: "bg-purple-100", text: "text-purple-700", icon: Package },
    completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
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
    const [total, setTotal] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
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
            await (await import('@/api/Order/orderApi')).updateOrderApi(selectedOrder.id, { status: newStatus as any })
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
                setTotal(res.data.total || res.data.items.length)
                setTotalPages(Math.ceil((res.data.total || res.data.items.length) / pageSize))
                setCurrentPage(page)
                
                // Calculate total amount
                const total = res.data.items.reduce((sum: number, order: OrderResponseData) => sum + (order.totalAmount || 0), 0)
                setTotalAmount(total)
            } else {
                setOrders([])
                setTotal(0)
                setTotalAmount(0)
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
        const statusLower = status?.toLowerCase() || ''
        const colors = STATUS_COLORS[statusLower] || STATUS_COLORS.pending
        const label = STATUS_LABELS[statusLower] || status
        const Icon = colors.icon

        return (
            <Badge className={`${colors.bg} ${colors.text} font-semibold text-xs px-2 py-1 flex items-center gap-1.5 w-fit`}>
                <Icon className="h-3 w-3" />
                {label}
            </Badge>
        )
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

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return '-'
        }
    }

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesSearch = !searchTerm || order.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    // Calculate stats
    const stats = {
        total: total,
        totalAmount: totalAmount,
        pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
        completed: orders.filter(o => o.status?.toLowerCase() === 'completed').length,
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/repair-shop/dashboard">Tổng quan</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Đơn hàng</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-4 mt-2">
                        <SidebarTrigger />
                        <h1 className="text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Theo dõi và quản lý các đơn hàng từ khách hàng</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả đơn hàng
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {stats.totalAmount.toLocaleString('vi-VN')} đ
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tổng giá trị đơn hàng
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Đơn hàng đang chờ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoàn tất</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            Đơn hàng đã hoàn thành
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Danh sách đơn hàng
                        </CardTitle>
                        <Badge variant="outline" className="text-sm">
                            {filteredOrders.length} đơn hàng
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                                    <SelectItem value="approved">Đã duyệt</SelectItem>
                                    <SelectItem value="delivered">Đã giao</SelectItem>
                                    <SelectItem value="completed">Hoàn tất</SelectItem>
                                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải đơn hàng...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-destructive font-medium mb-2">{error}</p>
                            <Button onClick={() => loadOrders(1)} variant="outline" size="sm">
                                Thử lại
                            </Button>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm || statusFilter !== 'all' 
                                    ? "Không tìm thấy đơn hàng phù hợp" 
                                    : "Chưa có đơn hàng nào"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Mã đơn hàng</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="text-right">Tổng tiền</TableHead>
                                            <TableHead className="text-center">Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-mono">#{order.id.slice(0, 8)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>-</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <DollarSign className="h-4 w-4 text-primary" />
                                                        <span className="font-semibold text-primary">
                                                            {order.totalAmount?.toLocaleString('vi-VN')} đ
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDetail(order.id)}
                                                        className="gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Xem chi tiết
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-1 py-4 px-4 border-t bg-muted/30">
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
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Order detail dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDetail(); setDialogOpen(open) }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Chi tiết đơn hàng
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết và quản lý trạng thái đơn hàng
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {detailLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
                                </div>
                            </div>
                        ) : detailError ? (
                            <Card className="border-destructive">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-destructive">{detailError}</p>
                                </CardContent>
                            </Card>
                        ) : selectedOrder ? (
                            <div className="space-y-6">
                                {/* Order Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" />
                                            Thông tin đơn hàng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Mã đơn hàng</Label>
                                                <p className="text-sm font-mono font-semibold mt-1">#{selectedOrder.id}</p>
                                            </div>
                                            {selectedOrder.orderCode && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Mã code</Label>
                                                    <p className="text-sm font-semibold mt-1">{selectedOrder.orderCode}</p>
                                                </div>
                                            )}
                                            {selectedOrder.createdDate && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Ngày tạo</Label>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <p className="text-sm">{formatDateTime(selectedOrder.createdDate)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                                                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-primary" />
                                                Tổng tiền
                                            </Label>
                                            <p className="text-2xl font-bold text-primary">
                                                {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Status Update */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Cập nhật trạng thái
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Label>Chọn trạng thái mới</Label>
                                            <Select
                                                defaultValue={selectedOrder.status}
                                                onValueChange={updateOrderStatus}
                                                disabled={detailLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allowedStatusesFor(selectedOrder.status).map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {STATUS_LABELS[s.toLowerCase()] || s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Trạng thái sẽ được cập nhật ngay sau khi chọn
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Sản phẩm trong đơn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">
                                                                {item.productVariantName || item.productOptionName || 'Sản phẩm'}
                                                            </p>
                                                            {item.productVariantId && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    ID: {item.productVariantId}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="text-sm font-semibold">
                                                                {item.quantity || 0} x {item.price ? `${item.price.toLocaleString('vi-VN')} đ` : '-'}
                                                            </p>
                                                            {item.price && item.quantity && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    = {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">Không có sản phẩm chi tiết</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDetail}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
