"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    MessageSquare,
    Star,
    Search,
    Loader2,
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { getProductReviewsApi } from "@/api/Product/reviewApi"
import { getSupplierProductsApi } from "@/api/Product/supplierProductApi"
import type { Review } from "@/types/Product/review"
import type { Product } from "@/types/Product/supplierProduct"

export default function SupplierReviewsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [error, setError] = useState("")
    const [productSearchTerm, setProductSearchTerm] = useState("")
    const [reviewSearchTerm, setReviewSearchTerm] = useState("")

    // Pagination
    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Load products
    useEffect(() => {
        loadProducts()
    }, [])

    // Load reviews when product is selected
    useEffect(() => {
        if (selectedProductId) {
            loadReviews()
        } else {
            setReviews([])
            setTotal(0)
            setTotalPages(0)
        }
    }, [selectedProductId, page])

    const loadProducts = async () => {
        try {
            setIsLoadingProducts(true)
            setError("")
            const response = await getSupplierProductsApi({
                page: 1,
                size: 100,
                sortBy: 'name',
                isAsc: true
            })

            const data = (response as any)?.data ?? response
            const items = data?.items ?? []
            setProducts(items)

            // Auto-select first product if available
            if (items.length > 0 && !selectedProductId) {
                setSelectedProductId(items[0].id)
            }
        } catch (err: any) {
            console.error("Error loading products:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tải danh sách sản phẩm"
            setError(message)
        } finally {
            setIsLoadingProducts(false)
        }
    }

    const loadReviews = async () => {
        if (!selectedProductId) return

        try {
            setIsLoading(true)
            setError("")
            const response = await getProductReviewsApi(selectedProductId, {
                page,
                size,
                sortBy: 'createdDate',
                isAsc: false
            })

            const data = (response as any)?.data ?? response
            const items = data?.items ?? []

            // Filter by search term if provided (client-side filtering for now)
            // TODO: Implement server-side search if API supports it
            let filteredItems = items
            if (reviewSearchTerm.trim()) {
                filteredItems = items.filter((review: Review) =>
                    review.comment?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
                    review.userName?.toLowerCase().includes(reviewSearchTerm.toLowerCase())
                )
            }

            setReviews(filteredItems)
            setTotal(data?.total ?? 0)
            setTotalPages(data?.totalPages ?? 0)
        } catch (err: any) {
            console.error("Error loading reviews:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tải đánh giá"
            setError(message)
            setReviews([])
            setTotal(0)
            setTotalPages(0)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReviewSearch = () => {
        if (reviewSearchTerm.trim()) {
            // Reload reviews to apply search filter
            loadReviews()
        } else {
            // Reload all reviews
            setPage(1)
            loadReviews()
        }
    }

    const handleProductChange = (productId: string) => {
        setSelectedProductId(productId)
        setPage(1)
        setReviewSearchTerm("")
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                    />
                ))}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                    {rating}/5
                </span>
            </div>
        )
    }

    const selectedProduct = products.find((p) => p.id === selectedProductId)
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
            : 0,
    }))

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/supplier/dashboard">Tổng quan</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Đánh giá & Phản hồi</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <SidebarTrigger />
                        <h1 className="text-3xl font-bold text-foreground">Đánh giá & Phản hồi</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Quản lý đánh giá và phản hồi từ khách hàng</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Product Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Chọn sản phẩm để xem đánh giá
                        </CardTitle>
                        {products.length > 0 && (
                            <Badge variant="outline" className="text-sm">
                                {products.length} sản phẩm
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải sản phẩm...</p>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm để nhận đánh giá từ khách hàng.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Search Products */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products
                                    .filter((product) =>
                                        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                        product.categoryName?.toLowerCase().includes(productSearchTerm.toLowerCase())
                                    )
                                    .map((product) => (
                                        <Card
                                            key={product.id}
                                            className={`cursor-pointer transition-all hover:shadow-lg ${selectedProductId === product.id
                                                    ? "ring-2 ring-primary border-primary"
                                                    : "hover:border-primary/50"
                                                }`}
                                            onClick={() => handleProductChange(product.id)}
                                        >
                                            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                                                <img
                                                    src={product.imageUrl || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                    }}
                                                />
                                                {selectedProductId === product.id && (
                                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                                                            <Star className="h-5 w-5 fill-current" />
                                                        </div>
                                                    </div>
                                                )}
                                                {product.isHasVariant && (
                                                    <Badge className="absolute top-2 right-2 bg-primary/90">
                                                        Có biến thể
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">
                                                    {product.name}
                                                </CardTitle>
                                                <Badge variant="outline" className="text-xs w-fit mt-2">
                                                    {product.categoryName}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(product.createdDate).toLocaleDateString("vi-VN")}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>

                            {/* Selected Product Info */}
                            {selectedProduct && (
                                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={selectedProduct.imageUrl || "/placeholder.svg"}
                                                alt={selectedProduct.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg mb-1">{selectedProduct.name}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline">{selectedProduct.categoryName}</Badge>
                                                {selectedProduct.isHasVariant && (
                                                    <Badge variant="secondary">Có biến thể</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {selectedProduct.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedProductId && (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    {renderStars(Math.round(averageRating))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">5 sao</CardTitle>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {ratingDistribution.find((r) => r.star === 5)?.count || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">4 sao</CardTitle>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {ratingDistribution.find((r) => r.star === 4)?.count || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rating Distribution */}
                    {reviews.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Phân bố đánh giá</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {ratingDistribution.map(({ star, count, percentage }) => (
                                        <div key={star} className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 w-16">
                                                <span className="text-sm font-medium">{star}</span>
                                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground w-20 text-right">
                                                {count} ({percentage.toFixed(0)}%)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Search */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm theo nội dung đánh giá hoặc tên người dùng..."
                                        value={reviewSearchTerm}
                                        onChange={(e) => setReviewSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleReviewSearch()
                                            }
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleReviewSearch} disabled={isLoading}>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Danh sách đánh giá
                                {selectedProduct && (
                                    <Badge variant="outline" className="ml-2">
                                        {selectedProduct.name}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-muted-foreground">Đang tải đánh giá...</p>
                                    </div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {reviewSearchTerm
                                            ? "Không tìm thấy đánh giá nào phù hợp"
                                            : "Chưa có đánh giá nào cho sản phẩm này"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <Card
                                            key={review.id}
                                            className="hover:shadow-md transition-shadow"
                                        >
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                            src={review.userAvatar}
                                                            alt={review.userName || "User"}
                                                        />
                                                        <AvatarFallback>
                                                            {review.userName?.charAt(0)?.toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold">
                                                                        {review.userName || "Người dùng ẩn danh"}
                                                                    </p>
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(review.createdAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                            {review.comment}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <>
                                    <Separator className="my-6" />
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Trang {page} / {totalPages} ({total} đánh giá)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1 || isLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Trước
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPage((p) => Math.min(totalPages, p + 1))
                                                }
                                                disabled={page === totalPages || isLoading}
                                            >
                                                Sau
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

