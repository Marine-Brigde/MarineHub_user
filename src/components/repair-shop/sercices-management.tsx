"use client"

import { useEffect, useState } from "react"
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
import { Plus, Search, Filter, Edit, Trash2, Wrench, CheckCircle, AlertTriangle } from "lucide-react"

import {
    getBoatyardServicesApi,
    createBoatyardServiceApi,
    updateBoatyardServiceApi,
    // deleteBoatyardServiceApi, // PATCH để đổi trạng thái
} from "@/api/boatyardApi/boatyardServiceApi"
import type {
    BoatyardService,
    BoatyardServiceRequest,
    BoatyardServiceUpdateRequest,
} from "@/types/boatyardService/boatyardService"
import { useToast } from "@/hooks/use-toast"

export function ServicesManagement() {
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [services, setServices] = useState<BoatyardService[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editService, setEditService] = useState<BoatyardService | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

    const fetchServices = () => {
        setLoading(true)
        getBoatyardServicesApi(1, 20)
            .then((res) => setServices(res.data.items))
            .catch(() => setServices([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const filteredServices = services.filter((service) => {
        const matchSearch = service.typeService.toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus =
            filterStatus === "all"
                ? true
                : filterStatus === "active"
                    ? service.isActive
                    : !service.isActive
        return matchSearch && matchStatus
    })

    // Thống kê đơn giản
    const total = services.length
    const available = services.filter((s) => s.isActive).length
    const busy = services.filter((s) => !s.isActive).length

    // Thêm hoặc sửa dịch vụ
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)
        const form = e.target as HTMLFormElement
        const typeService = (form.elements.namedItem("typeService") as HTMLInputElement).value.trim()
        const price = Number((form.elements.namedItem("price") as HTMLInputElement).value)
        if (!typeService) {
            setFormError("Tên dịch vụ không được để trống")
            setFormLoading(false)
            return
        }
        if (!price || isNaN(price)) {
            setFormError("Giá dịch vụ không hợp lệ")
            setFormLoading(false)
            return
        }
        try {
            if (editService) {
                const updateData: BoatyardServiceUpdateRequest = {
                    typeService,
                    price,
                    isActive: editService.isActive,
                }
                await updateBoatyardServiceApi(editService.id, updateData)
                toast({
                    title: "Thành công",
                    description: "Dịch vụ đã được cập nhật",
                    variant: "success",
                })
            } else {
                const createData: BoatyardServiceRequest = { typeService, price }
                await createBoatyardServiceApi(createData)
                toast({
                    title: "Thành công",
                    description: "Dịch vụ đã được tạo",
                    variant: "success",
                })
            }
            setShowForm(false)
            setEditService(null)
            fetchServices()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMsg = err?.message || "Có lỗi xảy ra"
            setFormError(errorMsg)
            toast({
                title: "Lỗi",
                description: errorMsg,
                variant: "destructive",
            })
        }
        setFormLoading(false)
    }

    // Đổi trạng thái hoạt động (PATCH)
    const handleToggleActive = async (service: BoatyardService) => {
        try {
            await updateBoatyardServiceApi(service.id, {
                typeService: service.typeService,
                price: service.price,
                isActive: !service.isActive,
            })
            toast({
                title: "Thành công",
                description: "Trạng thái dịch vụ đã được cập nhật",
                variant: "success",
            })
            fetchServices()
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật trạng thái dịch vụ",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/repair-shop/dashboard">Xưởng sửa chữa</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý dịch vụ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Page Title */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h1>
                <p className="text-muted-foreground">Quản lý các dịch vụ sửa chữa của xưởng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng dịch vụ</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">{total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">{available}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-secondary">{busy}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            className="border rounded px-3 py-2 text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã đóng</option>
                        </select>
                    </div>
                </div>
                <Button onClick={() => { setShowForm(true); setEditService(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dịch vụ
                </Button>
            </div>

            {/* Form Thêm/Sửa dịch vụ */}
            {showForm && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>{editService ? "Sửa dịch vụ" : "Thêm dịch vụ"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <Input
                                    name="typeService"
                                    placeholder="Tên dịch vụ"
                                    defaultValue={editService?.typeService || ""}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    name="price"
                                    placeholder="Giá dịch vụ"
                                    type="number"
                                    defaultValue={editService?.price?.toString() || ""}
                                    required
                                />
                            </div>
                            {formError && <div className="text-red-500 text-sm">{formError}</div>}
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditService(null); }} disabled={formLoading}>Huỷ</Button>
                                <Button type="submit" disabled={formLoading}>{formLoading ? "Đang lưu..." : "Lưu"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Services Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách dịch vụ</CardTitle>
                    <CardDescription>Quản lý thông tin dịch vụ sửa chữa</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dịch vụ</TableHead>
                                <TableHead>Giá dịch vụ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : filteredServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Không có dịch vụ nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServices.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{service.typeService}</p>
                                                <p className="text-xs text-muted-foreground mt-1">ID: {service.id}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {service.price.toLocaleString("vi-VN")}₫
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={service.isActive ? "default" : "destructive"}
                                                className="cursor-pointer"
                                                onClick={() => handleToggleActive(service)}
                                            >
                                                {service.isActive ? "Có sẵn" : "Không hoạt động"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => { setEditService(service); setShowForm(true); }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {/* Không có API xóa cứng, chỉ đổi trạng thái */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleToggleActive(service)}
                                                >
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
        </div>
    )
}
