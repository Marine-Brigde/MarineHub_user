"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Plus, Edit, Search, Loader2, Eye } from "lucide-react"


import { getCategoriesApi, createCategoryApi, updateCategoryApi } from "@/api/Category/categoryApi"
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/Category/category"
import { Switch } from "../ui/switch"

const shortText = (s?: string, n = 80) => (s && s.length > n ? s.slice(0, n) + "…" : s || "")

const extractError = (err: unknown) => {
    if (!err) return "Lỗi kết nối"
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message || "Lỗi"
    try {
        return JSON.stringify(err)
    } catch {
        return "Lỗi không xác định"
    }
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)

    const [showDialog, setShowDialog] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [toggleLoading, setToggleLoading] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // preview dialog
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const fetchCategories = () => {
        setLoading(true)
        getCategoriesApi({ page: 1, size: 50 })
            .then((res) => {
                // API returns BaseResponse<CategoryListResponse>
                // categoryApi returns response.data already in file — handle both
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const items = (res as any)?.data?.items ?? (res as any)?.items ?? []
                setCategories(items)
            })
            .catch(() => setCategories([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchCategories()
        // cleanup previews on unmount
        return () => {
            if (imagePreview) {
                try {
                    URL.revokeObjectURL(imagePreview)
                    // eslint-disable-next-line no-empty
                } catch { }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openCreate = () => {
        setEditCategory(null)
        setName("")
        setDescription("")
        setImageFile(null)
        if (imagePreview) {
            try {
                URL.revokeObjectURL(imagePreview)
                // eslint-disable-next-line no-empty
            } catch { }
        }
        setImagePreview(null)
        setFormError("")
        setShowDialog(true)
    }

    const openEdit = (c: Category) => {
        setEditCategory(c)
        setName(c.name)
        setDescription(c.description ?? "")
        setImageFile(null)
        if (imagePreview) {
            try {
                URL.revokeObjectURL(imagePreview)
                // eslint-disable-next-line no-empty
            } catch { }
        }
        setImagePreview(c.imageUrl ?? null)
        setFormError("")
        setShowDialog(true)
    }

    const onSelectImage = (f?: File | null) => {
        if (!f) {
            if (imagePreview) {
                try {
                    URL.revokeObjectURL(imagePreview)
                    // eslint-disable-next-line no-empty
                } catch { }
            }
            setImageFile(null)
            setImagePreview(null)
            return
        }
        // revoke previous preview
        if (imagePreview) {
            try {
                URL.revokeObjectURL(imagePreview)
                // eslint-disable-next-line no-empty
            } catch { }
        }
        setImageFile(f)
        const url = URL.createObjectURL(f)
        setImagePreview(url)
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
            setFormError("Tên danh mục không được để trống")
            setFormLoading(false)
            return
        }

        try {
            if (editCategory) {
                const payload: UpdateCategoryRequest = {
                    name: trimmedName,
                    description,
                    image: imageFile ?? undefined,
                }
                await updateCategoryApi(editCategory.id, payload)
            } else {
                const payload: CreateCategoryRequest = {
                    name: trimmedName,
                    description,
                    image: imageFile ?? undefined,
                }
                await createCategoryApi(payload)
            }
            setShowDialog(false)
            setEditCategory(null)
            fetchCategories()
        } catch (err: unknown) {
            setFormError(extractError(err))
        } finally {
            setFormLoading(false)
        }
    }

    // Optimistic toggle: accept optional next boolean from Switch
    const handleToggleActive = async (c: Category, next?: boolean) => {
        setToggleLoading(c.id)

        // optimistic update
        setCategories((prev) =>
            prev.map((p) =>
                p.id === c.id ? { ...p, isActive: typeof next === "boolean" ? next : !p.isActive } : p
            )
        )

        try {
            const payload: UpdateCategoryRequest = {
                isActive: typeof next === "boolean" ? next : !c.isActive,
            }
            await updateCategoryApi(c.id, payload)
            // ensure server state reflected
            fetchCategories()
        } catch {
            // rollback on error
            setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, isActive: c.isActive } : p)))
        } finally {
            setToggleLoading(null)
        }
    }

    const filtered = categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 ">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink>Quản lý</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Danh mục</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Quản lý danh mục</h1>
                    <p className="text-sm text-muted-foreground">Thêm / sửa / bật/tắt danh mục sản phẩm</p>
                </div>
                <Button onClick={openCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm danh mục
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Tổng {filtered.length} danh mục{filtered.length !== categories.length && ` (lọc từ ${categories.length})`}
                </div>
            </div>

            <Card className="border-border/50">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                    <CardTitle>Danh sách danh mục</CardTitle>
                    <CardDescription>Tổng {categories.length} mục</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Tên</TableHead>
                                <TableHead className="w-[30%]">Mô tả</TableHead>
                                <TableHead className="w-[10%]">Ảnh</TableHead>
                                <TableHead className="w-[10%]">Trạng thái</TableHead>
                                <TableHead className="w-[10%] text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        Không có danh mục
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {c.id}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground">{shortText(c.description, 120)}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative h-10 w-10">
                                                {c.imageUrl ? (
                                                    <>
                                                        <img
                                                            src={c.imageUrl || "/placeholder.svg"}
                                                            alt={c.name}
                                                            className="h-10 w-10 object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => openPreview(c.imageUrl)}
                                                            title="Xem ảnh"
                                                            aria-label={`Xem ảnh ${c.name}`}
                                                            className="absolute inset-0 flex items-center justify-center bg-black/30 text-white rounded opacity-0 hover:opacity-100 transition"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="h-10 w-10 bg-muted/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                                                        No
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={c.isActive}
                                                    onCheckedChange={(checked: boolean) => handleToggleActive(c, checked)}
                                                    disabled={toggleLoading === c.id}
                                                />
                                                <span className="text-sm text-muted-foreground">{c.isActive ? "Hoạt động" : "Đóng"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                                                    <Edit className="h-4 w-4" />
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

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[520px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editCategory ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cat-name">Tên danh mục</Label>
                                <Input
                                    id="cat-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên danh mục..."
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cat-desc">Mô tả</Label>
                                <textarea
                                    id="cat-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả ngắn..."
                                    className="w-full rounded border px-3 py-2 text-sm"
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Hình ảnh (tùy chọn)</Label>
                                <div className="flex items-center gap-3">
                                    {/* hidden input + programmatic click to ensure file picker opens reliably */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] ?? null
                                            onSelectImage(f ?? null)
                                        }}
                                        className="hidden"
                                    />
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        Chọn ảnh
                                    </Button>

                                    {imagePreview ? (
                                        <div className="relative h-16 w-16">
                                            <img
                                                src={imagePreview || "/placeholder.svg"}
                                                alt="preview"
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openPreview(imagePreview)}
                                                title="Xem ảnh"
                                                aria-label="Xem ảnh"
                                                className="absolute inset-0 flex items-center justify-center bg-black/30 text-white rounded opacity-0 hover:opacity-100 transition"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 bg-muted/10 rounded flex items-center justify-center text-xs text-muted-foreground">
                                            Chưa có
                                        </div>
                                    )}
                                </div>
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
                            // constrain height to viewport
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
