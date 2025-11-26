"use client"

import React, { useEffect, useState } from 'react'
import Header from '@/components/common/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getBookingsApi } from '@/api/booking/bookingApi'
import type { Booking } from '@/types/Booking/booking'
import { Link } from 'react-router-dom'

export default function RepairShopBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        getBookingsApi({ page: 1, size: 30 })
            .then((res) => {
                const items = (res as any)?.data?.items ?? []
                setBookings(items)
            })
            .catch((err) => {
                console.error('getBookingsApi', err)
                setError(err?.response?.data?.message || 'Lỗi khi tải lịch đặt')
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch đặt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading && <div>Đang tải...</div>}
                            {error && <div className="text-destructive">{error}</div>}

                            {!loading && !error && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Tên tàu</TableHead>
                                            <TableHead>Vị trí</TableHead>
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell className="truncate max-w-[200px]">{b.id}</TableCell>
                                                <TableCell>{b.shipName || '-'}</TableCell>
                                                <TableCell>{b.dockSlotName || '-'}</TableCell>
                                                <TableCell>{b.startTime ? new Date(b.startTime).toLocaleString() : '-'} - {b.endTime ? new Date(b.endTime).toLocaleString() : '-'}</TableCell>
                                                <TableCell>{b.status}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link to={`/repair-shop/bookings/${b.id}`} className="text-primary underline">Xem</Link>
                                                </TableCell>
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
