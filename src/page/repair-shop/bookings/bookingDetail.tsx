"use client"

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getBookingByIdApi } from '@/api/booking/bookingApi'
import type { BookingDetailResponse } from '@/types/Booking/booking'

export default function RepairShopBookingDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [booking, setBooking] = useState<BookingDetailResponse | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setError(null)
        getBookingByIdApi(id)
            .then((res) => {
                if (res && res.data) setBooking(res.data)
                else setError('Không tìm thấy booking')
            })
            .catch((err) => {
                console.error('getBookingByIdApi', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải booking')
            })
            .finally(() => setLoading(false))
    }, [id])

    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết lịch đặt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && <div>Đang tải...</div>}
                            {error && <div className="text-destructive">{error}</div>}

                            {booking && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="font-medium">Mã</div>
                                        <div className="truncate">{booking.id}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Tàu</div>
                                        <div>{booking.shipName || '-'}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Chủ tàu</div>
                                        <div>{booking.shipOwnerName || '-'} ({booking.shipOwnerPhoneNumber || '-'})</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Vị trí</div>
                                        <div>{booking.dockSlotName || '-'}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="font-medium">Thời gian</div>
                                        <div>{booking.startTime ? new Date(booking.startTime).toLocaleString() : '-'} - {booking.endTime ? new Date(booking.endTime).toLocaleString() : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Dịch vụ</div>
                                        {booking.services && booking.services.length > 0 ? (
                                            <ul className="list-disc pl-6">
                                                {booking.services.map((s) => (
                                                    <li key={s.id}>{s.typeService} - {s.price?.toLocaleString() || 0} đ</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">Không có dịch vụ.</div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Button variant="outline" onClick={() => navigate('/repair-shop/bookings')}>Quay lại</Button>
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
