"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/common/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, ShoppingCart } from "lucide-react"
import { getProductByIdApi } from "@/api/Product/productApi"
import orderModel from '@/models/orderModel'
import { createOrderApi } from '@/api/Order/orderApi'
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
    const [shipIdInput, setShipIdInput] = useState<string>(orderModel.getShipId() || "")
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)

    const handleAddToCart = () => {
        if (!selectedVariantId) {
            window.alert('Vui lòng chọn biến thể trước khi thêm vào giỏ')
            return
        }

        orderModel.addItem({
            productVariantId: selectedVariantId,
            quantity,
            productOptionName: selectedVariantName,
        })

        window.alert('Đã thêm vào giỏ hàng')
    }

    const handleBuyNow = async () => {
        // prepare shipId
        const shipId = shipIdInput || orderModel.getShipId()
        if (!shipId) {
            window.alert('Vui lòng nhập `shipId` trước khi mua (hoặc lưu địa chỉ trong giỏ)')
            return
        }

        // build payload
        let payload = orderModel.buildCreateOrderRequest()
        if (!payload || payload.orderItems.length === 0) {
            if (!selectedVariantId) {
                window.alert('Chưa có sản phẩm để đặt hàng')
                return
            }
            payload = {
                shipId,
                orderItems: [
                    {
                        productVariantId: selectedVariantId,
                        quantity,
                        productOptionName: selectedVariantName,
                    },
                ],
            }
        } else {
            // ensure shipId is set
            payload.shipId = shipId
        }

        try {
            setIsPlacingOrder(true)
            // persist shipId in the model
            orderModel.setShipId(shipId)
            const res = await createOrderApi(payload)
            if (res && (res.status === 201 || res.status === 200)) {
                window.alert('Tạo đơn hàng thành công (ID: ' + (res.data?.id || '') + ')')
                orderModel.clear()
                // reset UI selections
                setSelectedVariantId(null)
                setSelectedVariantName(undefined)
                setQuantity(1)
                setShipIdInput('')
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

                                                        <div>
                                                            <label className="text-sm text-muted-foreground">ShipId (dùng để tạo đơn)</label>
                                                            <input
                                                                type="text"
                                                                value={shipIdInput}
                                                                onChange={(e) => setShipIdInput(e.target.value)}
                                                                placeholder="Nhập shipId hoặc để trống"
                                                                className="mt-1 w-full border rounded px-2 py-1"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <Button onClick={handleAddToCart} className="w-full">
                                                                <ShoppingCart className="mr-2 h-4 w-4" /> Thêm vào giỏ
                                                            </Button>
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
            </div>
        </div>
    )
}
