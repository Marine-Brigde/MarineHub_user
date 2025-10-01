"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Package, ShoppingCart, DollarSign, MapPin, Clock, Star, Eye, Edit, Truck } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts"

const revenueData = [
    { month: "T1", revenue: 45000 },
    { month: "T2", revenue: 52000 },
    { month: "T3", revenue: 48000 },
    { month: "T4", revenue: 61000 },
    { month: "T5", revenue: 55000 },
    { month: "T6", revenue: 67000 },
]

const orderData = [
    { month: "T1", orders: 24 },
    { month: "T2", orders: 31 },
    { month: "T3", orders: 28 },
    { month: "T4", orders: 35 },
    { month: "T5", orders: 32 },
    { month: "T6", orders: 41 },
]

const chartConfig = {
    revenue: {
        label: "Doanh thu",
        color: "hsl(var(--chart-1))",
    },
    orders: {
        label: "Đơn hàng",
        color: "hsl(var(--chart-2))",
    },
}

export function SupplierDashboard() {
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
                <p className="text-muted-foreground">Theo dõi hoạt động kinh doanh và quản lý sản phẩm hàng hải của bạn</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">328,000,000₫</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-accent">+12.5%</span> so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">41</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-accent">+8</span> đơn hàng tuần này
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">156</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-accent">+3</span> sản phẩm mới
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">4.8</div>
                        <p className="text-xs text-muted-foreground">
                            Từ <span className="text-accent">127</span> đánh giá
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu 6 tháng</CardTitle>
                        <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Đơn hàng 6 tháng</CardTitle>
                        <CardDescription>Số lượng đơn hàng theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={orderData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="var(--color-orders)"
                                        strokeWidth={2}
                                        dot={{ fill: "var(--color-orders)" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="orders">Đơn hàng gần đây</TabsTrigger>
                    <TabsTrigger value="products">Sản phẩm bán chạy</TabsTrigger>
                    <TabsTrigger value="delivery">Giao hàng</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đơn hàng mới nhất</CardTitle>
                            <CardDescription>Các đơn hàng cần xử lý</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        id: "DH001",
                                        customer: "Công ty Vận tải Biển Đông",
                                        product: "Động cơ diesel Caterpillar C32",
                                        amount: "45,000,000₫",
                                        status: "Chờ xác nhận",
                                        time: "2 giờ trước",
                                    },
                                    {
                                        id: "DH002",
                                        customer: "Xưởng sửa chữa Hải Phòng",
                                        product: "Bộ phụ tùng máy phát điện",
                                        amount: "12,500,000₫",
                                        status: "Đang chuẩn bị",
                                        time: "4 giờ trước",
                                    },
                                    {
                                        id: "DH003",
                                        customer: "Công ty Tàu thủy Sài Gòn",
                                        product: "Hệ thống điều hướng GPS",
                                        amount: "28,000,000₫",
                                        status: "Sẵn sàng giao",
                                        time: "6 giờ trước",
                                    },
                                ].map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{order.id}</span>
                                                <Badge
                                                    variant={
                                                        order.status === "Chờ xác nhận"
                                                            ? "destructive"
                                                            : order.status === "Đang chuẩn bị"
                                                                ? "secondary"
                                                                : "default"
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{order.customer}</p>
                                            <p className="text-sm font-medium">{order.product}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {order.time}
                                                </span>
                                                <span className="font-medium text-primary">{order.amount}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm bán chạy nhất</CardTitle>
                            <CardDescription>Top sản phẩm có doanh số cao</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        name: "Động cơ diesel Caterpillar C32",
                                        category: "Động cơ chính",
                                        sold: 12,
                                        revenue: "540,000,000₫",
                                        trend: "+15%",
                                    },
                                    {
                                        name: "Hệ thống điều hướng GPS Furuno",
                                        category: "Thiết bị điều hướng",
                                        sold: 8,
                                        revenue: "224,000,000₫",
                                        trend: "+8%",
                                    },
                                    {
                                        name: "Máy phát điện Cummins 150kW",
                                        category: "Máy phát điện",
                                        sold: 15,
                                        revenue: "375,000,000₫",
                                        trend: "+22%",
                                    },
                                ].map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span>
                                                    Đã bán: <span className="font-medium">{product.sold}</span>
                                                </span>
                                                <span className="text-accent">{product.trend}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-primary">{product.revenue}</p>
                                            <p className="text-xs text-muted-foreground">Doanh thu</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch giao hàng</CardTitle>
                            <CardDescription>Các đơn hàng cần giao trong tuần</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        id: "GH001",
                                        destination: "Xưởng sửa chữa Cát Lái, TP.HCM",
                                        product: "Bộ phụ tùng máy phát điện",
                                        date: "Hôm nay, 14:00",
                                        status: "Đang giao",
                                        driver: "Nguyễn Văn A",
                                    },
                                    {
                                        id: "GH002",
                                        destination: "Cảng Hải Phòng, Quận Hồng Bàng",
                                        product: "Hệ thống điều hướng GPS",
                                        date: "Mai, 09:00",
                                        status: "Đã lên lịch",
                                        driver: "Trần Văn B",
                                    },
                                    {
                                        id: "GH003",
                                        destination: "Xưởng Đóng tàu Sài Gòn",
                                        product: "Động cơ diesel Caterpillar",
                                        date: "Thứ 6, 10:30",
                                        status: "Chuẩn bị",
                                        driver: "Chưa phân công",
                                    },
                                ].map((delivery) => (
                                    <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{delivery.id}</span>
                                                <Badge
                                                    variant={
                                                        delivery.status === "Đang giao"
                                                            ? "default"
                                                            : delivery.status === "Đã lên lịch"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {delivery.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium">{delivery.product}</p>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {delivery.destination}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{delivery.date}</span>
                                                <span className="flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    {delivery.driver}
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            Theo dõi
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
