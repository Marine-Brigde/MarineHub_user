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
import { Plus, Search, Filter, Edit, Eye, Trash2, Package, TrendingUp, AlertTriangle } from "lucide-react"

const products = [
    {
        id: "SP001",
        name: "Động cơ diesel Caterpillar C32",
        category: "Động cơ chính",
        price: "45,000,000₫",
        stock: 5,
        status: "Còn hàng",
        sold: 12,
        image: "/placeholder-2fj90.png",
    },
    {
        id: "SP002",
        name: "Hệ thống điều hướng GPS Furuno",
        category: "Thiết bị điều hướng",
        price: "28,000,000₫",
        stock: 8,
        status: "Còn hàng",
        sold: 8,
        image: "/gps-navigation-system.png",
    },
    {
        id: "SP003",
        name: "Máy phát điện Cummins 150kW",
        category: "Máy phát điện",
        price: "25,000,000₫",
        stock: 0,
        status: "Hết hàng",
        sold: 15,
        image: "/placeholder-vfv3r.png",
    },
    {
        id: "SP004",
        name: "Bộ phụ tùng máy phát điện",
        category: "Phụ tùng",
        price: "12,500,000₫",
        stock: 12,
        status: "Còn hàng",
        sold: 6,
        image: "/placeholder-3idlx.png",
    },
    {
        id: "SP005",
        name: "Hệ thống radar ARPA",
        category: "Thiết bị an toàn",
        price: "35,000,000₫",
        stock: 3,
        status: "Sắp hết",
        sold: 4,
        image: "/placeholder-8xvie.png",
    },
]

export function ProductsManagement() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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
                            <BreadcrumbPage>Quản lý sản phẩm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Page Title */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Quản lý sản phẩm</h1>
                <p className="text-muted-foreground">Quản lý danh mục thiết bị và phụ tùng hàng hải</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Còn hàng</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">142</div>
                        <p className="text-xs text-muted-foreground">91% tổng sản phẩm</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">8</div>
                        <p className="text-xs text-muted-foreground">Cần nhập thêm</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">6</div>
                        <p className="text-xs text-muted-foreground">Cần nhập ngay</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
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
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>Quản lý thông tin và tồn kho các sản phẩm hàng hải</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá bán</TableHead>
                                <TableHead>Tồn kho</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Đã bán</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image || "/placeholder.svg"}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-md object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">#{product.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell className="font-medium">{product.price}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.status === "Còn hàng"
                                                    ? "default"
                                                    : product.status === "Sắp hết"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{product.sold}</TableCell>
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
