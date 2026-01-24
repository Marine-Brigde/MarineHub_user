

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getRevenuesApi } from "@/api/repairShop/revenueApi"
import { getBookingsApi } from '@/api/booking/bookingApi'
import { getBoatyardDetailApi } from '@/api/boatyardApi/boatyardApi'
import { getTransactionsApi, type Transaction } from "@/api/Transaction/transactionApi"
import type { MonthlyRevenue } from "@/types/repairShop/revenue"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { TransactionsList } from "./transactions-list"

const chartConfig = {
    completed: {
        label: "Hoàn thành",
        color: "hsl(var(--chart-1))",
    },
    revenue: {
        label: "Doanh thu",
        color: "#22c55e",
    },
}

const renderBookingStatus = (status?: string) => {
    const key = (status || '').toLowerCase()
    if (key === 'confirmed') return { label: 'Đã xác nhận', variant: 'default' as const }
    if (key === 'pending') return { label: 'Chờ xử lý', variant: 'secondary' as const }
    if (key === 'cancelled') return { label: 'Đã hủy', variant: 'outline' as const }
    if (key === 'completed' || key === 'paid') return { label: 'Đã thanh toán', variant: 'default' as const }
    return { label: status || 'N/A', variant: 'outline' as const }
}

export function RepairShopDashboard() {
    const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([])
    const [revLoading, setRevLoading] = useState(false)
    const [revError, setRevError] = useState<string | null>(null)
    const [commissionFeePercent, setCommissionFeePercent] = useState<number>(5)
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date()
        d.setDate(1) // Ngày đầu tháng
        return d.toISOString().slice(0, 10)
    })
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
    const [rawRevenues, setRawRevenues] = useState<MonthlyRevenue[]>([])
    const [bookingsCount, setBookingsCount] = useState<number | null>(null)
    const [bookingsList, setBookingsList] = useState<any[] | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [transactionsLoading, setTransactionsLoading] = useState(false)
    const [transactionsError, setTransactionsError] = useState<string | null>(null)

    const loadRevenues = async (start?: string, end?: string) => {
        setRevLoading(true)
        setRevError(null)
        try {
            const res = await getRevenuesApi({ startDate: start, endDate: end })
            const items: MonthlyRevenue[] = (res as any)?.data ?? []
            setRawRevenues(items)
            // map to chart format: show month label as T{month}
            const mapped = items.map((it) => ({ month: `T${it.month}`, revenue: Number(it.totalRevenue || 0) }))
            setRevenueData(mapped.slice(0, 6).reverse())
            // also load bookings in the same date range (for overview)
            // convert YYYY-MM-DD to MM/DD/YYYY format for bookings API
            const formatDateForBookings = (dateStr?: string) => {
                if (!dateStr) return undefined
                const parts = dateStr.split('-')
                if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`
                return dateStr
            }
            try {
                const bk = await getBookingsApi({
                    page: 1,
                    size: 1000,
                    startDate: formatDateForBookings(start),
                    endDate: formatDateForBookings(end)
                })
                const bkItems = (bk as any)?.data?.items ?? []
                setBookingsList(bkItems)
                setBookingsCount(Array.isArray(bkItems) ? bkItems.length : 0)
            } catch (err) {
                console.warn('getBookingsApi failed', err)
                setBookingsList(null)
                setBookingsCount(null)
            }
        } catch (err) {
            console.error('getRevenuesApi', err)
            setRevError('Không thể tải doanh thu')
        } finally {
            setRevLoading(false)
        }
    }

    const loadTransactions = async () => {
        setTransactionsLoading(true)
        setTransactionsError(null)
        try {
            const res = await getTransactionsApi({ page: 1, size: 1000, sortBy: 'createdDate', isAsc: false })
            const items: Transaction[] = (res as any)?.data?.items ?? []
            const filtered = items.filter((tx) => {
                const typeKey = (tx.type || '').toLowerCase()
                if (!['boatyard', 'revenue'].includes(typeKey)) return false
                return true
            })
            console.log('loadTransactions filtered items:', filtered)
            console.log('Daily TX map should be:', filtered.map(tx => {
                const txDate = tx.createdDate ? new Date(tx.createdDate) : tx.lastModifiedDate ? new Date(tx.lastModifiedDate) : null
                if (!txDate) return null
                const dayKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(txDate.getDate()).padStart(2, '0')}`
                return { dayKey, amount: tx.amount }
            }))
            setTransactions(filtered)
        } catch (err) {
            console.error('loadTransactions error', err)
            setTransactionsError('Không thể tải giao dịch')
        } finally {
            setTransactionsLoading(false)
        }
    }

    useEffect(() => {
        // initial load with default dates
        loadRevenues(startDate, endDate)
        loadTransactions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const { monthlyNetByTx, dailyNetByTx } = useMemo(() => {
        const monthMap: Record<string, number> = {}
        const dayMap: Record<string, number> = {}
        transactions.forEach((tx) => {
            const txDate = tx.createdDate ? new Date(tx.createdDate) : tx.lastModifiedDate ? new Date(tx.lastModifiedDate) : null
            if (!txDate) return
            const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`
            const dayKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(txDate.getDate()).padStart(2, '0')}`
            const amt = Number(tx.amount || 0)
            monthMap[monthKey] = (monthMap[monthKey] || 0) + amt
            dayMap[dayKey] = (dayMap[dayKey] || 0) + amt
        })
        return { monthlyNetByTx: monthMap, dailyNetByTx: dayMap }
    }, [transactions])

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink >Xưởng sửa chữa</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Tổng quan</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Chào mừng trở lại!</h1>
                <p className="text-muted-foreground">Theo dõi doanh thu</p>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu</CardTitle>
                        <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Từ</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Đến</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div>
                                <Button onClick={() => {
                                    loadRevenues(startDate, endDate)
                                    loadTransactions()
                                }} disabled={revLoading}>
                                    {revLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Tải'}
                                </Button>
                                {bookingsCount !== null && (
                                    <div className="inline-flex items-center ml-3 text-sm text-muted-foreground">
                                        <span className="mr-2">Đơn hàng:</span>
                                        <Badge>{bookingsCount}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                        {revenueData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                Chưa có dữ liệu
                            </div>
                        )}
                        {revError && <div className="text-sm text-destructive mt-2">{revError}</div>}
                        {/* Detailed revenues table */}
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Chi tiết doanh thu</h4>
                            {transactionsLoading && <div className="text-xs text-muted-foreground mb-2">Đang tải giao dịch...</div>}
                            {transactionsError && <div className="text-xs text-destructive mb-2">{transactionsError}</div>}
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground">
                                        <th className="pb-2">Tháng</th>
                                        <th className="pb-2">Năm</th>
                                        <th className="pb-2 text-right">Tổng doanh thu</th>
                                        <th className="pb-2 text-right">Lợi nhuận ròng</th>
                                        <th className="pb-2 text-center">Đã chuyển</th>
                                        <th className="pb-2 text-center">Ngày chuyển</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawRevenues.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-3 text-muted-foreground">Chưa có dữ liệu</td>
                                        </tr>
                                    ) : rawRevenues.map((r, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="py-2">{`T${r.month}`}</td>
                                            <td className="py-2">{r.year}</td>
                                            <td className="py-2 text-right">{Number(r.totalRevenue).toLocaleString('vi-VN')} đ</td>
                                            <td className="py-2 text-right" title="Nếu chưa chuyển: lấy từ revenues; đã chuyển: lấy từ giao dịch (ưu tiên cùng ngày)">
                                                {(() => {
                                                    const monthKey = `${r.year}-${String(r.month).padStart(2, '0')}`
                                                    const transferDateKey = r.transferredDate ? (() => {
                                                        const d = new Date(r.transferredDate)
                                                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                                                    })() : null
                                                    const netFromTxDaily = transferDateKey ? Number(dailyNetByTx[transferDateKey] || 0) : 0
                                                    const netFromTxMonthly = Number(monthlyNetByTx[monthKey] || 0)
                                                    const netFromRevenue = Number(r.netRevenue ?? r.totalRevenue ?? 0)
                                                    const txValue = netFromTxDaily || netFromTxMonthly
                                                    const value = r.isTransferred ? (txValue || netFromRevenue) : netFromRevenue
                                                    return value.toLocaleString('vi-VN') + ' đ'
                                                })()}
                                            </td>
                                            <td className="py-2 text-center">
                                                {r.isTransferred ? (
                                                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-700 bg-emerald-500/10">
                                                        Đã chuyển
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-500/50 text-amber-700 bg-amber-500/10">
                                                        Chưa chuyển
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-2 text-center text-xs text-muted-foreground">
                                                {r.transferredDate ? new Date(r.transferredDate).toLocaleDateString('vi-VN') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Bookings detail table */}
                        {bookingsCount !== null && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold mb-2">Chi tiết đơn hàng ({bookingsCount})</h4>
                                {bookingsList && bookingsList.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr className="text-left text-xs text-muted-foreground">
                                                    <th className="p-2">Tàu</th>
                                                    <th className="p-2">Chủ tàu</th>
                                                    <th className="p-2">Bến đậu</th>
                                                    <th className="p-2">Thời gian vào</th>
                                                    <th className="p-2">Thời gian ra</th>
                                                    <th className="p-2 text-right">Tổng tiền</th>
                                                    <th className="p-2">Lợi nhuận ròng</th>
                                                    <th className="p-2">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookingsList.map((bk: any, idx: number) => (
                                                    <tr key={bk.id || idx} className="border-t hover:bg-muted/50">
                                                        <td className="p-2 font-medium">{bk.shipName || 'N/A'}</td>
                                                        <td className="p-2">
                                                            <div>{bk.shipOwnerName || 'N/A'}</div>
                                                            <div className="text-xs text-muted-foreground">{bk.shipOwnerPhoneNumber || ''}</div>
                                                        </td>
                                                        <td className="p-2">{bk.dockSlotName || 'N/A'}</td>
                                                        <td className="p-2">{bk.startTime ? new Date(bk.startTime).toLocaleString('vi-VN') : 'N/A'}</td>
                                                        <td className="p-2">{bk.endTime ? new Date(bk.endTime).toLocaleString('vi-VN') : 'N/A'}</td>
                                                        <td className="p-2 text-right">{Number(bk.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                                                        <td className="p-2 text-right" title={`Tổng tiền - Phí nền tảng (${commissionFeePercent}%)`}>{Number((bk.totalAmount || 0) * (1 - commissionFeePercent / 100)).toLocaleString('vi-VN')} đ</td>
                                                        <td className="p-2">
                                                            <Badge variant={renderBookingStatus(bk.status).variant}>
                                                                {renderBookingStatus(bk.status).label}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                                        Không có đơn hàng trong khoảng thời gian này
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <TransactionsList />
            </div>

        </div>
    )
}
