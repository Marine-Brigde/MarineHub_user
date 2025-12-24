"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Header from "@/components/common/header"
import { Search, Building2, Filter, Loader2, Eye, Grid, List, MapPin, Phone, Mail, User, Calendar, Navigation } from "lucide-react"
import { getSuppliersApi } from "@/api/Supplier/supplierApi"
import type { Supplier, SupplierListResponse } from "@/types/Supplier/supplier"
import type { BaseResponse } from "@/types/Supplier/supplier"
import { useNavigate } from "react-router-dom"

export default function SuppliersPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [, setSelectedSupplier] = useState<Supplier | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(12)
    const [sortBy, setSortBy] = useState("name")
    const [isAsc, setIsAsc] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Load suppliers from API
    useEffect(() => {
        loadSuppliers()
    }, [page, size, sortBy, isAsc])

    const loadSuppliers = async () => {
        try {
            setIsLoading(true)
            setError("")

            const response: BaseResponse<SupplierListResponse> = await getSuppliersApi({
                page,
                size,
                sortBy,
                isAsc,
                name: searchTerm || undefined,
            })

            if (response.status === 200 && response.data) {
                setSuppliers(response.data.items || [])
                setTotalPages(response.data.totalPages || 0)
                setTotal(response.data.total || 0)
            } else {
                setError(response.message || "Không thể tải danh sách nhà cung cấp")
            }
        } catch (err: any) {
            console.error("Error loading suppliers:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tải danh sách nhà cung cấp"
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1) // Reset to first page when searching
        loadSuppliers()
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const openMap = (longitude: string, latitude: string) => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`
        window.open(url, "_blank")
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto py-8 px-4 space-y-6">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang Chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Nhà cung cấp</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Nhà cung cấp hàng hải</h1>
                        <p className="text-muted-foreground mt-1">
                            {total > 0 ? `${total} nhà cung cấp` : "Khám phá các nhà cung cấp hàng hải uy tín"}
                        </p>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            Tìm kiếm và Lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm nhà cung cấp theo tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tìm...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Tìm kiếm
                                        </>
                                    )}
                                </Button>
                            </form>

                            <Separator />

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Sắp xếp theo</Label>
                                    <Select value={sortBy} onValueChange={(value) => {
                                        setSortBy(value)
                                        setPage(1)
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sắp xếp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Tên nhà cung cấp</SelectItem>
                                            <SelectItem value="createdDate">Ngày tạo</SelectItem>
                                            <SelectItem value="lastModifiedDate">Ngày cập nhật</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Thứ tự</Label>
                                    <Select value={isAsc ? "asc" : "desc"} onValueChange={(value) => {
                                        setIsAsc(value === "asc")
                                        setPage(1)
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Thứ tự" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Tăng dần</SelectItem>
                                            <SelectItem value="desc">Giảm dần</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Số lượng / trang</Label>
                                    <Select value={size.toString()} onValueChange={(value) => {
                                        setSize(Number(value))
                                        setPage(1)
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Số lượng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12">12 nhà cung cấp</SelectItem>
                                            <SelectItem value="24">24 nhà cung cấp</SelectItem>
                                            <SelectItem value="48">48 nhà cung cấp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Chế độ xem</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={viewMode === "grid" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setViewMode("grid")}
                                            className="flex-1"
                                        >
                                            <Grid className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={viewMode === "list" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setViewMode("list")}
                                            className="flex-1"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && suppliers.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Đang tải danh sách nhà cung cấp...</p>
                        </div>
                    </div>
                )}

                {/* Suppliers Grid/List */}
                {!isLoading && suppliers.length > 0 && (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {suppliers.map((supplier) => (
                                    <Card key={supplier.id} className="hover:shadow-lg transition-shadow group">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border-2 border-primary/20">
                                                    <AvatarImage src={supplier.avatarUrl || undefined} alt={supplier.name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                        {getInitials(supplier.fullName || supplier.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg line-clamp-2 mb-1">
                                                        {supplier.name}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {supplier.fullName}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2 text-sm">
                                                {supplier.address && (
                                                    <div className="flex items-start gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                                        <span className="line-clamp-2">{supplier.address}</span>
                                                    </div>
                                                )}
                                                {supplier.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                                                        <span>{supplier.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                                                        <span className="truncate">{supplier.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Separator />
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => setSelectedSupplier(supplier)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Xem chi tiết
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-3">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage src={supplier.avatarUrl || undefined} alt={supplier.name} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                    {getInitials(supplier.fullName || supplier.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{supplier.fullName}</p>
                                                            </div>
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Thông tin chi tiết về nhà cung cấp
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                                    <User className="h-4 w-4" />
                                                                    Tên đăng nhập
                                                                </Label>
                                                                <p className="text-sm text-muted-foreground">{supplier.username}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                                    <Mail className="h-4 w-4" />
                                                                    Email
                                                                </Label>
                                                                <p className="text-sm text-muted-foreground">{supplier.email}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                                    <Phone className="h-4 w-4" />
                                                                    Số điện thoại
                                                                </Label>
                                                                <p className="text-sm text-muted-foreground">{supplier.phoneNumber}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Ngày tạo
                                                                </Label>
                                                                <p className="text-sm text-muted-foreground">{formatDate(supplier.createdDate)}</p>
                                                            </div>
                                                        </div>
                                                        {supplier.address && (
                                                            <div className="space-y-1">
                                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4" />
                                                                    Địa chỉ
                                                                </Label>
                                                                <p className="text-sm text-muted-foreground">{supplier.address}</p>
                                                                {supplier.longitude && supplier.latitude && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="mt-2"
                                                                        onClick={() => openMap(supplier.longitude, supplier.latitude)}
                                                                    >
                                                                        <Navigation className="mr-2 h-4 w-4" />
                                                                        Xem trên bản đồ
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                onClick={() => navigate(`/suppliers/${supplier.id}`, { state: { supplier } })}
                                            >
                                                <Building2 className="mr-2 h-4 w-4" />
                                                Xem Thêm
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suppliers.map((supplier) => (
                                    <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                <Avatar className="h-24 w-24 border-2 border-primary/20 flex-shrink-0">
                                                    <AvatarImage src={supplier.avatarUrl || undefined} alt={supplier.name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                                        {getInitials(supplier.fullName || supplier.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold mb-1">{supplier.name}</h3>
                                                        <p className="text-sm text-muted-foreground mb-3">{supplier.fullName}</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                            {supplier.address && (
                                                                <div className="flex items-start gap-2 text-muted-foreground">
                                                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                                                    <span>{supplier.address}</span>
                                                                </div>
                                                            )}
                                                            {supplier.phoneNumber && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                                                                    <span>{supplier.phoneNumber}</span>
                                                                </div>
                                                            )}
                                                            {supplier.email && (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                                                                    <span>{supplier.email}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                                                                <span>{formatDate(supplier.createdDate)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setSelectedSupplier(supplier)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Xem chi tiết
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle className="flex items-center gap-3">
                                                                        <Avatar className="h-12 w-12">
                                                                            <AvatarImage src={supplier.avatarUrl || undefined} alt={supplier.name} />
                                                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                                {getInitials(supplier.fullName || supplier.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <h3 className="text-xl font-semibold">{supplier.name}</h3>
                                                                            <p className="text-sm text-muted-foreground">{supplier.fullName}</p>
                                                                        </div>
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Thông tin chi tiết về nhà cung cấp
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4 mt-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                                <User className="h-4 w-4" />
                                                                                Tên đăng nhập
                                                                            </Label>
                                                                            <p className="text-sm text-muted-foreground">{supplier.username}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                                <Mail className="h-4 w-4" />
                                                                                Email
                                                                            </Label>
                                                                            <p className="text-sm text-muted-foreground">{supplier.email}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                                <Phone className="h-4 w-4" />
                                                                                Số điện thoại
                                                                            </Label>
                                                                            <p className="text-sm text-muted-foreground">{supplier.phoneNumber}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Ngày tạo
                                                                            </Label>
                                                                            <p className="text-sm text-muted-foreground">{formatDate(supplier.createdDate)}</p>
                                                                        </div>
                                                                    </div>
                                                                    {supplier.address && (
                                                                        <div className="space-y-1">
                                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                                <MapPin className="h-4 w-4" />
                                                                                Địa chỉ
                                                                            </Label>
                                                                            <p className="text-sm text-muted-foreground">{supplier.address}</p>
                                                                            {supplier.longitude && supplier.latitude && (
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="mt-2"
                                                                                    onClick={() => openMap(supplier.longitude, supplier.latitude)}
                                                                                >
                                                                                    <Navigation className="mr-2 h-4 w-4" />
                                                                                    Xem trên bản đồ
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => navigate(`/suppliers/${supplier.id}`, { state: { supplier } })}
                                                        >
                                                            <Building2 className="mr-2 h-4 w-4" />
                                                            Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Trang {page} / {totalPages} - Tổng {total} nhà cung cấp
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1 || isLoading}
                                    >
                                        Trước
                                    </Button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setPage(pageNum)}
                                                disabled={isLoading}
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages || isLoading}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!isLoading && suppliers.length === 0 && !error && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Không tìm thấy nhà cung cấp nào</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Thử tìm kiếm với từ khóa khác"
                                    : "Hiện tại chưa có nhà cung cấp nào trong hệ thống"}
                            </p>
                            {searchTerm && (
                                <Button variant="outline" onClick={() => {
                                    setSearchTerm("")
                                    setPage(1)
                                }}>
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

