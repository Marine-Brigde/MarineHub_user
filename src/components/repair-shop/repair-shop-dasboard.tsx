

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getRevenuesApi } from "@/api/repairShop/revenueApi"
import { getBookingsApi } from '@/api/booking/bookingApi'
import type { MonthlyRevenue } from "@/types/repairShop/revenue"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const serviceTypeData = [
    { name: "Sửa chữa động cơ", value: 35, color: "hsl(var(--chart-1))" },
    { name: "Bảo trì định kỳ", value: 28, color: "hsl(var(--chart-2))" },
    { name: "Sửa chữa khẩn cấp", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Nâng cấp thiết bị", value: 17, color: "hsl(var(--chart-4))" },
]

const chartConfig = {
    completed: {
        label: "Hoàn thành",
        color: "hsl(var(--chart-1))",
    },
    revenue: {
        label: "Doanh thu",
        color: "hsl(var(--chart-2))",
    },
}

export function RepairShopDashboard() {
    const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([])
    const [revLoading, setRevLoading] = useState(false)
    const [revError, setRevError] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        return d.toISOString().slice(0, 10)
    })
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
    const [rawRevenues, setRawRevenues] = useState<MonthlyRevenue[]>([])
    const [bookingsCount, setBookingsCount] = useState<number | null>(null)
    const [bookingsList, setBookingsList] = useState<any[] | null>(null)

    const loadRevenues = async (start?: string, end?: string) => {
        setRevLoading(true)
        setRevError(null)
        try {
            const res = await getRevenuesApi({ startDate: start, endDate: end })
            const items: MonthlyRevenue[] = (res as any)?.data ?? []
            setRawRevenues(items)
            // map to chart format: show month label as T{month}
            const mapped = items.map((it) => ({ month: `T${it.month}`, revenue: Number(it.totalRevenue || 0) }))
            setRevenueData(mapped.slice(0, 6).reverse())
            // also load bookings in the same date range (for overview)
            // convert YYYY-MM-DD to MM/DD/YYYY format for bookings API
            const formatDateForBookings = (dateStr?: string) => {
                if (!dateStr) return undefined
                const parts = dateStr.split('-')
                if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`
                return dateStr
            }
            try {
                const bk = await getBookingsApi({
                    page: 1,
                    size: 1000,
                    startDate: formatDateForBookings(start),
                    endDate: formatDateForBookings(end)
                })
                const bkItems = (bk as any)?.data?.items ?? []
                setBookingsList(bkItems)
                setBookingsCount(Array.isArray(bkItems) ? bkItems.length : 0)
            } catch (err) {
                console.warn('getBookingsApi failed', err)
                setBookingsList(null)
                setBookingsCount(null)
            }
        } catch (err) {
            console.error('getRevenuesApi', err)
            setRevError('Không thể tải doanh thu')
        } finally {
            setRevLoading(false)
        }
    }

    useEffect(() => {
        // initial load with default dates
        loadRevenues(startDate, endDate)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink >Xưởng sửa chữa</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Tổng quan</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Chào mừng trở lại!</h1>
                <p className="text-muted-foreground">Theo dõi doanh thu và đơn hàng theo thời gian</p>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dịch vụ hoàn thành 6 tháng</CardTitle>
                        <CardDescription>Số lượng dịch vụ hoàn thành theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Từ</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Đến</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div>
                                <Button onClick={() => loadRevenues(startDate, endDate)} disabled={revLoading}>
                                    {revLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Tải'}
                                </Button>
                                {bookingsCount !== null && (
                                    <div className="inline-flex items-center ml-3 text-sm text-muted-foreground">
                                        <span className="mr-2">Đơn hàng:</span>
                                        <Badge>{bookingsCount}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                        {revenueData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="revenue" fill="var(--color-completed)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                Chưa có dữ liệu
                            </div>
                        )}
                        {revError && <div className="text-sm text-destructive mt-2">{revError}</div>}
                        {/* Detailed revenues table */}
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Chi tiết doanh thu</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground">
                                        <th className="pb-2">Tháng</th>
                                        <th className="pb-2">Năm</th>
                                        <th className="pb-2 text-right">Tổng doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawRevenues.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-3 text-muted-foreground">Chưa có dữ liệu</td>
                                        </tr>
                                    ) : rawRevenues.map((r, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="py-2">{`T${r.month}`}</td>
                                            <td className="py-2">{r.year}</td>
                                            <td className="py-2 text-right">{Number(r.totalRevenue).toLocaleString('vi-VN')} đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Bookings detail table */}
                        {bookingsCount !== null && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold mb-2">Chi tiết đơn hàng ({bookingsCount})</h4>
                                {bookingsList && bookingsList.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr className="text-left text-xs text-muted-foreground">
                                                    <th className="p-2">Tàu</th>
                                                    <th className="p-2">Chủ tàu</th>
                                                    <th className="p-2">Bến đậu</th>
                                                    <th className="p-2">Thời gian vào</th>
                                                    <th className="p-2">Thời gian ra</th>
                                                    <th className="p-2 text-right">Tổng tiền</th>
                                                    <th className="p-2">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookingsList.map((bk: any, idx: number) => (
                                                    <tr key={bk.id || idx} className="border-t hover:bg-muted/50">
                                                        <td className="p-2 font-medium">{bk.shipName || 'N/A'}</td>
                                                        <td className="p-2">
                                                            <div>{bk.shipOwnerName || 'N/A'}</div>
                                                            <div className="text-xs text-muted-foreground">{bk.shipOwnerPhoneNumber || ''}</div>
                                                        </td>
                                                        <td className="p-2">{bk.dockSlotName || 'N/A'}</td>
                                                        <td className="p-2">{bk.startTime ? new Date(bk.startTime).toLocaleString('vi-VN') : 'N/A'}</td>
                                                        <td className="p-2">{bk.endTime ? new Date(bk.endTime).toLocaleString('vi-VN') : 'N/A'}</td>
                                                        <td className="p-2 text-right">{Number(bk.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                                                        <td className="p-2">
                                                            <Badge variant={bk.status === 'Confirmed' ? 'default' : bk.status === 'Pending' ? 'secondary' : 'outline'}>
                                                                {bk.status === 'Confirmed' ? 'Đã xác nhận' : bk.status === 'Pending' ? 'Chờ xử lý' : bk.status === 'Cancelled' ? 'Đã hủy' : bk.status || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                                        Không có đơn hàng trong khoảng thời gian này
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Phân loại dịch vụ</CardTitle>
                        <CardDescription>Tỷ lệ các loại dịch vụ sửa chữa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {serviceTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {serviceTypeData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="truncate">{item.name}</span>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
