"use client"

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
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getOrdersApi } from "@/api/Order/orderApi"
import { getRevenuesApi } from "@/api/repairShop/revenueApi"
import type { OrderResponseData } from "@/types/Order/order"
import type { MonthlyRevenue } from "@/types/repairShop/revenue"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const chartConfig = {
    orders: {
        label: "Đơn hàng",
        color: "hsl(var(--chart-1))",
    },
    revenue: {
        label: "Doanh thu",
        color: "hsl(var(--chart-2))",
    },
}

export function SupplierDashboard() {
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
    const [ordersCount, setOrdersCount] = useState<number | null>(null)
    const [latestOrders, setLatestOrders] = useState<OrderResponseData[]>([])
    const [totalRevenue, setTotalRevenue] = useState<number>(0)
    const [orderStatusData, setOrderStatusData] = useState<{ name: string; value: number; color: string }[]>([
        { name: "Chờ xử lý", value: 0, color: "#f59e0b" },
        { name: "Đã duyệt", value: 0, color: "#3b82f6" },
        { name: "Đã giao", value: 0, color: "#10b981" },
        { name: "Hoàn thành", value: 0, color: "#8b5cf6" },
        { name: "Đã hủy", value: 0, color: "#ef4444" },
    ])

    const loadOrders = async (start?: string, end?: string) => {
        setRevLoading(true)
        setRevError(null)
        try {
            // Load revenues data from API
            const res = await getRevenuesApi({ startDate: start, endDate: end })
            const items: MonthlyRevenue[] = (res as any)?.data ?? []
            setRawRevenues(items)
            
            // Tính tổng revenue từ revenue API (để đảm bảo khớp với dashboard)
            const totalRevenueFromApi = items.reduce((sum, item) => sum + (Number(item.totalRevenue || 0)), 0)
            setTotalRevenue(totalRevenueFromApi)
            
            // map to chart format: show month label as T{month}
            const mapped = items.map((it) => ({ month: `T${it.month}`, revenue: Number(it.totalRevenue || 0) }))
            setRevenueData(mapped.slice(0, 6).reverse())

            // Load orders data
            const formatDateForOrders = (dateStr?: string) => {
                if (!dateStr) return undefined
                const parts = dateStr.split('-')
                if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`
                return dateStr
            }

            const ordersRes = await getOrdersApi({
                page: 1,
                pageSize: 1000,
                startDate: formatDateForOrders(start),
                endDate: formatDateForOrders(end),
                sortBy: 'createdDate',
                isAsc: false // Sắp xếp mới nhất trước
            })
            const ordersItems: OrderResponseData[] = (ordersRes as any)?.data?.items ?? []
            setOrdersCount(ordersItems.length)

            // Lấy 5 order mới nhất
            const latest = ordersItems.slice(0, 5)
            setLatestOrders(latest)

            // Calculate order status distribution
            const statusCounts = {
                'Pending': 0,
                'Approved': 0,
                'Delivered': 0,
                'Completed': 0,
                'Rejected': 0
            }

            ordersItems.forEach((order) => {
                if (order.status && statusCounts.hasOwnProperty(order.status)) {
                    statusCounts[order.status as keyof typeof statusCounts]++
                }
            })

            const totalOrders = ordersItems.length || 1
            const statusData = [
                { name: "Chờ xử lý", value: Math.round((statusCounts.Pending / totalOrders) * 100), count: statusCounts.Pending, color: "#f59e0b" },
                { name: "Đã duyệt", value: Math.round((statusCounts.Approved / totalOrders) * 100), count: statusCounts.Approved, color: "#3b82f6" },
                { name: "Đã giao", value: Math.round((statusCounts.Delivered / totalOrders) * 100), count: statusCounts.Delivered, color: "#10b981" },
                { name: "Hoàn thành", value: Math.round((statusCounts.Completed / totalOrders) * 100), count: statusCounts.Completed, color: "#8b5cf6" },
                { name: "Đã hủy", value: Math.round((statusCounts.Rejected / totalOrders) * 100), count: statusCounts.Rejected, color: "#ef4444" },
            ].filter(s => s.count > 0)

            setOrderStatusData(statusData.length > 0 ? statusData : [
                { name: "Không có dữ liệu", value: 100, count: 0, color: "#9ca3af" }
            ])
        } catch (err) {
            console.error('loadOrders error', err)
            setRevError('Không thể tải dữ liệu')
        } finally {
            setRevLoading(false)
        }
    }

    useEffect(() => {
        loadOrders(startDate, endDate)
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
                            <BreadcrumbLink href="/suppliers">Nhà cung cấp</BreadcrumbLink>
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
                <p className="text-muted-foreground">Theo dõi đơn hàng theo thời gian</p>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu 6 tháng</CardTitle>
                        <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
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
                                <Button onClick={() => loadOrders(startDate, endDate)} disabled={revLoading}>
                                    {revLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Tải'}
                                </Button>
                                {ordersCount !== null && (
                                    <div className="inline-flex items-center ml-3 text-sm text-muted-foreground">
                                        <span className="mr-2">Đơn hàng:</span>
                                        <Badge>{ordersCount}</Badge>
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
                                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                Chưa có dữ liệu
                            </div>
                        )}
                        {revError && <div className="text-sm text-destructive mt-2">{revError}</div>}
                        {/* Total Revenue Summary */}
                        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Tổng doanh thu:</span>
                                <span className="text-lg font-bold text-primary">
                                    {totalRevenue.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tổng doanh thu trong khoảng thời gian đã chọn (từ Revenue API)
                            </p>
                        </div>
                        {/* Detailed revenues table */}
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Chi tiết doanh thu theo tháng</h4>
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
                        {/* Latest 5 Orders */}
                        {latestOrders.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold mb-2">5 đơn hàng mới nhất</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr className="text-left text-xs text-muted-foreground">
                                                <th className="p-2">Mã đơn</th>
                                                <th className="p-2">Tàu</th>
                                                <th className="p-2">Xưởng</th>
                                                <th className="p-2 text-right">Tổng tiền</th>
                                                <th className="p-2">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {latestOrders.map((order) => (
                                                <tr key={order.id} className="border-t hover:bg-muted/50">
                                                    <td className="p-2 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                                    <td className="p-2">{order.shipName || 'N/A'}</td>
                                                    <td className="p-2">{order.boatyardName || 'N/A'}</td>
                                                    <td className="p-2 text-right font-medium">
                                                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                                                    </td>
                                                    <td className="p-2">
                                                        <Badge variant={
                                                            order.status === 'Completed' ? 'default' :
                                                                order.status === 'Approved' ? 'secondary' :
                                                                    order.status === 'Delivered' ? 'outline' :
                                                                        order.status === 'Rejected' ? 'destructive' : 'secondary'
                                                        }>
                                                            {order.status === 'Approved' ? 'Đã duyệt' :
                                                                order.status === 'Delivered' ? 'Đã giao' :
                                                                    order.status === 'Completed' ? 'Hoàn thành' :
                                                                        order.status === 'Rejected' ? 'Đã hủy' :
                                                                            order.status === 'Pending' ? 'Chờ xử lý' : order.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Phân loại đơn hàng</CardTitle>
                        <CardDescription>Tỷ lệ trạng thái đơn hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {orderStatusData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="truncate">{item.name}</span>
                                    {(item as any).count !== undefined && <span className="font-medium">{(item as any).count}</span>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
