"use client"

import { useEffect, useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { Loader2, Filter, TrendingUp } from 'lucide-react'
import { getTransactionsApi, type Transaction, type TransactionStatus, type TransactionType } from '@/api/Transaction/transactionApi'
import { useToast } from '@/hooks/use-toast'
import { OrdersModal } from './orders-modal'

const TRANSACTION_STATUSES: TransactionStatus[] = ['Pending', 'Approved', 'Rejected', 'Processing']
const TRANSACTION_TYPES: TransactionType[] = ['Revenue', 'Boatyard', 'Supplier']

export default function TransactionsList() {
    const { toast } = useToast()
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [showOrdersModal, setShowOrdersModal] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // Filter state
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getTransactionsApi({ page: 1, size: 100 })
            const items = (res as any)?.data?.items ?? []
            setAllTransactions(items)
        } catch (err) {
            console.error('getTransactionsApi', err)
            setError('Lỗi khi tải lịch sử giao dịch')
            toast({
                title: "Lỗi",
                description: "Không thể tải lịch sử giao dịch",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter((transaction) => {
            const statusMatch = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter.toLowerCase()
            const typeMatch = typeFilter === 'all' || transaction.type.toLowerCase() === typeFilter.toLowerCase()
            return statusMatch && typeMatch
        })
    }, [allTransactions, statusFilter, typeFilter])

    // Paginate filtered transactions
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredTransactions.slice(startIndex, endIndex)
    }, [filteredTransactions, currentPage, pageSize])

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredTransactions.length / pageSize)
    }, [filteredTransactions.length, pageSize])

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter, typeFilter])

    // Status map
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
        pending: { label: 'Chờ xử lý', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        approved: { label: 'Đã duyệt', bg: 'bg-green-100', text: 'text-green-700' },
        rejected: { label: 'Bị từ chối', bg: 'bg-red-100', text: 'text-red-700' },
        processing: { label: 'Đang xử lý', bg: 'bg-blue-100', text: 'text-blue-700' },
    }

    const typeMap: Record<string, { label: string; color: string }> = {
        revenue: { label: 'Doanh thu', color: 'text-green-600' },
        boatyard: { label: 'Bến tàu', color: 'text-blue-600' },
        supplier: { label: 'Nhà cung cấp', color: 'text-purple-600' },
    }

    const renderStatus = (s?: string) => {
        const key = (s || '').toLowerCase()
        const st = statusMap[key] || { label: s || '-', bg: 'bg-muted/20', text: 'text-muted-foreground' }
        return <Badge className={`${st.bg} ${st.text} font-semibold text-xs px-2 py-1`}>{st.label}</Badge>
    }

    const renderType = (t?: string) => {
        const key = (t || '').toLowerCase()
        const type = typeMap[key] || { label: t || '-', color: 'text-muted-foreground' }
        return <span className={`text-sm font-medium ${type.color}`}>{type.label}</span>
    }

    // Calculate totals
    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    }, [filteredTransactions])

    const getShortId = (id: string) => {
        return id.length > 8 ? id.slice(-8) : id
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="space-y-6 px-6 py-10 ">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Lịch sử giao dịch</h1>
                <p className="text-muted-foreground">Xem chi tiết các giao dịch của bạn</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng giao dịch</p>
                                <p className="text-2xl font-bold text-foreground">{filteredTransactions.length}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng tiền</p>
                            <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Đã duyệt</p>
                            <p className="text-2xl font-bold text-green-600">
                                {filteredTransactions.filter(t => t.status === 'Approved').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="text-xl">Danh sách giao dịch</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    {TRANSACTION_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status.toLowerCase()}>
                                            {statusMap[status.toLowerCase()]?.label || status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Loại" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    {TRANSACTION_TYPES.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {typeMap[type.toLowerCase()]?.label || type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải lịch sử giao dịch...</p>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}

                    {!loading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-base font-semibold">Mã giao dịch</TableHead>
                                            <TableHead className="text-base font-semibold">Loại</TableHead>
                                            <TableHead className="text-base font-semibold">Số tiền</TableHead>
                                            <TableHead className="text-base font-semibold">Trạng thái</TableHead>
                                            <TableHead className="text-base font-semibold">Ngày tạo</TableHead>
                                            <TableHead className="text-base font-semibold">Số đơn hàng</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    Không có giao dịch nào
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedTransactions.map((transaction) => (
                                                <TableRow
                                                    key={transaction.id}
                                                    className="hover:bg-muted/50"
                                                    onClick={() => {
                                                        if (transaction.type === 'Supplier') {
                                                            setSelectedTransaction(transaction)
                                                            setShowOrdersModal(true)
                                                        }
                                                    }}
                                                    style={transaction.type === 'Supplier' ? { cursor: 'pointer' } : {}}
                                                >
                                                    <TableCell className="font-medium py-4 font-mono text-sm">
                                                        #{getShortId(transaction.id)}
                                                    </TableCell>
                                                    <TableCell className="py-4">{renderType(transaction.type)}</TableCell>
                                                    <TableCell className="py-4 text-sm font-medium text-primary">
                                                        {transaction.amount?.toLocaleString('vi-VN')} đ
                                                    </TableCell>
                                                    <TableCell className="py-4">{renderStatus(transaction.status)}</TableCell>
                                                    <TableCell className="py-4 text-sm text-muted-foreground">
                                                        {new Date(transaction.createdDate).toLocaleDateString('vi-VN')}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm">
                                                        {transaction.type === 'Supplier' ? (
                                                            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                                                                Xem đơn hàng
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, filteredTransactions.length)}</span> của <span className="font-semibold text-foreground">{filteredTransactions.length}</span> giao dịch
                                    </div>
                                    <Pagination>
                                        <PaginationContent className="gap-0">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                                                    }}
                                                    className={`h-10 px-4 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                                />
                                            </PaginationItem>

                                            {getPageNumbers().map((page, idx) => (
                                                <PaginationItem key={idx}>
                                                    {page === "..." ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={page === currentPage}
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                if (typeof page === "number") {
                                                                    setCurrentPage(page)
                                                                }
                                                            }}
                                                            className={`h-10 px-4 ${page === currentPage ? "bg-primary text-primary-foreground" : ""}`}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                                    }}
                                                    className={`h-10 px-4 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <OrdersModal
                open={showOrdersModal}
                onOpenChange={setShowOrdersModal}
                transaction={selectedTransaction}
            />
        </div>
    )
}
