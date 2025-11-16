"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
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
    AlertCircle,
    MessageSquare,
    Search,
    Ship,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Send,
    CheckCircle2,
    Clock,
    Eye,
    MessageSquareReply,
} from "lucide-react"

// Mock data - Hardcoded complaints
const mockComplaints = [
    {
        id: "COMP-001",
        shipName: "Tàu Hải Phòng 01",
        shipOwner: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0901234567",
        orderId: "ORD-2024-001",
        subject: "Sản phẩm bị hỏng khi nhận hàng",
        description: "Khi nhận hàng, chúng tôi phát hiện một số sản phẩm phụ tùng bị hỏng và không thể sử dụng. Yêu cầu đổi hàng hoặc hoàn tiền.",
        status: "pending",
        priority: "high",
        createdAt: "2024-11-15T10:30:00Z",
        updatedAt: "2024-11-15T10:30:00Z",
        location: "Cảng Hải Phòng, Kho A2",
        category: "Chất lượng sản phẩm",
    },
    {
        id: "COMP-002",
        shipName: "Tàu Đà Nẵng 05",
        shipOwner: "Trần Thị B",
        email: "tranthib@email.com",
        phone: "0912345678",
        orderId: "ORD-2024-002",
        subject: "Giao hàng chậm trễ",
        description: "Đơn hàng đã quá hạn giao hàng 3 ngày nhưng vẫn chưa nhận được. Chúng tôi cần sản phẩm gấp để sửa chữa tàu.",
        status: "in-progress",
        priority: "high",
        createdAt: "2024-11-14T08:15:00Z",
        updatedAt: "2024-11-16T14:20:00Z",
        location: "Cảng Đà Nẵng",
        category: "Giao hàng",
    },
    {
        id: "COMP-003",
        shipName: "Tàu Quảng Ninh 12",
        shipOwner: "Lê Văn C",
        email: "levanc@email.com",
        phone: "0923456789",
        orderId: "ORD-2024-003",
        subject: "Sai số lượng sản phẩm",
        description: "Đơn hàng yêu cầu 50 sản phẩm nhưng chỉ nhận được 45 sản phẩm. Thiếu 5 sản phẩm.",
        status: "resolved",
        priority: "medium",
        createdAt: "2024-11-13T15:45:00Z",
        updatedAt: "2024-11-15T09:30:00Z",
        location: "Cảng Quảng Ninh",
        category: "Số lượng",
    },
    {
        id: "COMP-004",
        shipName: "Tàu Cần Thơ 08",
        shipOwner: "Phạm Thị D",
        email: "phamthid@email.com",
        phone: "0934567890",
        orderId: "ORD-2024-004",
        subject: "Sản phẩm không đúng mô tả",
        description: "Sản phẩm nhận được không khớp với mô tả trong đơn hàng. Chất lượng kém hơn so với cam kết.",
        status: "pending",
        priority: "medium",
        createdAt: "2024-11-12T11:20:00Z",
        updatedAt: "2024-11-12T11:20:00Z",
        location: "Cảng Cần Thơ",
        category: "Chất lượng sản phẩm",
    },
    {
        id: "COMP-005",
        shipName: "Tàu Nha Trang 03",
        shipOwner: "Hoàng Văn E",
        email: "hoangvane@email.com",
        phone: "0945678901",
        orderId: "ORD-2024-005",
        subject: "Bao bì bị hư hỏng",
        description: "Bao bì đóng gói bị rách và hư hỏng trong quá trình vận chuyển, ảnh hưởng đến sản phẩm bên trong.",
        status: "closed",
        priority: "low",
        createdAt: "2024-11-10T09:00:00Z",
        updatedAt: "2024-11-14T16:45:00Z",
        location: "Cảng Nha Trang",
        category: "Đóng gói",
    },
]

type ComplaintStatus = "pending" | "in-progress" | "resolved" | "closed"
type ComplaintPriority = "low" | "medium" | "high"

interface Complaint {
    id: string
    shipName: string
    shipOwner: string
    email: string
    phone: string
    orderId: string
    subject: string
    description: string
    status: ComplaintStatus
    priority: ComplaintPriority
    createdAt: string
    updatedAt: string
    location: string
    category: string
}

export default function SupplierComplaintsPage() {
    const [selectedTab, setSelectedTab] = useState<ComplaintStatus | "all">("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
    const [replyMessage, setReplyMessage] = useState("")

    const complaints: Complaint[] = mockComplaints as Complaint[]

    const getStatusBadge = (status: ComplaintStatus) => {
        const variants: Record<ComplaintStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
            pending: { variant: "destructive", label: "Chờ xử lý" },
            "in-progress": { variant: "default", label: "Đang xử lý" },
            resolved: { variant: "secondary", label: "Đã giải quyết" },
            closed: { variant: "outline", label: "Đã đóng" },
        }
        const config = variants[status]
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getPriorityBadge = (priority: ComplaintPriority) => {
        const colors: Record<ComplaintPriority, string> = {
            low: "bg-green-100 text-green-800 border-green-200",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
            high: "bg-red-100 text-red-800 border-red-200",
        }
        const labels: Record<ComplaintPriority, string> = {
            low: "Thấp",
            medium: "Trung bình",
            high: "Cao",
        }
        return (
            <Badge className={colors[priority]} variant="outline">
                {labels[priority]}
            </Badge>
        )
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

    const filteredComplaints = complaints.filter((complaint) => {
        const matchesTab = selectedTab === "all" || complaint.status === selectedTab
        const matchesSearch =
            complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.shipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.orderId.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesTab && matchesSearch
    })

    const getStatusCount = (status: ComplaintStatus) => {
        return complaints.filter((c) => c.status === status).length
    }

    const handleViewDetails = (complaint: Complaint) => {
        setSelectedComplaint(complaint)
        setIsDetailDialogOpen(true)
    }

    const handleReply = (complaint: Complaint) => {
        setSelectedComplaint(complaint)
        setReplyMessage("")
        setIsReplyDialogOpen(true)
    }

    const handleSendReply = () => {
        // TODO: Implement API call when ready
        console.log("Sending reply:", replyMessage)
        setIsReplyDialogOpen(false)
        setReplyMessage("")
        setSelectedComplaint(null)
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/suppliers">Tổng quan</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Khiếu nại từ tàu</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-4 mt-2">
                        <SidebarTrigger />
                        <h1 className="text-3xl font-bold text-foreground">Khiếu nại từ tàu</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Quản lý và xử lý các khiếu nại từ chủ tàu</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng khiếu nại</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{complaints.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{getStatusCount("pending")}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{getStatusCount("in-progress")}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{getStatusCount("resolved")}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo ID, tên tàu, chủ đề, mã đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Status Filter */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as ComplaintStatus | "all")}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Tất cả ({complaints.length})</TabsTrigger>
                    <TabsTrigger value="pending">Chờ xử lý ({getStatusCount("pending")})</TabsTrigger>
                    <TabsTrigger value="in-progress">Đang xử lý ({getStatusCount("in-progress")})</TabsTrigger>
                    <TabsTrigger value="resolved">Đã giải quyết ({getStatusCount("resolved")})</TabsTrigger>
                    <TabsTrigger value="closed">Đã đóng ({getStatusCount("closed")})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="mt-4">
                    <div className="space-y-4">
                        {filteredComplaints.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Không tìm thấy khiếu nại nào</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredComplaints.map((complaint) => (
                                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Ship className="h-5 w-5 text-primary" />
                                                    <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        {complaint.id}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Ship className="h-4 w-4" />
                                                        {complaint.shipName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(complaint.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(complaint.status)}
                                                {getPriorityBadge(complaint.priority)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Đơn hàng:</span>
                                                    <p className="font-medium">{complaint.orderId}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Chủ tàu:</span>
                                                    <p className="font-medium">{complaint.shipOwner}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Danh mục:</span>
                                                    <p className="font-medium">{complaint.category}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Vị trí:</span>
                                                    <p className="font-medium line-clamp-1">{complaint.location}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(complaint)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Xem chi tiết
                                                </Button>
                                                {complaint.status !== "closed" && (
                                                    <Button variant="default" size="sm" onClick={() => handleReply(complaint)}>
                                                        <MessageSquareReply className="mr-2 h-4 w-4" />
                                                        Phản hồi
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Chi tiết khiếu nại
                        </DialogTitle>
                        <DialogDescription>Thông tin chi tiết về khiếu nại từ tàu</DialogDescription>
                    </DialogHeader>
                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Mã khiếu nại</Label>
                                    <p className="font-medium">{selectedComplaint.id}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                                    <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Độ ưu tiên</Label>
                                    <div className="mt-1">{getPriorityBadge(selectedComplaint.priority)}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Mã đơn hàng</Label>
                                    <p className="font-medium">{selectedComplaint.orderId}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-xs text-muted-foreground">Chủ đề</Label>
                                <p className="font-medium mt-1">{selectedComplaint.subject}</p>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Mô tả chi tiết</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedComplaint.description}</p>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-sm font-semibold mb-3 block">Thông tin tàu</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Ship className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Tên tàu:</span>
                                            <span className="font-medium">{selectedComplaint.shipName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Chủ tàu:</span>
                                            <span className="font-medium">{selectedComplaint.shipOwner}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Email:</span>
                                            <span className="font-medium">{selectedComplaint.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Điện thoại:</span>
                                            <span className="font-medium">{selectedComplaint.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Vị trí:</span>
                                    <span className="font-medium">{selectedComplaint.location}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Ngày tạo</Label>
                                    <p className="font-medium mt-1">{formatDate(selectedComplaint.createdAt)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Cập nhật lần cuối</Label>
                                    <p className="font-medium mt-1">{formatDate(selectedComplaint.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedComplaint && selectedComplaint.status !== "closed" && (
                            <Button onClick={() => {
                                setIsDetailDialogOpen(false)
                                handleReply(selectedComplaint)
                            }}>
                                <MessageSquareReply className="mr-2 h-4 w-4" />
                                Phản hồi
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquareReply className="h-5 w-5 text-primary" />
                            Phản hồi khiếu nại
                        </DialogTitle>
                        <DialogDescription>
                            Gửi phản hồi cho khiếu nại: {selectedComplaint?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-semibold">Chủ đề khiếu nại</Label>
                                <p className="text-sm text-muted-foreground mt-1">{selectedComplaint.subject}</p>
                            </div>
                            <div>
                                <Label htmlFor="reply-message" className="text-sm font-semibold">
                                    Nội dung phản hồi <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reply-message"
                                    placeholder="Nhập nội dung phản hồi..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    rows={8}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            Gửi phản hồi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

