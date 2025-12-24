import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

export function TransactionsList() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    const loadTransactions = async (page: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getTransactionsApi({
                page,
                size: pageSize,
                sortBy: "createdDate",
                isAsc: false
            })
            const data = (res as any)?.data
            setTransactions(data?.items ?? [])
            setTotalPages(data?.totalPages ?? 1)
            setTotal(data?.total ?? 0)
            setCurrentPage(page)
        } catch (err) {
            console.error("loadTransactions error", err)
            setError("Không thể tải giao dịch")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTransactions(1)
    }, [])

    const handlePrevPage = () => {
        if (currentPage > 1) {
            loadTransactions(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            loadTransactions(currentPage + 1)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Giao dịch gần đây</CardTitle>
                        <CardDescription>Lịch sử giao dịch và thanh toán</CardDescription>
                    </div>
                    {total > 0 && (
                        <Badge variant="outline" className="text-xs">
                            Tổng: {total}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Đang tải giao dịch...</span>
                    </div>
                ) : error ? (
                    <div className="text-sm text-destructive text-center py-8">{error}</div>
                ) : transactions.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch</div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {transactions.map((tx) => {
                                const isDeduction = tx.type === "Supplier"
                                const displayAmount = isDeduction ? -Math.abs(tx.amount || 0) : (tx.amount || 0)
                                return (
                                    <div
                                        key={tx.id}
                                        className="rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {getShortId(tx.transactionReference)}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            isDeduction
                                                                ? "border-orange-500/50 text-orange-700 bg-orange-500/10"
                                                                : "border-blue-500/50 text-blue-700 bg-blue-500/10"
                                                        }
                                                    >
                                                        {isDeduction ? "Nhà cung cấp" : "Doanh thu"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                    <span>
                                                        {new Date(tx.createdDate).toLocaleString("vi-VN", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            tx.status === "Approved"
                                                                ? "border-emerald-500/50 text-emerald-700 bg-emerald-500/10"
                                                                : tx.status === "Pending"
                                                                    ? "border-amber-500/50 text-amber-700 bg-amber-500/10"
                                                                    : "border-red-500/50 text-red-700 bg-red-500/10"
                                                        }
                                                    >
                                                        {tx.status === "Approved"
                                                            ? "Đã duyệt"
                                                            : tx.status === "Pending"
                                                                ? "Chờ duyệt"
                                                                : tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className={`text-lg font-bold flex items-center gap-1 ${isDeduction ? "text-red-600" : "text-emerald-600"
                                                    }`}>
                                                    {isDeduction ? (
                                                        <TrendingDown className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingUp className="h-4 w-4" />
                                                    )}
                                                    <span>
                                                        {displayAmount > 0 ? "+" : ""}
                                                        {Number(displayAmount).toLocaleString("vi-VN")} đ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-xs text-muted-foreground">
                                    Trang {currentPage} / {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1 || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages || loading}
                                    >
                                        Sau
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
