"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw } from "lucide-react"
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"

const statusVariant = (status?: string) => {
    switch ((status || '').toLowerCase()) {
        case 'approved':
            return 'default'
        case 'pending':
            return 'secondary'
        case 'rejected':
        case 'failed':
            return 'destructive'
        default:
            return 'outline'
    }
}

const typeVariant = (type?: string) => {
    if (!type) return 'secondary'
    const t = type.toLowerCase()
    if (t === 'supplier') return 'default'
    if (t === 'boatyard') return 'outline'
    return 'secondary'
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

const fmtDate = (d: string) => {
    try {
        return new Date(d).toLocaleString('vi-VN')
    } catch {
        return d
    }
}

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

export function TransactionsDashboard() {
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
        <Card className="h-full">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Lịch sử giao dịch</CardTitle>
                    <CardDescription>30 giao dịch mới nhất</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="hidden sm:block">Tổng:</div>
                    <Badge variant="outline" className="text-base font-semibold">
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-mono text-xs">{getShortId(t.transactionReference)}</TableCell>
                                        <TableCell className="text-right font-medium">{fmtCurrency(t.amount)} đ</TableCell>
                                        <TableCell>
                                            <Badge variant={typeVariant(t.type)}>{t.type || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(t.status)}>{t.status || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{fmtDate(t.createdDate)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
