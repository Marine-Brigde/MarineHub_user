

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
import {
    Calendar,
    Ship,
    Clock,
    MapPin,
    CheckCircle,
    TrendingUp,
    Eye,
    Edit,
    Play,
    Pause,
    Navigation,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const serviceData = [
    { month: "T1", completed: 18, revenue: 450000 },
    { month: "T2", completed: 22, revenue: 580000 },
    { month: "T3", completed: 19, revenue: 520000 },
    { month: "T4", completed: 25, revenue: 650000 },
    { month: "T5", completed: 21, revenue: 590000 },
    { month: "T6", completed: 28, revenue: 720000 },
]

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
                <p className="text-muted-foreground">Quản lý lịch hẹn sửa chữa và theo dõi tiến độ công việc</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lịch hẹn hôm nay</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">8</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary">3</span> đang thực hiện
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tàu đang sửa chữa</CardTitle>
                        <Ship className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">12</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary">85%</span> công suất
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoàn thành tháng</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">28</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary">+12%</span> so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">720,000,000₫</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary">+18%</span> tăng trưởng
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dịch vụ hoàn thành 6 tháng</CardTitle>
                        <CardDescription>Số lượng dịch vụ hoàn thành theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
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

            {/* Main Content Tabs */}
            <Tabs defaultValue="appointments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="appointments">Lịch hẹn hôm nay</TabsTrigger>
                    <TabsTrigger value="tracking">Theo dõi tàu</TabsTrigger>
                    <TabsTrigger value="progress">Tiến độ công việc</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch hẹn sửa chữa hôm nay</CardTitle>
                            <CardDescription>Các cuộc hẹn cần thực hiện trong ngày</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        id: "LH001",
                                        shipName: "MV Hải Phong Express",
                                        service: "Bảo trì động cơ chính",
                                        time: "08:00 - 12:00",
                                        status: "Đang thực hiện",
                                        captain: "Thuyền trưởng Nguyễn Văn A",
                                        dock: "Cầu tàu số 3",
                                    },
                                    {
                                        id: "LH002",
                                        shipName: "MV Sài Gòn Star",
                                        service: "Sửa chữa hệ thống điều hướng",
                                        time: "13:00 - 17:00",
                                        status: "Sắp bắt đầu",
                                        captain: "Thuyền trưởng Trần Văn B",
                                        dock: "Cầu tàu số 1",
                                    },
                                    {
                                        id: "LH003",
                                        shipName: "MV Đông Nam Á",
                                        service: "Kiểm tra an toàn định kỳ",
                                        time: "14:00 - 16:00",
                                        status: "Chờ xác nhận",
                                        captain: "Thuyền trưởng Lê Văn C",
                                        dock: "Cầu tàu số 2",
                                    },
                                ].map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{appointment.id}</span>
                                                <Badge
                                                    variant={
                                                        appointment.status === "Đang thực hiện"
                                                            ? "default"
                                                            : appointment.status === "Sắp bắt đầu"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium">{appointment.shipName}</p>
                                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {appointment.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {appointment.dock}
                                                </span>
                                                <span>{appointment.captain}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm">
                                                {appointment.status === "Đang thực hiện" ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theo dõi vị trí tàu</CardTitle>
                            <CardDescription>Tàu đang di chuyển đến xưởng sửa chữa</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        id: "TT001",
                                        shipName: "MV Pacific Ocean",
                                        eta: "2 giờ 30 phút",
                                        distance: "45 hải lý",
                                        status: "Đang di chuyển",
                                        speed: "12 knots",
                                        coordinates: "10°45'N, 106°40'E",
                                    },
                                    {
                                        id: "TT002",
                                        shipName: "MV Atlantic Breeze",
                                        eta: "4 giờ 15 phút",
                                        distance: "78 hải lý",
                                        status: "Đang di chuyển",
                                        speed: "15 knots",
                                        coordinates: "10°30'N, 106°25'E",
                                    },
                                    {
                                        id: "TT003",
                                        shipName: "MV Indian Explorer",
                                        eta: "30 phút",
                                        distance: "8 hải lý",
                                        status: "Sắp đến",
                                        speed: "8 knots",
                                        coordinates: "10°52'N, 106°48'E",
                                    },
                                ].map((ship) => (
                                    <div key={ship.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{ship.id}</span>
                                                <Badge variant={ship.status === "Sắp đến" ? "default" : "secondary"}>{ship.status}</Badge>
                                            </div>
                                            <p className="text-sm font-medium">{ship.shipName}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    ETA: {ship.eta}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {ship.distance}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Navigation className="h-3 w-3" />
                                                    {ship.speed}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Tọa độ: {ship.coordinates}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                Bản đồ
                                            </Button>
                                            <Button size="sm">Chuẩn bị đón</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tiến độ công việc</CardTitle>
                            <CardDescription>Các dự án sửa chữa đang thực hiện</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        id: "DA001",
                                        shipName: "MV Golden Dragon",
                                        service: "Đại tu động cơ chính",
                                        progress: 75,
                                        startDate: "15/11/2024",
                                        expectedEnd: "25/11/2024",
                                        status: "Đang thực hiện",
                                        team: "Đội kỹ thuật A",
                                    },
                                    {
                                        id: "DA002",
                                        shipName: "MV Silver Wave",
                                        service: "Thay thế hệ thống radar",
                                        progress: 45,
                                        startDate: "18/11/2024",
                                        expectedEnd: "28/11/2024",
                                        status: "Đang thực hiện",
                                        team: "Đội điện tử B",
                                    },
                                    {
                                        id: "DA003",
                                        shipName: "MV Blue Horizon",
                                        service: "Sửa chữa khẩn cấp thân tàu",
                                        progress: 90,
                                        startDate: "20/11/2024",
                                        expectedEnd: "22/11/2024",
                                        status: "Sắp hoàn thành",
                                        team: "Đội hàn C",
                                    },
                                ].map((project) => (
                                    <div key={project.id} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">#{project.id}</span>
                                                <Badge variant={project.status === "Sắp hoàn thành" ? "default" : "secondary"}>
                                                    {project.status}
                                                </Badge>
                                            </div>
                                            <span className="text-sm font-medium text-accent">{project.progress}%</span>
                                        </div>

                                        <div>
                                            <p className="font-medium">{project.shipName}</p>
                                            <p className="text-sm text-muted-foreground">{project.service}</p>
                                        </div>

                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-accent h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Bắt đầu: {project.startDate}</span>
                                            <span>Dự kiến: {project.expectedEnd}</span>
                                            <span>{project.team}</span>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Chi tiết
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Cập nhật
                                            </Button>
                                            <Button size="sm">Báo cáo</Button>
                                        </div>
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
