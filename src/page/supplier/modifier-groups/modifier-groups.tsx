"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Search, Loader2, X, ChevronLeft, ChevronRight, GripVertical, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import {
    getModifierGroupsApi,
    createModifierGroupApi,
    getModifierGroupByIdApi,
    updateModifierGroupApi,
    addModifierOptionToGroupApi,
} from "@/api/ModifierGroup/modifierGroupApi"
import { updateModifierOptionApi } from "@/api/ModifierOption/modifierOptionApi"
import type { ModifierGroup, ModifierOption } from "@/types/Modifier/modifier"

const extractError = (err: unknown) => {
    if (!err) return "Lỗi kết nối"
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message || "Lỗi"
    try {
        const error = err as any
        if (error?.response?.data?.message) return error.response.data.message
        if (error?.response?.data?.data) return String(error.response.data.data)
        if (error?.message) return error.message
        return JSON.stringify(err)
    } catch {
        return "Lỗi không xác định"
    }
}

export default function ModifierGroupsManagement() {
    const { toast } = useToast()
    const [groups, setGroups] = useState<ModifierGroup[]>([])
    const [loading, setLoading] = useState(false)

    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")

    // Create/Edit Group Dialog
    const [showGroupDialog, setShowGroupDialog] = useState(false)
    const [editGroup, setEditGroup] = useState<ModifierGroup | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const [groupName, setGroupName] = useState("")
    const [groupOptions, setGroupOptions] = useState<{ name: string; displayOrder: number }[]>([])

    // Manage Options Dialog
    const [showOptionsDialog, setShowOptionsDialog] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(null)
    const [groupOptionsData, setGroupOptionsData] = useState<ModifierOption[]>([])
    const [optionsLoading, setOptionsLoading] = useState(false)

    // Add/Edit Option Dialog
    const [showOptionDialog, setShowOptionDialog] = useState(false)
    const [editOption, setEditOption] = useState<ModifierOption | null>(null)
    const [optionName, setOptionName] = useState("")
    const [optionDisplayOrder, setOptionDisplayOrder] = useState("")
    const [optionFormLoading, setOptionFormLoading] = useState(false)
    const [optionFormError, setOptionFormError] = useState("")

    const fetchGroups = () => {
        setLoading(true)
        getModifierGroupsApi({
            page,
            size,
            name: searchTerm || undefined,
            sortBy: 'createdDate',
            isAsc: false
        })
            .then((res) => {
                const items = res.data?.items ?? []
                setGroups(items)
                setTotal(res.data?.total ?? 0)
                setTotalPages(res.data?.totalPages ?? 0)
            })
            .catch((err) => {
                console.error('Failed to fetch groups:', err)
                setGroups([])
                setTotal(0)
                setTotalPages(0)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchGroups()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchGroups()
    }

    const openCreateGroup = () => {
        setEditGroup(null)
        setGroupName("")
        setGroupOptions([{ name: "", displayOrder: 1 }])
        setFormError("")
        setShowGroupDialog(true)
    }

    const openEditGroup = async (group: ModifierGroup) => {
        setEditGroup(group)
        setGroupName(group.name)
        setGroupOptions([])
        setFormError("")
        setShowGroupDialog(true)
    }

    const addOptionField = () => {
        const nextOrder = groupOptions.length + 1
        setGroupOptions((prev) => [...prev, { name: "", displayOrder: nextOrder }])
    }

    const removeOptionField = (index: number) => {
        setGroupOptions((prev) => prev.filter((_, i) => i !== index))
    }

    const updateOptionField = (index: number, field: 'name' | 'displayOrder', value: string | number) => {
        setGroupOptions((prev) =>
            prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
        )
    }

    const handleSubmitGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)

        const trimmedName = groupName.trim()
        if (!trimmedName) {
            setFormError("Tên nhóm không được để trống")
            setFormLoading(false)
            return
        }

        try {
            if (editGroup) {
                // Update existing group (only name)
                await updateModifierGroupApi(editGroup.id!, { name: trimmedName })
                toast({
                    title: "Thành công",
                    description: "Cập nhật nhóm thành công",
                    variant: "success",
                })
            } else {
                // Create new group with options
                if (groupOptions.length === 0) {
                    setFormError("Vui lòng thêm ít nhất một tùy chọn")
                    setFormLoading(false)
                    return
                }

                for (const opt of groupOptions) {
                    if (!opt.name.trim()) {
                        setFormError("Tên tùy chọn không được để trống")
                        setFormLoading(false)
                        return
                    }
                }

                await createModifierGroupApi({
                    name: trimmedName,
                    modifierOptions: groupOptions
                })
                toast({
                    title: "Thành công",
                    description: "Tạo nhóm thành công",
                    variant: "success",
                })
            }
            setShowGroupDialog(false)
            setEditGroup(null)
            fetchGroups()
        } catch (err: unknown) {
            console.error('Error saving group:', err)
            setFormError(extractError(err))
        } finally {
            setFormLoading(false)
        }
    }

    const openManageOptions = async (group: ModifierGroup) => {
        setSelectedGroup(group)
        setShowOptionsDialog(true)
        setOptionsLoading(true)

        try {
            const res = await getModifierGroupByIdApi(group.id!)
            setGroupOptionsData(res.data?.modifierOptions ?? [])
        } catch (err) {
            console.error('Failed to load options:', err)
            toast({
                title: "Lỗi",
                description: extractError(err),
                variant: "destructive",
            })
            setGroupOptionsData([])
        } finally {
            setOptionsLoading(false)
        }
    }

    const openAddOption = () => {
        setEditOption(null)
        setOptionName("")
        const nextOrder = groupOptionsData.length + 1
        setOptionDisplayOrder(String(nextOrder))
        setOptionFormError("")
        setShowOptionDialog(true)
    }

    const openEditOption = (option: ModifierOption) => {
        setEditOption(option)
        setOptionName(option.name)
        setOptionDisplayOrder(String(option.displayOrder))
        setOptionFormError("")
        setShowOptionDialog(true)
    }

    const handleSubmitOption = async (e: React.FormEvent) => {
        e.preventDefault()
        setOptionFormError("")
        setOptionFormLoading(true)

        const trimmedName = optionName.trim()
        if (!trimmedName) {
            setOptionFormError("Tên tùy chọn không được để trống")
            setOptionFormLoading(false)
            return
        }

        const order = parseInt(optionDisplayOrder)
        if (isNaN(order) || order < 1) {
            setOptionFormError("Thứ tự hiển thị phải là số dương")
            setOptionFormLoading(false)
            return
        }

        try {
            if (editOption) {
                // Update existing option
                await updateModifierOptionApi(editOption.id!, {
                    name: trimmedName,
                    displayOrder: order
                })
                toast({
                    title: "Thành công",
                    description: "Cập nhật tùy chọn thành công",
                    variant: "success",
                })
            } else {
                // Add new option to group
                if (!selectedGroup?.id) {
                    setOptionFormError("Không tìm thấy nhóm")
                    setOptionFormLoading(false)
                    return
                }
                await addModifierOptionToGroupApi(selectedGroup.id, {
                    name: trimmedName,
                    displayOrder: order
                })
                toast({
                    title: "Thành công",
                    description: "Thêm tùy chọn thành công",
                    variant: "success",
                })
            }
            setShowOptionDialog(false)
            setEditOption(null)
            // Reload options
            if (selectedGroup?.id) {
                const res = await getModifierGroupByIdApi(selectedGroup.id)
                setGroupOptionsData(res.data?.modifierOptions ?? [])
            }
        } catch (err: unknown) {
            console.error('Error saving option:', err)
            setOptionFormError(extractError(err))
        } finally {
            setOptionFormLoading(false)
        }
    }

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
                            <BreadcrumbPage>Quản lý Modifier Groups</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Quản lý Modifier Groups</h1>
                    <p className="text-sm text-muted-foreground">Tạo và quản lý nhóm tùy chọn cho sản phẩm</p>
                </div>
                <Button onClick={openCreateGroup} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm nhóm mới
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Tìm kiếm nhóm..."
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
                    <CardTitle>Danh sách Modifier Groups</CardTitle>
                    <CardDescription>Tổng {total} nhóm</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Tên nhóm</TableHead>
                                <TableHead className="w-[25%]">Ngày tạo</TableHead>
                                <TableHead className="w-[25%] text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : groups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center">
                                        Không có nhóm nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groups.map((group) => (
                                    <TableRow key={group.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Settings2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-base">{group.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground">
                                                {group.createdDate ? new Date(group.createdDate).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="default" onClick={() => openManageOptions(group)}>
                                                    <GripVertical className="h-4 w-4 mr-1" />
                                                    Quản lý tùy chọn
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openEditGroup(group)}>
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

            {/* Create/Edit Group Dialog */}
            <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmitGroup}>
                        <DialogHeader>
                            <DialogTitle>{editGroup ? "Sửa nhóm" : "Thêm nhóm mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="group-name">Tên nhóm *</Label>
                                <Input
                                    id="group-name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Ví dụ: Kích thước, Màu sắc..."
                                    required
                                />
                            </div>

                            {!editGroup && (
                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Tùy chọn *</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addOptionField}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Thêm tùy chọn
                                        </Button>
                                    </div>
                                    {groupOptions.map((option, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 border rounded-md bg-muted/20">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 grid gap-2">
                                                <Label>Tên tùy chọn</Label>
                                                <Input
                                                    value={option.name}
                                                    onChange={(e) => updateOptionField(index, 'name', e.target.value)}
                                                    placeholder="Ví dụ: Nhỏ, Vừa, Lớn..."
                                                />
                                            </div>
                                            <div className="w-24 grid gap-2">
                                                <Label>Thứ tự</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={option.displayOrder}
                                                    onChange={(e) => updateOptionField(index, 'displayOrder', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeOptionField(index)}
                                                className="flex-shrink-0"
                                                title="Xóa tùy chọn"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {groupOptions.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Chưa có tùy chọn. Vui lòng thêm ít nhất một tùy chọn.</p>
                                    )}
                                </div>
                            )}

                            {editGroup && (
                                <p className="text-sm text-muted-foreground italic">
                                    Để thêm/sửa tùy chọn, vui lòng sử dụng nút "Tùy chọn" trong bảng danh sách.
                                </p>
                            )}

                            {formError && (
                                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                                    {formError}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowGroupDialog(false)} disabled={formLoading}>
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

            {/* Manage Options Dialog */}
            <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Quản lý tùy chọn: {selectedGroup?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={openAddOption} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm tùy chọn
                            </Button>
                        </div>

                        {optionsLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Đang tải...
                            </div>
                        ) : groupOptionsData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Chưa có tùy chọn nào
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {groupOptionsData
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((option) => (
                                        <div key={option.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{option.displayOrder}</Badge>
                                                <span className="font-medium">{option.name}</span>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => openEditOption(option)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowOptionsDialog(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Option Dialog */}
            <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmitOption}>
                        <DialogHeader>
                            <DialogTitle>{editOption ? "Sửa tùy chọn" : "Thêm tùy chọn"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="option-name">Tên tùy chọn *</Label>
                                <Input
                                    id="option-name"
                                    value={optionName}
                                    onChange={(e) => setOptionName(e.target.value)}
                                    placeholder="Ví dụ: Nhỏ, Vừa, Lớn..."
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="option-order">Thứ tự hiển thị *</Label>
                                <Input
                                    id="option-order"
                                    type="number"
                                    min="1"
                                    value={optionDisplayOrder}
                                    onChange={(e) => setOptionDisplayOrder(e.target.value)}
                                    placeholder="1, 2, 3..."
                                    required
                                />
                            </div>

                            {optionFormError && (
                                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                                    {optionFormError}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowOptionDialog(false)} disabled={optionFormLoading}>
                                Huỷ
                            </Button>
                            <Button type="submit" disabled={optionFormLoading}>
                                {optionFormLoading ? (
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
        </div>
    )
}
