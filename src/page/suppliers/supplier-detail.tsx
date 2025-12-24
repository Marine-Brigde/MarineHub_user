"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Loader2, MapPin, Phone, Mail } from "lucide-react"
import Header from "@/components/common/header"
import { getSupplierByIdApi, getSupplierProductsByIdApi } from "@/api/Supplier/supplierApi"
import type { Supplier } from "@/types/Supplier/supplier"
import type { Product } from "@/types/Product/product"

export default function SupplierDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [supplier, setSupplier] = useState<Supplier | null>(location.state?.supplier ?? null)
    const [products, setProducts] = useState<Product[]>([])
    const [, setLoadingSupplier] = useState(!location.state?.supplier)
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [page, setPage] = useState(1)
    const [size] = useState(12)
    const [totalPages, setTotalPages] = useState(0)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!id || supplier) return
        const loadSupplier = async () => {
            try {
                setLoadingSupplier(true)
                const res = await getSupplierByIdApi(id)
                setSupplier(res?.data ?? null)
            } catch (err: any) {
                console.error("Failed to load supplier", err)
                setError("Không tìm thấy nhà cung cấp")
            } finally {
                setLoadingSupplier(false)
            }
        }
        loadSupplier()
    }, [id, supplier])

    useEffect(() => {
        if (!id) return
        const loadProducts = async () => {
            try {
                setLoadingProducts(true)
                const res = await getSupplierProductsByIdApi(id, { page, size, sortBy: "createdDate", isAsc: false })
                const data: any = res?.data ?? res
                const items = data?.items ?? []
                // Frontend-only filter: keep active products; treat undefined as active
                const activeItems = items.filter((p: Product) => p.isActive !== false)
                setProducts(activeItems)
                setTotalPages(data?.totalPages ?? 0)
            } catch (err: any) {
                console.error("Failed to load supplier products", err)
                setProducts([])
            } finally {
                setLoadingProducts(false)
            }
        }
        loadProducts()
    }, [id, page, size])

    const formatDate = (val?: string) => (val ? new Date(val).toLocaleDateString("vi-VN") : "N/A")

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/suppliers">Nhà cung cấp</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Chi tiết</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Card className="border-border/60">
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold overflow-hidden">
                                {supplier?.avatarUrl ? (
                                    <img src={supplier.avatarUrl} alt={supplier.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span>{supplier?.name?.charAt(0)?.toUpperCase() || "S"}</span>
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{supplier?.name || "Nhà cung cấp"}</CardTitle>
                                <CardDescription>{supplier?.address || "Địa chỉ đang cập nhật"}</CardDescription>
                                <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {supplier?.phoneNumber || "N/A"}</span>
                                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {supplier?.email || "N/A"}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {supplier?.latitude && supplier?.longitude ? `${supplier.latitude}, ${supplier.longitude}` : ""}</span>
                                    {supplier?.createdDate && (
                                        <Badge variant="outline">Tạo: {formatDate(supplier.createdDate)}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate("/suppliers")}>Quay lại danh sách</Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Sản phẩm của nhà cung cấp</h2>
                        <p className="text-sm text-muted-foreground">Trang {page}{totalPages ? ` / ${totalPages}` : ""}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/products")}>Xem thêm tại trang sản phẩm</Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingProducts ? (
                        <div className="col-span-full flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tải sản phẩm...</div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground">Chưa có sản phẩm</div>
                    ) : (
                        products.map((p) => (
                            <Card key={p.id} className="border-border/60 hover:border-primary/50 transition">
                                <div className="h-40 w-full bg-muted rounded-t-lg overflow-hidden">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                                            Không có ảnh
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground line-clamp-1">{p.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description || ""}</p>
                                    <div className="text-xs text-muted-foreground">Danh mục: {p.categoryName || "N/A"}</div>
                                    <div className="text-xs text-muted-foreground">Ngày tạo: {formatDate(p.createdDate)}</div>
                                    <Button className="w-full" variant="outline" onClick={() => navigate(`/products/${p.id}`)}>
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Trang {page} / {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 1 || loadingProducts} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                                        disabled={loadingProducts}
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}
                            <Button variant="outline" size="sm" disabled={page === totalPages || loadingProducts} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                                Sau
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardContent className="p-4 text-red-600 text-sm">{error}</CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
