"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Header from "@/components/common/header"
import { Search, Package, Filter, Loader2, ShoppingCart, Eye, Grid, List } from "lucide-react"
import { getProductsApi } from "@/api/Product/productApi"
import type { Product, ProductListResponse } from "@/types/Product/product"
import type { BaseResponse } from "@/types/Product/product"
import { useNavigate } from "react-router-dom"

export default function ProductsPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(12)
    const [sortBy, setSortBy] = useState("name")
    const [isAsc, setIsAsc] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Load products from API
    useEffect(() => {
        loadProducts()
    }, [page, size, sortBy, isAsc, searchTerm])

    const loadProducts = async () => {
        try {
            setIsLoading(true)
            setError("")

            const response: BaseResponse<ProductListResponse> = await getProductsApi({
                page,
                size,
                sortBy,
                isAsc,
                name: searchTerm || undefined,
            })

            if (response.status === 200 && response.data) {
                const items = response.data.items || []
                // Frontend-only filter: show only active products (treat undefined as active)
                const activeItems = items.filter((p) => p.isActive !== false)
                setProducts(activeItems)
                setTotalPages(response.data.totalPages || 0)
                setTotal(response.data.total || activeItems.length)
            } else {
                setError(response.message || "Không thể tải danh sách sản phẩm")
            }
        } catch (err: any) {
            console.error("Error loading products:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tải danh sách sản phẩm"
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1) // Reset to first page when searching
        loadProducts()
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
                            <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Sản phẩm hàng hải</h1>
                        <p className="text-muted-foreground mt-1">
                            {total > 0 ? `${total} sản phẩm` : "Khám phá các sản phẩm hàng hải chất lượng cao"}
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
                                        placeholder="Tìm kiếm sản phẩm theo tên..."
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
                                            <SelectItem value="name">Tên sản phẩm</SelectItem>
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
                                            <SelectItem value="12">12 sản phẩm</SelectItem>
                                            <SelectItem value="24">24 sản phẩm</SelectItem>
                                            <SelectItem value="48">48 sản phẩm</SelectItem>
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
                {isLoading && products.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Đang tải sản phẩm...</p>
                        </div>
                    </div>
                )}

                {/* Products Grid/List */}
                {!isLoading && products.length > 0 && (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                                            <img
                                                src={product.imageUrl || "/placeholder.svg"}
                                                alt={product.name}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                }}
                                            />
                                            {product.isHasVariant && (
                                                <Badge className="absolute top-2 right-2 bg-primary/90">
                                                    Có biến thể
                                                </Badge>
                                            )}
                                        </div>
                                        <CardHeader>
                                            <div className="space-y-2">
                                                <CardTitle className="text-lg line-clamp-2 min-h-[3rem]">
                                                    {product.name}
                                                </CardTitle>
                                                <Badge variant="outline" className="text-xs">
                                                    {product.categoryName}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {product.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        {product.supplierName}
                                                    </span>
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => navigate(`/products/${product.id}`)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Xem chi tiết
                                                    </Button>
                                                   
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    <img
                                                        src={product.imageUrl || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                        }}
                                                    />
                                                    {product.isHasVariant && (
                                                        <Badge className="absolute top-2 right-2 bg-primary/90 text-xs">
                                                            Có biến thể
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">{product.categoryName}</Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                Bởi {product.supplierName}
                                                            </span>
                                                        </div>
                                                        {product.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/products/${product.id}`)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Xem chi tiết
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => navigate(`/supplier/products`)}
                                                        >
                                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                                            Liên hệ
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
                        <div className="flex items-center justify-center py-6 border-t border-border/50">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1 || isLoading}
                                >
                                    Trước
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages > 0 ? totalPages : 1) }, (_, i) => {
                                    let pageNum: number
                                    const pagesCount = totalPages > 0 ? totalPages : 1
                                    if (pagesCount <= 5) {
                                        pageNum = i + 1
                                    } else if (page <= 3) {
                                        pageNum = i + 1
                                    } else if (page >= pagesCount - 2) {
                                        pageNum = pagesCount - 4 + i
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
                                    disabled={page === (totalPages > 0 ? totalPages : 1) || isLoading}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!isLoading && products.length === 0 && !error && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm nào</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Thử tìm kiếm với từ khóa khác"
                                    : "Hiện tại chưa có sản phẩm nào trong hệ thống"}
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

