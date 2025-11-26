"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/common/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package } from "lucide-react"
import { getProductByIdApi } from "@/api/Product/productApi"
// orderModel removed from this page — no cart flow here
import { createOrderApi } from '@/api/Order/orderApi'
import { createPaymentApi } from '@/api/payment/paymentApi'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import type { CreateOrderRequest } from '@/types/Order/order'

import type { Product } from "@/types/Product/product"

export default function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [product, setProduct] = useState<Product | null>(null)
    const [mainImageIndex, setMainImageIndex] = useState(0)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
    const [selectedVariantName, setSelectedVariantName] = useState<string | undefined>(undefined)
    const [quantity, setQuantity] = useState<number>(1)
    // shipId removed — orders created without shipId from this page
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [orderPreview, setOrderPreview] = useState<CreateOrderRequest | null>(null)
    const [paymentAddress, setPaymentAddress] = useState<string>('')

    // No add-to-cart on this page; direct buy only

    const handleBuyNow = async () => {
        // Open modal for confirmation instead of immediate order creation
        // Build payload from the currently selected variant only
        if (!selectedVariantId) {
            window.alert('Vui lòng chọn biến thể trước khi đặt hàng')
            return
        }
        const payload: CreateOrderRequest = {
            orderItems: [
                {
                    productVariantId: selectedVariantId,
                    quantity,
                    productOptionName: selectedVariantName,
                },
            ],
        }

        // store preview and show modal
        setOrderPreview(payload)
        setShowOrderModal(true)
    }

    const confirmCreateOrder = async () => {
        if (!orderPreview) return
        try {
            setIsPlacingOrder(true)
            // create order directly from preview
            const res = await createOrderApi(orderPreview)
            if (res && (res.status === 201 || res.status === 200)) {
                const orderId = res.data?.id
                // call payment API (best-effort) — require address
                try {
                    if (!paymentAddress || !paymentAddress.trim()) {
                        window.alert('Vui lòng nhập địa chỉ giao hàng trước khi thanh toán')
                        setIsPlacingOrder(false)
                        return
                    }
                    const payRes = await createPaymentApi({ id: orderId ?? '', type: 'Supplier', address: paymentAddress })
                    // If API returns a checkout URL, navigate there
                    const checkoutUrl = payRes?.data?.checkoutUrl || payRes?.data?.checkout_url || payRes?.data?.checkoutUrl
                    if (checkoutUrl) {
                        // open in new tab to preserve app state
                        window.open(checkoutUrl, '_blank')
                        // optionally navigate user within app or show success message
                    }
                } catch (payErr) {
                    console.error('Payment API error', payErr)
                }

                window.alert('Tạo đơn hàng thành công (ID: ' + (orderId || '') + ')')
                // no cart to clear on this page
                setSelectedVariantId(null)
                setSelectedVariantName(undefined)
                setQuantity(1)
                // shipId removed
                setShowOrderModal(false)
            } else {
                window.alert('Tạo đơn hàng thất bại: ' + (res?.message || 'Không xác định'))
            }
        } catch (err: any) {
            console.error('Order error', err)
            const message = err?.message || err?.response?.data?.message || 'Lỗi khi tạo đơn hàng'
            window.alert(message)
        } finally {
            setIsPlacingOrder(false)
        }
    }

    useEffect(() => {
        if (!id) return

        const load = async () => {
            try {
                setIsLoading(true)
                setError("")
                const res = await getProductByIdApi(id)
                if (res?.status === 200 && res.data) {
                    setProduct(res.data as Product)
                } else {
                    setError(res?.message || "Không thể tải thông tin sản phẩm")
                }
            } catch (err: any) {
                console.error(err)
                const message = err?.message || err?.response?.data?.message || "Lỗi khi tải thông tin sản phẩm"
                setError(message)
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [id])

    const images = product?.productImages && product.productImages.length > 0
        ? product.productImages
        : [{ id: 'placeholder', imageUrl: product?.imageUrl || '/placeholder.svg' }]

    const priceText = (() => {
        if (!product) return ''
        const variants = product.productVariants || []
        if (variants.length === 0) return 'Liên hệ'
        const prices = variants.map(v => v.price ?? 0).sort((a, b) => a - b)
        if (prices[0] === prices[prices.length - 1]) {
            return new Intl.NumberFormat('vi-VN').format(prices[0]) + ' VND'
        }
        return `${new Intl.NumberFormat('vi-VN').format(prices[0])} - ${new Intl.NumberFormat('vi-VN').format(prices[prices.length - 1])} VND`
    })()

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-8 px-4">
                <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && product && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Images */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                                <img
                                    src={images[mainImageIndex].imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto py-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        aria-label={`Xem ảnh ${idx + 1}`}
                                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${idx === mainImageIndex ? 'border-primary' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                        onClick={() => setMainImageIndex(idx)}
                                    >
                                        <img src={img.imageUrl} alt={`${product.name}-${idx}`} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Details & Actions (sticky on large screens) */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-semibold leading-tight">{product.name}</h2>
                                                    <div className="mt-2 flex items-center gap-3">
                                                        <Badge variant="outline">{product.categoryName}</Badge>
                                                        <span className="text-sm text-muted-foreground">Bởi <span className="font-medium">{product.supplierName}</span></span>
                                                    </div>
                                                </div>
                                                <div className="hidden lg:flex flex-col items-end text-right">
                                                    <div className="text-muted-foreground text-sm">Giá</div>
                                                    <div className="text-xl font-semibold text-foreground">{priceText}</div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {product.description && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                                                )}

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div>Ngày tạo: <span className="text-foreground font-medium">{new Date(product.createdDate).toLocaleDateString()}</span></div>
                                                    <div>Cập nhật: <span className="text-foreground font-medium">{new Date(product.lastModifiedDate).toLocaleDateString()}</span></div>
                                                </div>

                                                <Separator />

                                                {product.productVariants && product.productVariants.length > 0 ? (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Các biến thể</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {product.productVariants.map((v) => {
                                                                const selected = selectedVariantId === v.id
                                                                return (
                                                                    <button
                                                                        key={v.id}
                                                                        onClick={() => { setSelectedVariantId(v.id); setSelectedVariantName(v.name); setQuantity(1) }}
                                                                        className={`w-full text-left p-3 border rounded-md flex items-center justify-between ${selected ? 'border-primary bg-primary/5' : ''}`}
                                                                    >
                                                                        <div>
                                                                            <div className="font-medium">{v.name}</div>
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">{new Intl.NumberFormat('vi-VN').format(v.price)} VND</div>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">Không có biến thể</div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="sticky top-24">
                                        <Card>
                                            <CardContent>
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Nhà cung cấp</div>
                                                        <div className="font-medium text-foreground">{product.supplierName}</div>
                                                    </div>

                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Giá</div>
                                                        <div className="text-lg font-semibold">{priceText}</div>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <div>
                                                            <label className="text-sm text-muted-foreground">Số lượng</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={quantity}
                                                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                                                                className="mt-1 w-full border rounded px-2 py-1"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <Button variant="outline" onClick={handleBuyNow} className="w-full" disabled={isPlacingOrder}>
                                                                {isPlacingOrder ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Package className="mr-2 h-4 w-4" />} Mua ngay
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showOrderModal && orderPreview && (
                    <AlertDialog open={showOrderModal} onOpenChange={(o) => setShowOrderModal(o)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận đơn hàng</AlertDialogTitle>
                                <AlertDialogDescription>Kiểm tra thông tin đơn hàng trước khi xác nhận.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-muted-foreground">Địa chỉ giao hàng (bắt buộc)</label>
                                    <Input
                                        value={paymentAddress}
                                        onChange={(e) => setPaymentAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ giao hàng"
                                    />
                                </div>
                                <div className="text-sm">Số lượng mục: <span className="font-medium">{orderPreview.orderItems.length}</span></div>
                                <div className="text-sm">Tổng số lượng: <span className="font-medium">{orderPreview.orderItems.reduce((s, it) => s + (it.quantity || 0), 0)}</span></div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmCreateOrder}>
                                    {isPlacingOrder ? 'Đang xử lý...' : 'Xác nhận và thanh toán'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    )
}
