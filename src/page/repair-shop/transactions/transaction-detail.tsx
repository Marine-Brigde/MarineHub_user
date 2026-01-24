import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { getTransactionsApi, type Transaction, type TransactionStatus, type TransactionType } from '@/api/Transaction/transactionApi'
import { getBookingsApi } from '@/api/booking/bookingApi'
import type { Booking } from '@/types/Booking/booking'
import { useToast } from '@/hooks/use-toast'

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

export default function TransactionDetailPage() {
    const { id: transactionId } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [transaction, setTransaction] = useState<Transaction | null>(() => (location.state as any)?.transaction || null)
    const [txLoading, setTxLoading] = useState(!transaction)
    const [txError, setTxError] = useState<string | null>(null)

    const [bookings, setBookings] = useState<Booking[]>([])
    const [bookingsLoading, setBookingsLoading] = useState(false)
    const [bookingsError, setBookingsError] = useState<string | null>(null)

    // Fetch transaction if not provided via navigation state
    useEffect(() => {
        if (transaction || !transactionId) return

        const fetchTransaction = async () => {
            setTxLoading(true)
            setTxError(null)
            try {
                const res = await getTransactionsApi({ page: 1, size: 200, sortBy: 'createdDate', isAsc: false })
                const items = (res as any)?.data?.items ?? []
                const found = items.find((t: Transaction) => t.id === transactionId)
                if (!found) {
                    setTxError('Không tìm thấy giao dịch')
                }
                setTransaction(found || null)
            } catch (err) {
                console.error('fetchTransaction', err)
                setTxError('Không thể tải giao dịch')
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải thông tin giao dịch',
                    variant: 'destructive',
                })
            } finally {
                setTxLoading(false)
            }
        }

        fetchTransaction()
    }, [transaction, transactionId, toast])

    // Fetch bookings for the month of the transaction creation date
    useEffect(() => {
        if (!transaction?.createdDate) return
        const range = getMonthRange(transaction.createdDate)
        if (!range) {
            setBookingsError('Không thể xác định khoảng thời gian lọc booking')
            return
        }

        const fetchBookings = async () => {
            setBookingsLoading(true)
            setBookingsError(null)
            try {
                const res = await getBookingsApi({
                    page: 1,
                    size: 200,
                    startDate: range.startDate,
                    endDate: range.endDate,
                    sortBy: 'createdDate',
                    isAsc: false,
                })
                const data = (res as any)?.data ?? res
                setBookings(data?.items ?? [])
            } catch (err) {
                console.error('fetchBookings', err)
                setBookingsError('Không thể tải danh sách booking')
            } finally {
                setBookingsLoading(false)
            }
        }

        fetchBookings()
    }, [transaction?.createdDate])

    const totalAmount = useMemo(() => bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0), [bookings])
    const netAmount = useMemo(() => transaction?.amount || 0, [transaction?.amount])
    const platformFee = useMemo(() => Math.max(0, totalAmount - netAmount), [totalAmount, netAmount])
    const calculatedCommissionPercent = useMemo(() => totalAmount > 0 ? (platformFee / totalAmount) * 100 : 0, [totalAmount, platformFee])

    const renderStatus = (status?: TransactionStatus) => {
        const st = status ? statusMap[status.toLowerCase()] : null
        if (!st) return <Badge className="bg-muted/30 text-muted-foreground">{status || '-'}</Badge>
        return <Badge className={`${st.bg} ${st.text} font-semibold text-xs px-2 py-1`}>{st.label}</Badge>
    }

    const renderType = (type?: TransactionType) => {
        const t = type ? typeMap[type.toLowerCase()] : null
        if (!t) return <span className="text-muted-foreground text-sm">{type || '-'}</span>
        return <span className={`text-sm font-medium ${t.color}`}>{t.label}</span>
    }

    const renderBookingStatus = (status?: string) => {
        const key = (status || '').toLowerCase()
        if (key === 'completed' || key === 'paid') return <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
        if (key === 'confirmed') return <Badge className="bg-blue-100 text-blue-700">Đã xác nhận</Badge>
        if (key === 'pending') return <Badge className="bg-yellow-100 text-yellow-700">Chờ xử lý</Badge>
        if (key === 'cancelled') return <Badge className="bg-red-100 text-red-700">Bị hủy</Badge>
        return <Badge variant="outline">{status || '-'}</Badge>
    }

    const shortId = (id?: string) => {
        if (!id) return '-'
        return id.length > 10 ? `#${id.slice(0, 6)}...` : `#${id}`
    }

    const range = getMonthRange(transaction?.createdDate)

    return (
        <div className="space-y-6 px-6 py-8">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Chi tiết giao dịch</h1>
                    <p className="text-muted-foreground text-sm">Xem hóa đơn booking theo tháng phát sinh giao dịch</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Thông tin giao dịch</CardTitle>
                    {transaction?.type && renderType(transaction.type)}
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {txLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thông tin giao dịch...
                        </div>
                    ) : txError ? (
                        <div className="text-destructive bg-destructive/10 p-3 rounded">{txError}</div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Mã tham chiếu</p>
                                <p className="font-semibold text-foreground">{shortId(transaction?.transactionReference)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Số tiền</p>
                                <p className={`font-bold ${transaction?.type?.toLowerCase() === 'supplier' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {transaction ? `${(transaction.type?.toLowerCase() === 'supplier' ? '-' : '+')}${(transaction.amount || 0).toLocaleString('vi-VN')} đ` : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Trạng thái</p>
                                <div>{renderStatus(transaction?.status)}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Ngày tạo</p>
                                <p className="font-medium">{transaction?.createdDate ? new Date(transaction.createdDate).toLocaleString('vi-VN') : '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Phạm vi lọc booking</p>
                                <p className="font-medium">
                                    {range ? `${range.startDate} → ${range.endDate}` : 'Không xác định'}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Danh sách booking trong tháng</CardTitle>
                        <p className="text-sm text-muted-foreground">API truyền startDate/endDate bằng ngày đầu và cuối tháng tạo giao dịch</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground space-y-1">
                        <p>Tổng: <span className="font-semibold text-foreground">{bookings.length}</span> booking</p>
                        <p>Số tiền: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('vi-VN')} đ</span></p>
                    </div>
                </CardHeader>
                <CardContent>
                    {bookingsLoading ? (
                        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Đang tải booking...
                        </div>
                    ) : bookingsError ? (
                        <div className="text-destructive bg-destructive/10 p-3 rounded text-sm">{bookingsError}</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-muted-foreground text-sm text-center py-8">Không có booking trong khoảng thời gian này</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="rounded border p-3">
                                    <p className="text-muted-foreground">Tổng tiền</p>
                                    <p className="text-lg font-bold text-primary">{totalAmount.toLocaleString('vi-VN')} đ</p>
                                </div>
                                <div className="rounded border p-3">
                                    <p className="text-muted-foreground">Phí nền tảng ({calculatedCommissionPercent.toFixed(2)}%)</p>
                                    <p className="text-lg font-semibold text-red-600">- {platformFee.toLocaleString('vi-VN')} đ</p>
                                </div>
                                <div className="rounded border p-3">
                                    <p className="text-muted-foreground">Thực nhận</p>
                                    <p className="text-lg font-bold text-emerald-600">{netAmount.toLocaleString('vi-VN')} đ</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Mã</TableHead>
                                            <TableHead className="text-xs">Tàu / Chủ tàu</TableHead>
                                            <TableHead className="text-xs">Khung giờ</TableHead>
                                            <TableHead className="text-xs text-right">Tổng tiền</TableHead>
                                            <TableHead className="text-xs text-right">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-mono text-sm">{shortId(booking.id)}</TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{booking.shipName || booking.shipOwnerName || 'Chưa rõ'}</span>
                                                        {booking.shipOwnerPhoneNumber && <span className="text-xs text-muted-foreground">{booking.shipOwnerPhoneNumber}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {booking.startTime ? new Date(booking.startTime).toLocaleDateString('vi-VN') : '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-semibold text-foreground">
                                                    {(booking.totalAmount || 0).toLocaleString('vi-VN')} đ
                                                </TableCell>
                                                <TableCell className="text-right">{renderBookingStatus(booking.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
