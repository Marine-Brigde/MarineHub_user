"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2, RefreshCcw, Eye } from "lucide-react"
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"


const statusVariant = (status?: string) => {
    switch ((status || '').toLowerCase()) {
        case 'approved':
        case 'delivered':
            return 'default'
        case 'pending':
            return 'secondary'
        case 'rejected':
        case 'failed':
        case 'cancelled':
            return 'destructive'
        default:
            return 'outline'
    }
}

const statusText: Record<string, string> = {
    'approved': 'Đã duyệt',
    'pending': 'Chờ duyệt',
    'rejected': 'Từ chối',
    'failed': 'Thất bại',
    'cancelled': 'Đã hủy',
    'delivered': 'Đã giao',
    'processing': 'Đang xử lý',
    'completed': 'Hoàn thành'
}

const typeText: Record<string, string> = {
    'revenue': 'Doanh thu',
    'supplier': 'Nhà cung cấp',
    'boatyard': 'Xưởng sửa chữa',
    'commission': 'Hoa hồng',
    'refund': 'Hoàn tiền'
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

const fmtDate = (d: string) => {
    try {
        const date = new Date(d)
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch {
        return d
    }
}

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

export function TransactionsDashboard() {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const totalAmount = useMemo(() => transactions.reduce((sum, t) => sum + (t.amount || 0), 0), [transactions])

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getTransactionsApi({ page: 1, size: 30, sortBy: 'createdDate', isAsc: false })
            const data = (res as any)?.data ?? (res as any)
            setTransactions(data?.items ?? [])
        } catch (err: any) {
            setError(err?.message || 'Không thể tải giao dịch')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink>Quản lý</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Giao dịch</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Giao dịch</h1>
                    <p className="text-sm text-muted-foreground">30 giao dịch mới nhất</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base font-semibold">
                        {fmtCurrency(totalAmount)} đ
                    </Badge>
                    <Button size="icon" variant="outline" onClick={load} disabled={loading} title="Làm mới">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Card className="border-border/50">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 bg-muted/30">
                    <div>
                        <CardTitle>Lịch sử giao dịch</CardTitle>
                        <CardDescription>Danh sách giao dịch gần đây</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="hidden sm:block">Tổng:</div>
                        <Badge variant="secondary" className="font-semibold">
                            {fmtCurrency(totalAmount)} đ
                        </Badge>
                        <Button size="icon" variant="outline" onClick={load} disabled={loading} title="Làm mới">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải giao dịch...
                        </div>
                    ) : error ? (
                        <div className="p-4 text-sm text-destructive">{error}</div>
                    ) : transactions.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Không có giao dịch</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã tham chiếu</TableHead>
                                        <TableHead className="text-right">Số tiền</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-center">Chi tiết</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono text-xs">{getShortId(t.transactionReference)}</TableCell>
                                            <TableCell className="text-right font-medium">{fmtCurrency(t.amount)} đ</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(t.type)}>{typeText[t.type?.toLowerCase()] || t.type || 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(t.status)}>{statusText[t.status?.toLowerCase()] || t.status || 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{fmtDate(t.createdDate)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/supplier/orders-list/${t.id}`)
                                                    }}
                                                    title="Xem đơn hàng"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
