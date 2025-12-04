"use client"

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Calendar,
    Ship,
    User,
    Phone,
    MapPin,
    Clock,
    Wrench,
    DollarSign,
    ArrowLeft,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getBookingByIdApi } from '@/api/booking/bookingApi'
import { getBoatyardDetailApi } from '@/api/boatyardApi/boatyardApi'
import RouteMap from '@/components/map/RouteMap'
import type { BookingDetailResponse } from '@/types/Booking/booking'

// Backend booking status enum: Pending | Confirmed | Cancelled
const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: AlertCircle },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ duyệt",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
}

export default function RepairShopBookingDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [booking, setBooking] = useState<BookingDetailResponse | null>(null)
    const [showRoute, setShowRoute] = useState(false)
    const [boatyardLocation, setBoatyardLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [loadingRoute, setLoadingRoute] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setError(null)
        getBookingByIdApi(id)
            .then((res) => {
                if (res && res.data) setBooking(res.data)
                else setError('Không tìm thấy lịch hẹn')
            })
            .catch((err) => {
                console.error('getBookingByIdApi', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải lịch hẹn')
            })
            .finally(() => setLoading(false))
    }, [id])

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

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">-</Badge>
        const statusLower = status.toLowerCase()
        const colors = STATUS_COLORS[statusLower] || STATUS_COLORS.pending
        const label = STATUS_LABELS[statusLower] || status
        const Icon = colors.icon

        return (
            <Badge className={`${colors.bg} ${colors.text} font-semibold text-sm px-3 py-1.5 flex items-center gap-2 w-fit`}>
                <Icon className="h-4 w-4" />
                {label}
            </Badge>
        )
    }

    const handleShowRoute = async () => {
        if (!booking) return
        setShowRoute((s) => !s)
        if (boatyardLocation || !showRoute) {
            // If already have location or we're opening, fetch boatyard detail
            try {
                setLoadingRoute(true)
                const res = await getBoatyardDetailApi()
                if (res?.status === 200 && res.data) {
                    const lat = Number(res.data.latitude)
                    const lng = Number(res.data.longitude)
                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                        setBoatyardLocation({ lat, lng })
                    }
                }
            } catch (err) {
                console.warn('Failed to load boatyard detail', err)
            } finally {
                setLoadingRoute(false)
            }
        }
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
                                <BreadcrumbLink href="/repair-shop/bookings">Lịch hẹn</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Chi tiết lịch hẹn</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-4 mt-2">
                        <SidebarTrigger />
                        <h1 className="text-3xl font-bold text-foreground">Chi tiết lịch hẹn</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Thông tin chi tiết về lịch hẹn sửa chữa</p>
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

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Đang tải thông tin lịch hẹn...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Booking Details */}
            {!loading && !error && booking && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column - Main Info */}
                    <div className="space-y-6">
                        {/* Booking Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Thông tin lịch hẹn
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Mã lịch hẹn</span>
                                    <span className="text-sm font-mono font-semibold">#{booking.id}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Trạng thái</span>
                                    {getStatusBadge(booking.status)}
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">Thời gian bắt đầu</span>
                                    </div>
                                    <p className="text-sm font-semibold pl-6">{formatDateTime(booking.startTime)}</p>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">Thời gian kết thúc</span>
                                    </div>
                                    <p className="text-sm font-semibold pl-6">{formatDateTime(booking.endTime)}</p>
                                </div>
                                {booking.totalAmount && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Tổng tiền
                                            </span>
                                            <span className="text-lg font-bold text-primary">
                                                {booking.totalAmount.toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ship Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ship className="h-5 w-5 text-primary" />
                                    Thông tin tàu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Ship className="h-4 w-4" />
                                        <span className="font-medium">Tên tàu</span>
                                    </div>
                                    <p className="text-sm font-semibold pl-6">{booking.shipName || '-'}</p>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">Chủ tàu</span>
                                    </div>
                                    <p className="text-sm font-semibold pl-6">{booking.shipOwnerName || '-'}</p>
                                </div>
                                {booking.shipOwnerPhoneNumber && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span className="font-medium">Số điện thoại</span>
                                            </div>
                                            <a
                                                href={`tel:${booking.shipOwnerPhoneNumber}`}
                                                className="text-sm font-semibold pl-6 text-primary hover:underline"
                                            >
                                                {booking.shipOwnerPhoneNumber}
                                            </a>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Dock & Services */}
                    <div className="space-y-6">
                        {/* Dock Slot Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Vị trí bến đậu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="font-medium">Tên bến đậu</span>
                                    </div>
                                    <p className="text-sm font-semibold pl-6">{booking.dockSlotName || '-'}</p>
                                </div>
                                {/* Track route button + map (visible when confirmed) */}
                                {booking.status && booking.status.toLowerCase() === 'confirmed' && (
                                    <div className="mt-4 pl-6">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={handleShowRoute} className="gap-2">
                                                {showRoute ? 'Ẩn hành trình' : 'Theo dõi hành trình'}
                                            </Button>
                                            {loadingRoute && <span className="text-sm text-muted-foreground">Đang tải vị trí xưởng...</span>}
                                        </div>
                                        {showRoute && (
                                            <div className="mt-3">
                                                <RouteMap
                                                    start={booking.latitude && booking.longitude ? { lat: Number(booking.latitude), lng: Number(booking.longitude) } : null}
                                                    end={boatyardLocation}
                                                    animate={true}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-primary" />
                                    Dịch vụ đã đặt
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {booking.services && booking.services.length > 0 ? (
                                    <div className="space-y-3">
                                        {booking.services.map((service, index) => (
                                            <div key={service.id || index}>
                                                <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <Wrench className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold">{service.typeService || 'Dịch vụ'}</p>
                                                        </div>
                                                    </div>
                                                    {service.price !== undefined && (
                                                        <div className="text-sm font-bold text-primary ml-4">
                                                            {service.price.toLocaleString('vi-VN')} đ
                                                        </div>
                                                    )}
                                                </div>
                                                {index < booking.services!.length - 1 && <Separator className="my-3" />}
                                            </div>
                                        ))}
                                        {booking.totalAmount && booking.services.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-sm font-semibold">Tổng cộng</span>
                                                    <span className="text-lg font-bold text-primary">
                                                        {booking.totalAmount.toLocaleString('vi-VN')} đ
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào được đặt</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div className="flex justify-start">
                <Button variant="outline" onClick={() => navigate('/repair-shop/bookings')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </div>
        </div>
    )
}
