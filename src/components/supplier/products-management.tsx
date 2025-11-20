"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Search, Loader2, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react"

import { getSupplierProductsApi, createSupplierProductApi, updateSupplierProductApi, deleteSupplierProductApi } from "@/api/Product/supplierProductApi"
import { getCategoriesApi } from "@/api/Category/categoryApi"
import type { Product, CreateProductRequest, UpdateProductRequest, ProductVariant } from "@/types/Product/supplierProduct"
import type { Category } from "@/types/Category/category"

const shortText = (s?: string, n = 80) => (s && s.length > n ? s.slice(0, n) + "…" : s || "")

const extractError = (err: unknown) => {
    if (!err) return "Lỗi kết nối"
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message || "Lỗi"
    try {
        const error = err as any
        // Check for axios error response
        if (error?.response) {
            const status = error.response.status
            const statusText = error.response.statusText
            const data = error.response.data
            
            if (status === 404) {
                return `Endpoint không tồn tại (404). Kiểm tra lại URL: ${error.config?.url || 'unknown'}`
            }
            
            if (data?.message) return data.message
            if (data?.data) return String(data.data)
            return `Lỗi ${status}: ${statusText || 'Unknown error'}`
        }
        if (error?.message) return error.message
        return JSON.stringify(err)
    } catch {
        return "Lỗi không xác định"
    }
}


export default function ProductsManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)
    
    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")

    const [showDialog, setShowDialog] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [price, setPrice] = useState("")
    const [isHasVariant, setIsHasVariant] = useState(false)
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
    const [productImages, setProductImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // preview dialog
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const fetchCategories = () => {
        setCategoriesLoading(true)
        getCategoriesApi({ 
            page: 1, 
            size: 100,
            sortBy: 'name',
            isAsc: true
        })
            .then((res) => {
                const items = (res as any)?.data?.items ?? (res as any)?.items ?? []
                // Chỉ lấy categories đang active
                const activeCategories = items.filter((cat: Category) => cat.isActive)
                setCategories(activeCategories)
            })
            .catch(() => setCategories([]))
            .finally(() => setCategoriesLoading(false))
    }

    const fetchProducts = () => {
        setLoading(true)
        getSupplierProductsApi({ 
            page, 
            size, 
            name: searchTerm || undefined,
            sortBy: 'createdDate',
            isAsc: false
        })
            .then((res) => {
                const data = (res as any)?.data ?? res
                const items = data?.items ?? []
                setProducts(items)
                setTotal(data?.total ?? 0)
                setTotalPages(data?.totalPages ?? 0)
            })
            .catch(() => {
                setProducts([])
                setTotal(0)
                setTotalPages(0)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchProducts()
    }

    const openCreate = () => {
        setEditProduct(null)
        setName("")
        setDescription("")
        setCategoryId("")
        setPrice("")
        setIsHasVariant(false)
        setProductVariants([])
        setProductImages([])
        cleanupImagePreviews()
        setImagePreviews([])
        setFormError("")
        setShowDialog(true)
    }

    const openEdit = (p: Product) => {
        setEditProduct(p)
        setName(p.name)
        setDescription(p.description ?? "")
        setCategoryId(p.categoryId)
        setPrice("") // Price sẽ cần lấy từ API detail nếu có
        setIsHasVariant(p.isHasVariant)
        setProductVariants([]) // Variants sẽ cần lấy từ API detail nếu có
        setProductImages([])
        cleanupImagePreviews()
        setImagePreviews(p.imageUrl ? [p.imageUrl] : [])
        setFormError("")
        setShowDialog(true)
    }

    const cleanupImagePreviews = () => {
        imagePreviews.forEach((url) => {
            try {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            } catch {
                // Ignore
            }
        })
    }

    const onSelectImages = (files: FileList | null) => {
        if (!files || files.length === 0) return

        const newFiles: File[] = []
        const newPreviews: string[] = []

        Array.from(files).forEach((file) => {
            newFiles.push(file)
            newPreviews.push(URL.createObjectURL(file))
        })

        setProductImages((prev) => [...prev, ...newFiles])
        setImagePreviews((prev) => [...prev, ...newPreviews])
    }

    const removeImage = (index: number) => {
        const preview = imagePreviews[index]
        if (preview.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(preview)
            } catch {
                // Ignore
            }
        }
        setImagePreviews((prev) => prev.filter((_, i) => i !== index))
        setProductImages((prev) => prev.filter((_, i) => i !== index))
    }

    const addVariant = () => {
        setProductVariants((prev) => [...prev, { name: "", price: 0 }])
    }

    const removeVariant = (index: number) => {
        setProductVariants((prev) => prev.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
        setProductVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        )
    }

    const openPreview = (url?: string | null) => {
        if (!url) return
        setPreviewUrl(url)
        setPreviewOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)

        const trimmedName = name.trim()
        if (!trimmedName) {
            setFormError("Tên sản phẩm không được để trống")
            setFormLoading(false)
            return
        }

        if (!categoryId) {
            setFormError("Vui lòng chọn danh mục")
            setFormLoading(false)
            return
        }

        const priceNum = parseFloat(price)
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            setFormError("Giá sản phẩm phải là số dương")
            setFormLoading(false)
            return
        }

        if (isHasVariant) {
            if (productVariants.length === 0) {
                setFormError("Sản phẩm có biến thể phải có ít nhất một biến thể")
                setFormLoading(false)
                return
            }

            // Validate variants
            for (const variant of productVariants) {
                if (!variant.name.trim()) {
                    setFormError("Tên biến thể không được để trống")
                    setFormLoading(false)
                    return
                }
                if (variant.price <= 0) {
                    setFormError("Giá biến thể phải là số dương")
                    setFormLoading(false)
                    return
                }
            }
        }

        if (productImages.length === 0 && !editProduct) {
            setFormError("Vui lòng chọn ít nhất một hình ảnh")
            setFormLoading(false)
            return
        }

        try {
            if (editProduct) {
                const payload: UpdateProductRequest = {
                    name: trimmedName,
                    description,
                    categoryId,
                    price: priceNum,
                    isHasVariant,
                    productVariants: isHasVariant ? productVariants : undefined,
                    productImages: productImages.length > 0 ? productImages : undefined,
                }
                await updateSupplierProductApi(editProduct.id, payload)
            } else {
                const payload: CreateProductRequest = {
                    name: trimmedName,
                    description,
                    categoryId,
                    price: priceNum,
                    isHasVariant,
                    productVariants: isHasVariant ? productVariants : [],
                    productImages,
                }
                await createSupplierProductApi(payload)
            }
            setShowDialog(false)
            setEditProduct(null)
            fetchProducts()
        } catch (err: unknown) {
            console.error('Error creating/updating product:', err)
            const errorMessage = extractError(err)
            setFormError(errorMessage || "Có lỗi xảy ra khi lưu sản phẩm")
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return

        try {
            await deleteSupplierProductApi(id)
            fetchProducts()
        } catch (err: unknown) {
            alert(extractError(err))
        }
    }

    useEffect(() => {
        return () => {
            cleanupImagePreviews()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/supplier/dashboard">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý sản phẩm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Quản lý sản phẩm</h1>
                    <p className="text-sm text-muted-foreground">Thêm / sửa / xóa sản phẩm</p>
                </div>
                <Button onClick={openCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button type="submit" variant="outline" className="w-full md:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Tìm kiếm
                </Button>
            </form>

            <Card className="border-border/50">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>Tổng {total} sản phẩm</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Sản phẩm</TableHead>
                                <TableHead className="w-[20%]">Danh mục</TableHead>
                                <TableHead className="w-[15%]">Hình ảnh</TableHead>
                                <TableHead className="w-[15%]">Biến thể</TableHead>
                                <TableHead className="w-[10%]">Ngày tạo</TableHead>
                                <TableHead className="w-[10%] text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        Không có sản phẩm
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">{p.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {p.id}</p>
                                                {p.description && (
                                                    <p className="text-xs text-muted-foreground">{shortText(p.description, 60)}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{p.categoryName}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative h-10 w-10">
                                                {p.imageUrl ? (
                                                    <>
                                                        <img
                                                            src={p.imageUrl || "/placeholder.svg"}
                                                            alt={p.name}
                                                            className="h-10 w-10 object-cover rounded cursor-pointer"
                                                            onClick={() => openPreview(p.imageUrl)}
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="h-10 w-10 bg-muted/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                                                        No
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={p.isHasVariant ? "default" : "secondary"}>
                                                {p.isHasVariant ? "Có biến thể" : "Không có biến thể"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(p.createdDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Sau
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="product-name">Tên sản phẩm *</Label>
                                <Input
                                    id="product-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên sản phẩm..."
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product-desc">Mô tả</Label>
                                <Textarea
                                    id="product-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả sản phẩm..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product-category">Danh mục *</Label>
                                <Select value={categoryId} onValueChange={setCategoryId} required>
                                    <SelectTrigger id="product-category">
                                        <SelectValue placeholder="Chọn danh mục..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriesLoading ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                                Đang tải danh mục...
                                            </div>
                                        ) : categories.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                Không có danh mục
                                            </div>
                                        ) : (
                                            categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product-price">Giá sản phẩm (VND) *</Label>
                                <Input
                                    id="product-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Nhập giá sản phẩm..."
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={isHasVariant}
                                    onCheckedChange={(checked) => {
                                        setIsHasVariant(checked)
                                        // Tự động thêm 1 biến thể mặc định khi bật switch
                                        if (checked && productVariants.length === 0) {
                                            setProductVariants([{ name: "", price: 0 }])
                                        } else if (!checked) {
                                            // Xóa tất cả biến thể khi tắt switch
                                            setProductVariants([])
                                        }
                                    }}
                                />
                                <Label>Sản phẩm có biến thể</Label>
                            </div>

                            {isHasVariant && (
                                <div className="grid gap-3 p-4 border rounded-md">
                                    <div className="flex items-center justify-between">
                                        <Label>Biến thể sản phẩm *</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Thêm biến thể
                                        </Button>
                                    </div>
                                    {productVariants.map((variant, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 border rounded-md bg-muted/20">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 grid gap-2">
                                                <Label>Tên biến thể {index + 1}</Label>
                                                <Input
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                    placeholder="Nhập tên biến thể..."
                                                />
                                            </div>
                                            <div className="flex-1 grid gap-2">
                                                <Label>Giá (VND) {index + 1}</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                                    placeholder="Nhập giá biến thể..."
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeVariant(index)}
                                                className="flex-shrink-0"
                                                title="Xóa biến thể"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {productVariants.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Chưa có biến thể. Vui lòng thêm ít nhất một biến thể.</p>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Hình ảnh sản phẩm *</Label>
                                <div className="flex flex-wrap gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative h-24 w-24">
                                            <img
                                                src={preview || "/placeholder.svg"}
                                                alt={`Preview ${index + 1}`}
                                                className="h-24 w-24 object-cover rounded cursor-pointer"
                                                onClick={() => openPreview(preview)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="h-24 w-24 border-2 border-dashed rounded flex items-center justify-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => onSelectImages(e.target.files)}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Có thể chọn nhiều hình ảnh</p>
                            </div>

                            {formError && (
                                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                                    {formError}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={formLoading}>
                                Huỷ
                            </Button>
                            <Button type="submit" disabled={formLoading}>
                                {formLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    "Lưu"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image preview dialog */}
            <Dialog
                open={previewOpen}
                onOpenChange={(open) => {
                    if (!open) setPreviewUrl(null)
                    setPreviewOpen(open)
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Xem ảnh</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-4">
                        {previewUrl ? (
                            <img src={previewUrl || "/placeholder.svg"} alt="preview-full" className="max-h-[70vh] w-auto rounded" />
                        ) : (
                            <div className="text-sm text-muted-foreground">Không có ảnh</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
