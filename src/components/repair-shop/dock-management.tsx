"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getDockSlotsApi, createDockSlotApi, updateDockSlotApi } from "@/api/dockSlot/dockSlotApi"
import type { DockSlot, CreateDockSlotRequest, UpdateDockSlotRequest } from "@/types/dockSlot/dockSlot"
import { SidebarTrigger } from "../ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

const extractServerMessage = (body: unknown): string => {
    if (!body) return ""
    if (typeof body === "string") return body
    if (isRecord(body)) {
        if (typeof body.data === "string") return body.data
        if (typeof body.message === "string") return body.message
        if (isRecord(body.data) && typeof (body.data as Record<string, unknown>).message === "string")
            return (body.data as Record<string, unknown>).message as string
        if (isRecord(body.data) && typeof (body.data as Record<string, unknown>).error === "string")
            return (body.data as Record<string, unknown>).error as string
        if (typeof body.error === "string") return body.error
    }
    return ""
}

const getErrorMessage = (err: unknown) => {
    if (!err) return "Lỗi kết nối"
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message || "Lỗi"
    if (isRecord(err)) {
        const response = (err as Record<string, unknown>).response
        const candidate = response ?? err
        const msg = extractServerMessage(candidate)
        if (msg) return msg
        if (typeof (err as Record<string, unknown>).message === "string")
            return (err as Record<string, unknown>).message as string
    }
    try {
        return JSON.stringify(err)
    } catch {
        return "Lỗi không xác định"
    }
}

export function DockManagement() {
    const [searchTerm, setSearchTerm] = useState("")
    const [docks, setDocks] = useState<DockSlot[]>([])
    const [loading, setLoading] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [editDock, setEditDock] = useState<DockSlot | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const [formData, setFormData] = useState({ name: "", isActive: true })
    const [toggleLoading, setToggleLoading] = useState<string | null>(null)

    const fetchDocks = () => {
        setLoading(true)
        getDockSlotsApi({ page: 1, size: 50 })
            .then((res) => {
                const items = (res as any)?.data?.items ?? (res as any)?.data ?? []
                setDocks(items)
            })
            .catch(() => setDocks([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchDocks()
    }, [])

    const filtered = docks.filter((d) => d.name?.toLowerCase().includes(searchTerm.toLowerCase() ?? ""))

    const handleOpenCreate = () => {
        setEditDock(null)
        setFormData({ name: "", isActive: true })
        setFormError("")
        setShowDialog(true)
    }

    const handleEditClick = (dock: DockSlot) => {
        setEditDock(dock)
        setFormData({ name: dock.name, isActive: dock.isActive })
        setFormError("")
        setShowDialog(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)
        try {
            const name = formData.name.trim()
            const isActive = formData.isActive

            if (!name) {
                setFormError("Tên dock không được để trống")
                setFormLoading(false)
                return
            }

            if (editDock) {
                const payload: UpdateDockSlotRequest = {
                    name,
                    isActive,
                }
                await updateDockSlotApi(editDock.id, payload)
            } else {
                const payload: CreateDockSlotRequest = { name }
                await createDockSlotApi(payload)
            }

            setShowDialog(false)
            setEditDock(null)
            fetchDocks()
        } catch (err: unknown) {
            setFormError(getErrorMessage(err))
        } finally {
            setFormLoading(false)
        }
    }

    const handleToggleActive = async (dock: DockSlot) => {
        setToggleLoading(dock.id)
        try {
            const payload: UpdateDockSlotRequest = {
                name: dock.name,
                isActive: !dock.isActive,
            }
            await updateDockSlotApi(dock.id, payload)
            fetchDocks()
        } catch {
            // silent
        } finally {
            setToggleLoading(null)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 ">
            {/* Header Section */}
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink >Xưởng sửa chữa</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lí bến</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-balance">Quản lý Dock Slots</h1>
                    <p className="text-sm text-muted-foreground">Quản lý bến đỗ của xưởng</p>
                </div>
                <Button onClick={handleOpenCreate} size="default" className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Dock
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Tìm kiếm dock..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">{docks.filter((d) => d.isActive).length} Hoạt động</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">{docks.filter((d) => !d.isActive).length} Đóng</span>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-border/50">
                <CardHeader className="border-b border-border/50 ">
                    <CardTitle className="text-lg">Danh sách Dock</CardTitle>

                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[50%]">Tên Dock</TableHead>
                                <TableHead className="w-[25%]">Trạng thái</TableHead>
                                <TableHead className="w-[25%] text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang tải...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-8 w-8 opacity-50" />
                                            <p className="text-sm">{searchTerm ? "Không tìm thấy dock phù hợp" : "Chưa có dock nào"}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((dock) => (
                                    <TableRow key={dock.id} className="border-border/50">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">{dock.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {dock.id}</p>
                                            </div>
                                        </TableCell>

                                        {/* Status cell: compact switch + badge */}
                                        <TableCell>
                                            <div
                                                role="button"
                                                onClick={() => toggleLoading !== dock.id && handleToggleActive(dock)}
                                                className="flex items-center gap-3 cursor-pointer select-none"
                                                aria-busy={toggleLoading === dock.id}
                                                title="Nhấn để thay đổi trạng thái"
                                            >
                                                <Switch
                                                    checked={dock.isActive}
                                                    onCheckedChange={() => handleToggleActive(dock)}
                                                    disabled={toggleLoading === dock.id}
                                                    className="scale-90"
                                                />
                                                <div className="min-w-[90px]">
                                                    {toggleLoading === dock.id ? (
                                                        <Badge variant="outline" className="gap-2">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Đang cập nhật
                                                        </Badge>
                                                    ) : dock.isActive ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1.5 border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Hoạt động
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1.5 border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                            Đóng
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" onClick={() => handleEditClick(dock)} className="gap-2">
                                                <Edit className="h-4 w-4" />
                                                Sửa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog Form */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editDock ? "Sửa Dock" : "Thêm Dock Mới"}</DialogTitle>
                            <DialogDescription>
                                {editDock ? "Cập nhật thông tin dock slot" : "Tạo dock slot mới cho xưởng"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tên Dock</Label>
                                <Input
                                    id="name"
                                    placeholder="Nhập tên dock..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isActive" className="text-base">
                                        Trạng thái
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Dock có sẵn sàng hoạt động không</p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
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
        </div>
    )
}