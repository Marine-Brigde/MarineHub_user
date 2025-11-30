"use client"

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Calendar, Ship, MapPin, Clock, Eye } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { getBookingsApi } from '@/api/booking/bookingApi'
import type { Booking } from '@/types/Booking/booking'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
    approved: { bg: "bg-blue-100", text: "text-blue-700" },
    completed: { bg: "bg-green-100", text: "text-green-700" },
    cancelled: { bg: "bg-red-100", text: "text-red-700" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
    rejected: "Bị từ chối",
}

export default function RepairShopBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    const loadBookings = async (page: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getBookingsApi({ page, size: pageSize, sortBy: 'startTime', isAsc: false })
            const data = (res as any)?.data ?? res
            const items = data?.items ?? []
            const totalItems = data?.total ?? items.length
            const totalPagesCount = data?.totalPages ?? Math.ceil(totalItems / pageSize)
            
            setBookings(items)
            setTotal(totalItems)
            setTotalPages(totalPagesCount)
            setCurrentPage(page)
        } catch (err: any) {
            console.error('getBookingsApi', err)
            setError(err?.response?.data?.message || 'Lỗi khi tải lịch đặt')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadBookings(1)
    }, [])

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">-</Badge>
        const colors = STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.pending
        const label = STATUS_LABELS[status?.toLowerCase()] || status

        return <Badge className={`${colors.bg} ${colors.text} font-semibold text-xs px-2 py-1`}>{label}</Badge>
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
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
                                <BreadcrumbPage>Lịch hẹn</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-4 mt-2">
                        <SidebarTrigger />
                        <h1 className="text-3xl font-bold text-foreground">Quản lý lịch hẹn</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Theo dõi và quản lý các lịch hẹn sửa chữa tàu</p>
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

            {/* Bookings Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Danh sách lịch hẹn
                        </CardTitle>
                        {total > 0 && (
                            <Badge variant="outline" className="text-sm">
                                Tổng: {total} lịch hẹn
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải lịch hẹn...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-destructive font-medium mb-2">{error}</p>
                            <Button onClick={() => loadBookings(1)} variant="outline" size="sm">
                                Thử lại
                            </Button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Chưa có lịch hẹn nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Mã lịch hẹn</TableHead>
                                            <TableHead>Tên tàu</TableHead>
                                            <TableHead>Chủ tàu</TableHead>
                                            <TableHead>Vị trí</TableHead>
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead className="text-center">Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => (
                                            <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate max-w-[100px]">#{booking.id.slice(0, 8)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Ship className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{booking.shipName || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-0.5">
                                                        <div className="text-sm font-medium">{booking.shipOwnerName || '-'}</div>
                                                        {booking.shipOwnerPhoneNumber && (
                                                            <div className="text-xs text-muted-foreground">{booking.shipOwnerPhoneNumber}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{booking.dockSlotName || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-medium">{formatDate(booking.startTime)}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {booking.startTime && booking.endTime
                                                                ? `${formatDateTime(booking.startTime).split(',')[1]} - ${formatDateTime(booking.endTime).split(',')[1]}`
                                                                : formatDateTime(booking.startTime)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(booking.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link to={`/repair-shop/bookings/${booking.id}`}>
                                                        <Button variant="ghost" size="sm" className="gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            Xem chi tiết
                                                        </Button>
                                                    </Link>
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
                                                        if (currentPage > 1) loadBookings(currentPage - 1)
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
                                                                    loadBookings(page)
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
                                                        if (currentPage < totalPages) loadBookings(currentPage + 1)
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
        </div>
    )
}
