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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

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
    // latestOrders: Chỉ 5 orders mới nhất để hiển thị trong dashboard
    // Revenue được tính từ API getRevenuesApi (tất cả orders), không chỉ 5 orders mới nhất
    const [latestOrders, setLatestOrders] = useState<OrderResponseData[]>([])

    const loadOrders = async (start?: string, end?: string) => {
        setRevLoading(true)
        setRevError(null)
        try {
            // Load revenues data from API
            const res = await getRevenuesApi({ startDate: start, endDate: end })
            const items: MonthlyRevenue[] = (res as any)?.data ?? []
            setRawRevenues(items)
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
                isAsc: false // Sort mới nhất trước
            })
            const ordersItems: OrderResponseData[] = (ordersRes as any)?.data?.items ?? []
            
            // Đếm tổng số orders (revenue được tính từ API getRevenuesApi, không phải từ ordersItems)
            setOrdersCount(ordersItems.length)
            
            // Lấy 5 orders mới nhất để hiển thị
            // API đã sort theo createdDate desc (isAsc: false), nên chỉ cần lấy 5 đầu tiên
            const sortedOrders = [...ordersItems].sort((a, b) => {
                // Sort theo createdDate nếu có, nếu không thì sort theo id
                const aDate = (a as any).createdDate ? new Date((a as any).createdDate).getTime() : 0
                const bDate = (b as any).createdDate ? new Date((b as any).createdDate).getTime() : 0
                if (aDate !== 0 && bDate !== 0) {
                    return bDate - aDate // Mới nhất trước
                }
                // Nếu không có date, sort theo id (UUID mới hơn thường có giá trị lớn hơn)
                return b.id.localeCompare(a.id)
            })
            setLatestOrders(sortedOrders.slice(0, 5))
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

            {/* Revenue Chart Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Doanh thu theo tháng</CardTitle>
                            <CardDescription>Biểu đồ doanh thu và chi tiết đơn hàng</CardDescription>
                        </div>
                        {ordersCount !== null && (
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {ordersCount} đơn hàng
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Từ ngày:</label>
                            <Input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[160px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Đến ngày:</label>
                            <Input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[160px]"
                            />
                        </div>
                        <Button 
                            onClick={() => loadOrders(startDate, endDate)} 
                            disabled={revLoading}
                            className="ml-auto"
                        >
                            {revLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    Đang tải...
                                </>
                            ) : (
                                'Tải dữ liệu'
                            )}
                        </Button>
                    </div>
                        {revenueData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg mb-6">
                                Chưa có dữ liệu doanh thu
                            </div>
                        )}
                        {revError && (
                            <div className="text-sm text-destructive mt-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                {revError}
                            </div>
                        )}
                        {/* Detailed revenues table */}
                        <div className="mb-6">
                            <h4 className="text-base font-semibold mb-3">Chi tiết doanh thu</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr className="text-left">
                                            <th className="p-3 text-xs font-semibold text-muted-foreground">Tháng</th>
                                            <th className="p-3 text-xs font-semibold text-muted-foreground">Năm</th>
                                            <th className="p-3 text-xs font-semibold text-muted-foreground text-right">Tổng doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawRevenues.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-muted-foreground">Chưa có dữ liệu</td>
                                            </tr>
                                        ) : rawRevenues.map((r, idx) => (
                                            <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium">{`T${r.month}`}</td>
                                                <td className="p-3">{r.year}</td>
                                                <td className="p-3 text-right font-semibold text-primary">{Number(r.totalRevenue).toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Latest Orders table - Hiển thị 5 orders mới nhất */}
                        {ordersCount !== null && latestOrders.length > 0 && (
                            <div>
                                <h4 className="text-base font-semibold mb-3">
                                    5 đơn hàng mới nhất 
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        (Tổng: {ordersCount} đơn hàng)
                                    </span>
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr className="text-left">
                                                    <th className="p-3 text-xs font-semibold text-muted-foreground">Mã đơn</th>
                                                    <th className="p-3 text-xs font-semibold text-muted-foreground">Tàu</th>
                                                    <th className="p-3 text-xs font-semibold text-muted-foreground">Xưởng</th>
                                                    <th className="p-3 text-xs font-semibold text-muted-foreground text-right">Tổng tiền</th>
                                                    <th className="p-3 text-xs font-semibold text-muted-foreground">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {latestOrders.map((order) => (
                                                    <tr key={order.id} className="border-t hover:bg-muted/50 transition-colors">
                                                        <td className="p-3 font-mono text-xs font-medium">{order.id.slice(0, 8)}</td>
                                                        <td className="p-3">{order.shipName || 'N/A'}</td>
                                                        <td className="p-3">{order.boatyardName || 'N/A'}</td>
                                                        <td className="p-3 text-right font-semibold text-primary">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                                                        <td className="p-3">
                                                            <Badge variant={
                                                                order.status === 'Completed' ? 'default' :
                                                                    order.status === 'Approved' ? 'secondary' :
                                                                        order.status === 'Delivered' ? 'outline' :
                                                                            order.status === 'Rejected' ? 'destructive' : 
                                                                                order.status === 'Pending' ? 'secondary' : 'secondary'
                                                            }>
                                                                {order.status === 'Approved' ? 'Đã duyệt' :
                                                                    order.status === 'Delivered' ? 'Đã giao' :
                                                                        order.status === 'Completed' ? 'Hoàn thành' :
                                                                            order.status === 'Rejected' ? 'Đã hủy' :
                                                                                order.status === 'Pending' ? 'Chờ xử lý' : order.status || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {ordersCount !== null && latestOrders.length === 0 && (
                            <div>
                                <h4 className="text-base font-semibold mb-3">5 đơn hàng mới nhất</h4>
                                <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
                                    Không có đơn hàng trong khoảng thời gian này
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

        </div>
    )
}
