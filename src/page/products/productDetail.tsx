"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Package } from "lucide-react"
import Header from "@/components/common/header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { getProductByIdApi } from "@/api/Product/productApi"
import { createOrderApi } from "@/api/Order/orderApi"
import { createPaymentApi } from "@/api/payment/paymentApi"
import type { CreateOrderRequest } from "@/types/Order/order"
import type { Product } from "@/types/Product/product"

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [product, setProduct] = useState<Product | null>(null)
    const [mainImageIndex, setMainImageIndex] = useState(0)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
    const [selectedVariantName, setSelectedVariantName] = useState<string | undefined>(undefined)
    const [quantity, setQuantity] = useState<number>(1)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [orderPreview, setOrderPreview] = useState<CreateOrderRequest | null>(null)
    const [paymentAddress, setPaymentAddress] = useState<string>("")

    useEffect(() => {
        if (product?.productVariants && product.productVariants.length > 0 && !selectedVariantId) {
            const firstVariant = product.productVariants[0]
            setSelectedVariantId(firstVariant.id)
            setSelectedVariantName(firstVariant.name)
        }
    }, [product])

    const handleBuyNow = async () => {
        if (!selectedVariantId) {
            window.alert("Vui lòng chọn biến thể trước khi đặt hàng")
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
        setOrderPreview(payload)
        setShowOrderModal(true)
    }

    const confirmCreateOrder = async () => {
        if (!orderPreview) return
        try {
            setIsPlacingOrder(true)
            const res = await createOrderApi(orderPreview)
            if (res && (res.status === 201 || res.status === 200)) {
                const orderId = res.data?.id
                try {
                    if (!paymentAddress || !paymentAddress.trim()) {
                        window.alert("Vui lòng nhập địa chỉ giao hàng trước khi thanh toán")
                        setIsPlacingOrder(false)
                        return
                    }
                    const payRes = await createPaymentApi({ id: orderId ?? "", type: "Supplier", address: paymentAddress })
                    const checkoutUrl = payRes?.data?.checkoutUrl || payRes?.data?.checkout_url
                    if (checkoutUrl) {
                        window.open(checkoutUrl, "_blank")
                    }
                } catch (payErr) {
                    console.error("Payment API error", payErr)
                }

                window.alert("Tạo đơn hàng thành công (ID: " + (orderId || "") + ")")
                setSelectedVariantId(null)
                setSelectedVariantName(undefined)
                setQuantity(1)
                setShowOrderModal(false)
            } else {
                window.alert("Tạo đơn hàng thất bại: " + (res?.message || "Không xác định"))
            }
        } catch (err: any) {
            console.error("Order error", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tạo đơn hàng"
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

    const images =
        product?.productImages && product.productImages.length > 0
            ? product.productImages
            : [{ id: "placeholder", imageUrl: product?.imageUrl || "/placeholder.svg" }]

    const currentVariant = product?.productVariants?.find((v) => v.id === selectedVariantId)
    const currentPrice = currentVariant?.price ?? 0

    const priceText = (() => {
        if (!product) return ""
        const variants = product.productVariants || []
        if (variants.length === 0) return "Liên hệ"
        const prices = variants.map((v) => v.price ?? 0).sort((a, b) => a - b)
        if (prices[0] === prices[prices.length - 1]) {
            return new Intl.NumberFormat("vi-VN").format(prices[0]) + " VND"
        }
        return `${new Intl.NumberFormat("vi-VN").format(prices[0])} - ${new Intl.NumberFormat("vi-VN").format(prices[prices.length - 1])} VND`
    })()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Đang tải...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto py-12 px-4">
                    <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                    <Card className="border-destructive">
                        <CardContent className="pt-8 text-center">
                            <div className="text-destructive mb-2 text-lg font-medium">{error}</div>
                            <Button onClick={() => navigate(-1)} className="mt-4">
                                Về lại trang trước
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-4 px-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>

                {product && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <div className="space-y-3">
                                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted border border-border">
                                    <img
                                        src={images[mainImageIndex].imageUrl || "/placeholder.svg"}
                                        alt={product.name}
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                                        }}
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={img.id}
                                            aria-label={`Xem ảnh ${idx + 1}`}
                                            className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${idx === mainImageIndex ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                                                } focus:outline-none focus:ring-2 focus:ring-primary`}
                                            onClick={() => setMainImageIndex(idx)}
                                        >
                                            <img
                                                src={img.imageUrl || "/placeholder.svg"}
                                                alt={`${product.name}-${idx}`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">{product.name}</h1>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {product.categoryName}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Từ <span className="font-semibold text-foreground">{product.supplierName}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                                    <div className="text-xs text-muted-foreground mb-1">Giá</div>
                                    <div className="text-2xl font-bold text-primary">
                                        {currentPrice > 0 ? new Intl.NumberFormat("vi-VN").format(currentPrice) : priceText}
                                        <span className="text-sm ml-1">VND</span>
                                    </div>
                                </div>

                                {product.description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                                    </div>
                                )}

                                <Separator className="my-2" />

                                {product.productVariants && product.productVariants.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2 text-sm">Chọn biến thể</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {product.productVariants.map((v) => {
                                                const selected = selectedVariantId === v.id
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => {
                                                            setSelectedVariantId(v.id)
                                                            setSelectedVariantName(v.name)
                                                            setQuantity(1)
                                                        }}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left group text-sm ${selected
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50 hover:bg-secondary/30"
                                                            }`}
                                                    >
                                                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {v.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {new Intl.NumberFormat("vi-VN").format(v.price)} VND
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-1">
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Số lượng</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-2 py-1 border border-border rounded-md hover:bg-secondary transition-colors text-sm"
                                                aria-label="Giảm số lượng"
                                            >
                                                −
                                            </button>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                                                className="flex-1 text-center h-8 text-sm"
                                            />
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-2 py-1 border border-border rounded-md hover:bg-secondary transition-colors text-sm"
                                                aria-label="Tăng số lượng"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleBuyNow}
                                        disabled={isPlacingOrder}
                                        size="sm"
                                        className="w-full bg-primary hover:bg-primary/90 h-10 text-sm font-semibold"
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <Package className="mr-2 h-4 w-4" />
                                                Mua ngay
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showOrderModal && orderPreview && (
                    <AlertDialog open={showOrderModal} onOpenChange={(o) => setShowOrderModal(o)}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg">Xác nhận đơn hàng</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                    Kiểm tra thông tin và nhập địa chỉ giao hàng
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-3 py-4">
                                <div className="bg-muted/50 rounded-lg p-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Số lượng mục:</span>
                                        <span className="font-medium">{orderPreview.orderItems.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Tổng số lượng:</span>
                                        <span className="font-medium">
                                            {orderPreview.orderItems.reduce((s, it) => s + (it.quantity || 0), 0)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground mb-1 block">Địa chỉ giao hàng (bắt buộc)</label>
                                    <Input
                                        value={paymentAddress}
                                        onChange={(e) => setPaymentAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ giao hàng"
                                        className="w-full text-sm h-8"
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-xs h-8">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmCreateOrder}
                                    disabled={isPlacingOrder || !paymentAddress.trim()}
                                    className="bg-primary hover:bg-primary/90 text-xs h-8"
                                >
                                    {isPlacingOrder ? "Đang xử lý..." : "Xác nhận"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    )
}
