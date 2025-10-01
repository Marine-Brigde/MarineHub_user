"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Eye, Trash2, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react"

const services = [
    {
        id: "DV001",
        name: "Bảo trì động cơ chính",
        category: "Động cơ",
        duration: "4-6 giờ",
        price: "15,000,000₫",
        status: "Có sẵn",
        capacity: "2 tàu/ngày",
        description: "Bảo trì định kỳ động cơ chính, thay dầu, kiểm tra hệ thống",
    },
    {
        id: "DV002",
        name: "Sửa chữa hệ thống điều hướng",
        category: "Điện tử",
        duration: "2-4 giờ",
        price: "8,500,000₫",
        status: "Có sẵn",
        capacity: "3 tàu/ngày",
        description: "Sửa chữa và hiệu chỉnh GPS, radar, la bàn điện tử",
    },
    {
        id: "DV003",
        name: "Đại tu động cơ",
        category: "Động cơ",
        duration: "7-10 ngày",
        price: "150,000,000₫",
        status: "Bận",
        capacity: "1 tàu/tháng",
        description: "Đại tu toàn bộ động cơ chính, thay thế linh kiện lớn",
    },
    {
        id: "DV004",
        name: "Kiểm tra an toàn định kỳ",
        category: "An toàn",
        duration: "1-2 giờ",
        price: "3,000,000₫",
        status: "Có sẵn",
        capacity: "5 tàu/ngày",
        description: "Kiểm tra thiết bị an toàn, cứu sinh, phòng cháy chữa cháy",
    },
    {
        id: "DV005",
        name: "Sửa chữa thân tàu",
        category: "Kết cấu",
        duration: "3-5 ngày",
        price: "45,000,000₫",
        status: "Bảo trì",
        capacity: "1 tàu/tuần",
        description: "Hàn sửa vỏ tàu, chống rỉ sét, sơn phủ bảo vệ",
    },
]

export function ServicesManagement() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredServices = services.filter(
        (service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/repair-shop">Xưởng sửa chữa</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý dịch vụ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Page Title */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h1>
                <p className="text-muted-foreground">Quản lý các dịch vụ sửa chữa và lịch trống của xưởng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng dịch vụ</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">24</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary">+2</span> dịch vụ mới
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">18</div>
                        <p className="text-xs text-muted-foreground">75% tổng dịch vụ</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang bận</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">4</div>
                        <p className="text-xs text-muted-foreground">Đang thực hiện</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-secondary">2</div>
                        <p className="text-xs text-muted-foreground">Cần bảo trì thiết bị</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Lọc
                    </Button>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dịch vụ
                </Button>
            </div>

            {/* Services Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách dịch vụ</CardTitle>
                    <CardDescription>Quản lý thông tin dịch vụ sửa chữa và công suất</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Giá dịch vụ</TableHead>
                                <TableHead>Công suất</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{service.name}</p>
                                            <p className="text-sm text-muted-foreground">#{service.id}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell>{service.duration}</TableCell>
                                    <TableCell className="font-medium">{service.price}</TableCell>
                                    <TableCell>{service.capacity}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                service.status === "Có sẵn" ? "default" : service.status === "Bận" ? "secondary" : "destructive"
                                            }
                                        >
                                            {service.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
