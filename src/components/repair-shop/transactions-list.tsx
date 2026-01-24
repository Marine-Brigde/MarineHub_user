import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"
import { getBookingsApi } from "@/api/booking/bookingApi"
import { getBoatyardDetailApi } from "@/api/boatyardApi/boatyardApi"

const getShortId = (id: string) => {
    return id.length > 8 ? id.slice(0, 8) + '...' : id
}

const formatDateOnly = (date: Date) => {
    const year = date.getUTCFullYear()
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
    const day = `${date.getUTCDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getMonthRange = (isoDate?: string) => {
    if (!isoDate) return null
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return null
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
    return { startDate: formatDateOnly(start), endDate: formatDateOnly(end) }
}

const renderBookingStatus = (status?: string) => {
    const key = (status || '').toLowerCase()
    if (key === 'confirmed') return 'Đã xác nhận'
    if (key === 'pending') return 'Chờ xử lý'
    if (key === 'cancelled') return 'Đã hủy'
    if (key === 'completed' || key === 'paid') return 'Đã thanh toán'
    return status || '-'
}

export function TransactionsList() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showInvoice, setShowInvoice] = useState(false)
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const [invoiceError, setInvoiceError] = useState<string | null>(null)
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
    const [bookings, setBookings] = useState<any[]>([])
    const [, setCommissionFeePercent] = useState<number>(5)
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

    // Fetch boatyard detail to get commission fee percent
    useEffect(() => {
        const fetchBoatyardDetail = async () => {
            try {
                const res = await getBoatyardDetailApi()
                if (res.status === 200 && res.data?.commissionFeePercent) {
                    setCommissionFeePercent(res.data.commissionFeePercent)
                }
            } catch (err) {
                console.error('fetchBoatyardDetail', err)
                // Keep default 5% if fetch fails
            }
        }

        fetchBoatyardDetail()
    }, [])

    const openInvoice = async (tx: Transaction) => {
        setSelectedTx(tx)
        setShowInvoice(true)
        setInvoiceLoading(true)
        setInvoiceError(null)
        setBookings([])

        try {
            const range = getMonthRange(tx.createdDate)
            if (!range) {
                setInvoiceError('Không xác định được khoảng thời gian lọc booking')
                setInvoiceLoading(false)
                return
            }

            const res = await getBookingsApi({
                page: 1,
                size: 100,
                startDate: range.startDate,
                endDate: range.endDate,
                sortBy: 'createdDate',
                isAsc: false,
            })
            const data = (res as any)?.data ?? res
            setBookings(data?.items ?? [])
        } catch (err: any) {
            setInvoiceError(err?.message || 'Không thể tải hóa đơn booking')
        } finally {
            setInvoiceLoading(false)
        }
    }

    const handlePrint = () => {
        setTimeout(() => window.print(), 50)
    }

    const printStyles = `@media print {
        body { margin: 0; background: #ffffff; }
        .print-hidden { display: none !important; }
        #print-booking-invoice { display: block !important; position: static !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 16px !important; }
        #print-booking-invoice, #print-booking-invoice * { visibility: visible !important; color: #000 !important; }
        body *:not(#print-booking-invoice):not(#print-booking-invoice *) { visibility: hidden !important; }
    }`

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
        <>
            <style>{printStyles}</style>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Giao dịch gần đây</CardTitle>
                            <CardDescription>Lịch sử giao dịch và thanh toán</CardDescription>
                        </div>
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
                                                {tx.type?.toLowerCase() === 'revenue' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="print-hidden"
                                                        onClick={() => openInvoice(tx)}
                                                        disabled={invoiceLoading && selectedTx?.id === tx.id}
                                                    >
                                                        {invoiceLoading && selectedTx?.id === tx.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Printer className="h-4 w-4" />
                                                        )}
                                                        <span className="ml-2">Hóa đơn</span>
                                                    </Button>
                                                )}
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

            <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print-hidden">
                    <DialogHeader>
                        <DialogTitle>Hóa đơn booking</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {invoiceLoading ? (
                            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Đang tải hóa đơn...
                            </div>
                        ) : invoiceError ? (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded">
                                {invoiceError}
                            </div>
                        ) : (
                            <>
                                <PrintBookingInvoice transaction={selectedTx} bookings={bookings} />
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button variant="outline" onClick={() => setShowInvoice(false)}>Đóng</Button>
                                    <Button onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        In hóa đơn
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div id="print-booking-invoice" className="absolute -left-[9999px] top-0 print:static print:left-0 print:block print:w-full p-4 bg-white text-black">
                <PrintBookingInvoice transaction={selectedTx} bookings={bookings} />
            </div>
        </>
    )
}

function PrintBookingInvoice({ transaction, bookings }: { transaction: Transaction | null; bookings: any[] }) {
    const totalAmount = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const netAmount = transaction?.amount || 0
    const platformFee = Math.max(0, totalAmount - netAmount)
    const calculatedCommissionPercent = totalAmount > 0 ? (platformFee / totalAmount) * 100 : 0

    return (
        <div className="w-full space-y-4 bg-white text-black">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">HÓA ĐƠN BOOKING</h2>
                <p className="text-xs text-gray-600">Giao dịch: {transaction?.transactionReference}</p>
                <p className="text-xs text-gray-600">Ngày: {transaction?.createdDate ? new Date(transaction.createdDate).toLocaleDateString('vi-VN') : '-'}</p>
            </div>

            <div className="border rounded p-3 text-xs space-y-1">
                <div className="flex justify-between"><span>Số booking:</span><span className="font-semibold">{bookings.length}</span></div>
                <div className="flex justify-between"><span>Tổng tiền:</span><span className="font-semibold">{totalAmount.toLocaleString('vi-VN')} đ</span></div>
                <div className="flex justify-between text-red-600"><span>Phí nền tảng ({calculatedCommissionPercent.toFixed(2)}%):</span><span>- {platformFee.toLocaleString('vi-VN')} đ</span></div>
                <div className="flex justify-between font-bold text-blue-600 border-t pt-2"><span>Nhận:</span><span>{netAmount.toLocaleString('vi-VN')} đ</span></div>
            </div>

            <div className="border rounded">
                <div className="grid grid-cols-6 gap-2 bg-gray-100 text-xs font-semibold px-3 py-2">
                    <span>Mã</span>
                    <span className="col-span-2">Tàu / Chủ</span>
                    <span>Khung giờ</span>
                    <span className="text-right">Tổng</span>
                    <span className="text-right">Trạng thái</span>
                </div>
                <div className="divide-y">
                    {bookings.map((b) => (
                        <div key={b.id} className="grid grid-cols-6 gap-2 px-3 py-2 text-xs items-center">
                            <span className="font-mono">{getShortId(b.id)}</span>
                            <span className="col-span-2">
                                {b.shipName || b.shipOwnerName || 'Chưa rõ'}
                            </span>
                            <span>
                                {b.startTime ? new Date(b.startTime).toLocaleDateString('vi-VN') : '-'}
                            </span>
                            <span className="text-right font-semibold">{(b.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
                            <span className="text-right">{renderBookingStatus(b.status)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
