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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Search, Loader2, Trash2, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { getSupplierProductsApi, createSupplierProductApi, updateSupplierProductApi, deleteSupplierProductApi, restoreSupplierProductApi } from "@/api/Product/supplierProductApi"
import { getProductByIdApi, createProductVariantApi, updateProductVariantApi, deleteProductVariantApi } from '@/api/Product/productApi'
import { getCategoriesApi } from "@/api/Category/categoryApi"
import type { Product, CreateProductRequest, UpdateProductRequest, ProductVariant } from "@/types/Product/supplierProduct"
import type { Category } from "@/types/Category/category"
import { getModifierGroupsApi, getModifierGroupByIdApi } from "@/api/ModifierGroup/modifierGroupApi"
import type { ModifierGroup, ModifierOption } from "@/types/Modifier/modifier"

const shortText = (s?: string, n = 80) => (s && s.length > n ? s.slice(0, n) + "…" : s || "")

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

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
    const { toast } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)

    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [showDeleted, setShowDeleted] = useState(false)

    const [showDialog, setShowDialog] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; type: 'delete' | 'restore' } | null>(null)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [price, setPrice] = useState("")
    const [isHasVariant, setIsHasVariant] = useState(false)
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
    const [originalVariants, setOriginalVariants] = useState<ProductVariant[]>([]) // Track original data
    const [variantModifierDetails, setVariantModifierDetails] = useState<Record<string, any[]>>({}) // Store modifier details per variant
    // For non-variant products, collect modifier option ids at top-level
    const [modifierOptionIds, setModifierOptionIds] = useState<string[]>([])
    const [productImages, setProductImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // Modifier groups + options for name-based selection
    const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
    const [groupOptionsMap, setGroupOptionsMap] = useState<Record<string, ModifierOption[]>>({})
    const [modifierLoading, setModifierLoading] = useState(false)

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
            isAsc: false,
        })
            .then((res) => {
                const data = (res as any)?.data ?? res
                let items = data?.items ?? []

                // Filter trên frontend
                if (showDeleted) {
                    items = items.filter((p: Product) => p.isActive === false)
                } else {
                    items = items.filter((p: Product) => p.isActive !== false)
                }

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
        // Fetch modifier groups and their options
        const loadModifierData = async () => {
            try {
                setModifierLoading(true)
                const res = await getModifierGroupsApi({ page: 1, size: 100, sortBy: 'name', isAsc: true })
                const data = (res as any)?.data ?? res
                const groups: ModifierGroup[] = data?.items ?? []
                setModifierGroups(groups)
                const optionsMap: Record<string, ModifierOption[]> = {}
                // Load options per group
                for (const g of groups) {
                    try {
                        const detail = await getModifierGroupByIdApi(g.id!)
                        const groupData = (detail as any)?.data ?? detail?.data
                        // API returns `modifierOptions` array on detail
                        optionsMap[g.id!] = groupData?.modifierOptions ?? []
                    } catch {
                        optionsMap[g.id!] = []
                    }
                }
                setGroupOptionsMap(optionsMap)
            } catch {
                setModifierGroups([])
                setGroupOptionsMap({})
            } finally {
                setModifierLoading(false)
            }
        }
        loadModifierData()
    }, [])

    useEffect(() => {
        fetchProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, showDeleted])

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
        setOriginalVariants([])
        setVariantModifierDetails({})
        setProductImages([])
        cleanupImagePreviews()
        setImagePreviews([])
        setFormError("")
        setShowDialog(true)
    }

    const openEdit = async (p: Product) => {
        setEditProduct(p)
        setName(p.name)
        setDescription(p.description ?? "")
        setCategoryId(p.categoryId)
        setIsHasVariant(p.isHasVariant)
        setProductImages([])
        cleanupImagePreviews()
        setImagePreviews(p.imageUrl ? [p.imageUrl] : [])
        setFormError("")

        // Fetch product detail to populate price and variants
        try {
            const res = await getProductByIdApi(p.id)
            const detail = (res as any)?.data
            if (detail) {
                // If product has variants, map them to supplier ProductVariant type
                if (Array.isArray(detail.productVariants) && detail.productVariants.length > 0 && p.isHasVariant) {
                    // Filter to only include active variants (isActive === true)
                    const activeVariants = detail.productVariants.filter((v: any) => v.isActive !== false)
                    const modifierDetailsMap: Record<string, any[]> = {}

                    const mapped = activeVariants.map((v: any) => {
                        // Extract modifierOptionIds from nested modifierGroups structure
                        let modifierOptionIds: string[] = []
                        if (Array.isArray(v.modifierGroups)) {
                            // Store the full modifier groups details for display
                            modifierDetailsMap[v.id] = v.modifierGroups

                            modifierOptionIds = v.modifierGroups.flatMap((group: any) =>
                                Array.isArray(group.modifierOptions)
                                    ? group.modifierOptions.map((opt: any) => opt.id)
                                    : []
                            )
                        } else if (Array.isArray(v.modifierOptionIds)) {
                            modifierOptionIds = v.modifierOptionIds
                        }

                        return {
                            id: v.id,
                            name: v.name || '',
                            price: Number(v.price || 0),
                            modifierOptionIds,
                        }
                    })
                    setProductVariants(mapped)
                    setOriginalVariants(JSON.parse(JSON.stringify(mapped))) // Deep clone for comparison
                    setVariantModifierDetails(modifierDetailsMap)
                    setPrice('')
                } else {
                    // No variants: use product-level price if available
                    const priceVal = detail.productVariants && detail.productVariants.length > 0 ? detail.productVariants[0].price : detail.price ?? (detail.productVariants && detail.productVariants[0]?.price)
                    setPrice(priceVal !== undefined ? String(priceVal) : '')
                    setProductVariants([])
                }
            } else {
                setPrice("")
                setProductVariants([])
            }
        } catch (err) {
            console.error('Failed to load product detail for edit', err)
            setPrice("")
            setProductVariants([])
        }

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
        setProductVariants((prev) => [...prev, { name: "", price: 0, modifierOptionIds: [] }])
    }

    const removeVariant = async (index: number) => {
        const variant = productVariants[index]

        // Check if there are enough active variants (minimum 2 required)
        const activeVariants = productVariants.filter((v) => v.name.trim() !== "")
        if (activeVariants.length <= 1) {
            toast({
                title: "Không thể xóa",
                description: "Sản phẩm phải có ít nhất 1 biến thể",
                variant: "destructive",
            })
            return
        }

        // If variant has id (existing variant), call API to set isActive = false
        if (variant.id && editProduct) {
            try {
                await deleteProductVariantApi(variant.id)
                toast({
                    title: "Thành công",
                    description: "Đã xóa biến thể",
                    variant: "success",
                })
                // Remove from UI
                setProductVariants((prev) => prev.filter((_, i) => i !== index))
            } catch (err) {
                toast({
                    title: "Lỗi",
                    description: extractError(err),
                    variant: "destructive",
                })
            }
        } else {
            // New variant (no id yet), just remove from UI
            setProductVariants((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
        setProductVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        )
    }
    const updateVariantModifierIds = (index: number, ids: string[]) => {
        setProductVariants((prev) => prev.map((v, i) => (i === index ? { ...v, modifierOptionIds: ids } : v)))
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

        // Validate price: required only if NOT creating with variants
        const priceNum = parseFloat(price)
        if (!isHasVariant) {
            // No variants: price is required
            if (!price || isNaN(priceNum) || priceNum <= 0) {
                setFormError("Giá sản phẩm phải là số dương")
                setFormLoading(false)
                return
            }
        } else {
            // Has variants: price is optional, but if provided must be valid
            if (price && (isNaN(priceNum) || priceNum <= 0)) {
                setFormError("Giá sản phẩm phải là số dương")
                setFormLoading(false)
                return
            }
        }

        let validVariants: ProductVariant[] = []
        if (isHasVariant) {
            // Filter out empty variants (those with empty name)
            validVariants = productVariants.filter((v) => v.name.trim() !== "")

            if (validVariants.length === 0) {
                setFormError("Sản phẩm có biến thể phải có ít nhất một biến thể (không rỗng)")
                setFormLoading(false)
                return
            }

            // Validate non-empty variants
            for (const variant of validVariants) {
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
                    price: isHasVariant ? undefined : (price ? priceNum : undefined),
                    isHasVariant,
                    // Variants are handled via dedicated APIs below
                    modifierOptionIds: !isHasVariant ? modifierOptionIds : undefined,
                    productImages: productImages.length > 0 ? productImages : undefined,
                }

                await updateSupplierProductApi(editProduct.id, payload)

                if (isHasVariant) {
                    const existingVariants = validVariants.filter((v) => v.id)
                    const newVariants = validVariants.filter((v) => !v.id)

                    // Only update variants that have changed
                    if (existingVariants.length > 0) {
                        const changedVariants = existingVariants.filter((v) => {
                            const original = originalVariants.find((o) => o.id === v.id)
                            if (!original) return true // New variant with id (shouldn't happen)

                            // Check if any field changed
                            const nameChanged = v.name.trim() !== original.name.trim()
                            const priceChanged = v.price !== original.price
                            const modifiersChanged = JSON.stringify(v.modifierOptionIds?.sort()) !== JSON.stringify(original.modifierOptionIds?.sort())

                            return nameChanged || priceChanged || modifiersChanged
                        })

                        if (changedVariants.length > 0) {
                            await Promise.all(
                                changedVariants.map((v) =>
                                    updateProductVariantApi(v.id!, {
                                        name: v.name.trim(),
                                        price: v.price,
                                        modifierOptionIds: v.modifierOptionIds && v.modifierOptionIds.length > 0 ? v.modifierOptionIds : undefined,
                                    })
                                )
                            )
                        }
                    }

                    if (newVariants.length > 0) {
                        await Promise.all(
                            newVariants.map((v) =>
                                createProductVariantApi(editProduct.id, {
                                    name: v.name.trim(),
                                    price: v.price,
                                    modifierOptionIds: v.modifierOptionIds && v.modifierOptionIds.length > 0 ? v.modifierOptionIds : undefined,
                                })
                            )
                        )
                    }
                }
            } else {
                const payload: CreateProductRequest = {
                    name: trimmedName,
                    description,
                    categoryId,
                    price: isHasVariant ? null : priceNum,
                    isHasVariant,
                    productVariants: isHasVariant ? validVariants : [],
                    modifierOptionIds: !isHasVariant ? modifierOptionIds : undefined,
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

    const executeConfirmAction = async () => {
        if (!confirmAction) return
        setConfirmLoading(true)
        try {
            if (confirmAction.type === 'delete') {
                await deleteSupplierProductApi(confirmAction.id)
                toast({
                    title: "Thành công",
                    description: "Xóa sản phẩm thành công",
                    variant: "success",
                })
            } else {
                await restoreSupplierProductApi(confirmAction.id)
                toast({
                    title: "Thành công",
                    description: "Mở lại sản phẩm thành công",
                    variant: "success",
                })
            }
            fetchProducts()
        } catch (err: unknown) {
            toast({
                title: "Lỗi",
                description: extractError(err),
                variant: "destructive",
            })
        } finally {
            setConfirmLoading(false)
            setConfirmAction(null)
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
                <Button
                    variant={showDeleted ? "default" : "outline"}
                    className="w-full md:w-auto"
                    onClick={() => setShowDeleted(!showDeleted)}
                >
                    {showDeleted ? "Ẩn sản phẩm đã xóa" : "Hiện sản phẩm đã xóa"}
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
                                                <p className="text-xs text-muted-foreground font-mono">ID: {getShortId(p.id)}</p>
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
                                                {!showDeleted && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setConfirmAction({ id: p.id, name: p.name, type: 'delete' })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {showDeleted && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setConfirmAction({ id: p.id, name: p.name, type: 'restore' })}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
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

                            {!isHasVariant && (
                                <div className="grid gap-3">
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
                                            required={!editProduct && !isHasVariant}
                                        />
                                    </div>
                                    {/* Name-based selection for Modifier Options when no variants */}
                                    <div className="grid gap-2">
                                        <Label>Chọn tuỳ chọn (theo tên)</Label>
                                        {modifierLoading ? (
                                            <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải tuỳ chọn...
                                            </div>
                                        ) : modifierGroups.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Không có nhóm tuỳ chọn</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {modifierGroups.map((g) => (
                                                    <div key={g.id} className="border rounded p-2">
                                                        <p className="text-sm font-medium">{g.name}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {(groupOptionsMap[g.id!] ?? []).map((opt) => {
                                                                const checked = modifierOptionIds.includes(opt.id!)
                                                                return (
                                                                    <label key={opt.id} className="flex items-center gap-2 border rounded px-2 py-1 text-sm">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) => {
                                                                                const id = opt.id!
                                                                                setModifierOptionIds((prev) => {
                                                                                    if (e.target.checked) return [...prev, id]
                                                                                    return prev.filter((x) => x !== id)
                                                                                })
                                                                            }}
                                                                        />
                                                                        <span>{opt.name}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                            {(groupOptionsMap[g.id!] ?? []).length === 0 && (
                                                                <p className="text-xs text-muted-foreground">Nhóm chưa có tuỳ chọn</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isHasVariant && (
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={isHasVariant}
                                        onCheckedChange={(checked) => {
                                            setIsHasVariant(checked)
                                            // Chỉ xóa tất cả biến thể khi tắt switch, không tạo variant rỗng
                                            if (!checked) {
                                                setProductVariants([])
                                            }
                                        }}
                                    />
                                    <Label>Sản phẩm có biến thể</Label>
                                </div>
                            )}

                            {isHasVariant && (
                                <div className="space-y-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={isHasVariant}
                                            onCheckedChange={(checked) => {
                                                setIsHasVariant(checked)
                                                if (!checked) {
                                                    setProductVariants([])
                                                }
                                            }}
                                        />
                                        <Label>Sản phẩm có biến thể</Label>
                                    </div>
                                    <div className="grid gap-3 p-4 border rounded-md bg-background">
                                        <div className="flex items-center justify-between">
                                            <Label>Biến thể sản phẩm *</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Thêm biến thể
                                            </Button>
                                        </div>
                                        {productVariants.map((variant, index) => (
                                            <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
                                                <div className="flex gap-2 items-end">
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
                                                {/* Modifier options for variant */}
                                                <div className="grid gap-2">
                                                    {variant.id ? (
                                                        // Existing variant: show selected options as badges (readonly)
                                                        <>
                                                            <Label>Tuỳ chọn đã chọn (Chỉ xem)</Label>
                                                            {variantModifierDetails[variant.id] && variantModifierDetails[variant.id].length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {variantModifierDetails[variant.id].map((group: any) => (
                                                                        <div key={group.id} className="border rounded p-2 bg-muted/20">
                                                                            <p className="text-sm font-medium mb-2">{group.name}</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {Array.isArray(group.modifierOptions) && group.modifierOptions.map((opt: any) => (
                                                                                    <Badge key={opt.id} variant="secondary" className="text-xs">
                                                                                        {opt.name}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">Không có tuỳ chọn nào</p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        // New variant: allow selection
                                                        <>
                                                            <Label>Tuỳ chọn cho biến thể {index + 1}</Label>
                                                            {modifierLoading ? (
                                                                <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải tuỳ chọn...
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {modifierGroups.map((g) => (
                                                                        <div key={g.id} className="border rounded p-2">
                                                                            <p className="text-sm font-medium">{g.name}</p>
                                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                                {(groupOptionsMap[g.id!] ?? []).map((opt) => {
                                                                                    const ids = variant.modifierOptionIds ?? []
                                                                                    const checked = ids.includes(opt.id!)
                                                                                    return (
                                                                                        <label key={opt.id} className="flex items-center gap-2 border rounded px-2 py-1 text-sm cursor-pointer hover:bg-muted/50">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={checked}
                                                                                                onChange={(e) => {
                                                                                                    const id = opt.id!
                                                                                                    const next = e.target.checked
                                                                                                        ? [...ids, id]
                                                                                                        : ids.filter((x) => x !== id)
                                                                                                    updateVariantModifierIds(index, next)
                                                                                                }}
                                                                                            />
                                                                                            <span>{opt.name}</span>
                                                                                        </label>
                                                                                    )
                                                                                })}
                                                                                {(groupOptionsMap[g.id!] ?? []).length === 0 && (
                                                                                    <p className="text-xs text-muted-foreground">Nhóm chưa có tuỳ chọn</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {productVariants.length === 0 && (
                                            <p className="text-sm text-muted-foreground">Chưa có biến thể. Vui lòng thêm ít nhất một biến thể.</p>
                                        )}
                                    </div>
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
                    </form >
                </DialogContent >
            </Dialog >

            {/* Image preview dialog */}
            < Dialog
                open={previewOpen}
                onOpenChange={(open) => {
                    if (!open) setPreviewUrl(null)
                    setPreviewOpen(open)
                }
                }
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
            </Dialog >

            {/* Confirm delete/restore */}
            < AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && !confirmLoading && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'delete' ? 'Xóa sản phẩm?' : 'Mở lại sản phẩm?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'delete'
                                ? `Bạn có chắc chắn muốn xóa sản phẩm "${confirmAction?.name || ''}"?`
                                : `Bạn có chắc chắn muốn mở lại sản phẩm "${confirmAction?.name || ''}"?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={confirmLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={executeConfirmAction} disabled={confirmLoading}>
                            {confirmLoading ? (
                                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</span>
                            ) : confirmAction?.type === 'delete' ? (
                                'Xóa'
                            ) : (
                                'Mở lại'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >
        </div >
    )
}
