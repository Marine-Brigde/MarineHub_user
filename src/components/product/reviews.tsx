"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, User, ChevronDown } from "lucide-react"
import { getProductReviewsApi, createProductReviewApi } from "@/api/Product/reviewApi"
import { getBoatyardDetailApi } from "@/api/boatyardApi/boatyardApi"
import type { Review } from "@/types/Product/review"
import { useToast } from "@/hooks/use-toast"

type Props = {
    productId: string
    productBoatyardId?: string | null
    productAccountId?: string | null
}

export default function ProductReviews({ productId, productBoatyardId, productAccountId }: Props) {
    const { toast } = useToast()
    const [reviews, setReviews] = useState<Review[]>([])
    const [displayedReviews, setDisplayedReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isOwnBoatyard, setIsOwnBoatyard] = useState(false)
    const [boatAccountId, setBoatAccountId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)

    const [newRating, setNewRating] = useState<number>(5)
    const [newComment, setNewComment] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)

    const REVIEWS_PER_PAGE = 5

    useEffect(() => {
        setLoading(true)
        setError(null)
        Promise.all([getProductReviewsApi(productId), getBoatyardDetailApi()])
            .then(([reviewsRes, boatRes]) => {
                try {
                    const items = (reviewsRes as any)?.data?.items ?? []
                    const mapped: Review[] = items.map((it: any) => ({
                        id: it.id,
                        productId: it.productId,
                        productName: it.productName,
                        userId: it.accountId || it.userId,
                        userName: it.accountName || it.userName || it.userName,
                        userAvatar: it.userAvatar || it.avatar,
                        rating: it.rating ?? it.star ?? 0,
                        comment: it.comment ?? it.content ?? "",
                        createdAt: it.createdDate || it.createdAt || new Date().toISOString(),
                    }))
                    setReviews(mapped)
                    updateDisplayedReviews(mapped, 1)
                } catch {
                    setReviews([])
                }
                try {
                    const boat = (boatRes as any)?.data
                    if (boat) {
                        const boatId = boat.id
                        const boatAcc = boat.accountId || boat.accountID || boat.account
                        setBoatAccountId(boatAcc ?? null)
                        if (
                            (productBoatyardId && productBoatyardId === boatId) ||
                            (productAccountId && productAccountId === boatAcc)
                        ) {
                            setIsOwnBoatyard(true)
                        } else {
                            setIsOwnBoatyard(false)
                        }
                    }
                } catch {
                    setIsOwnBoatyard(false)
                    setBoatAccountId(null)
                }
            })
            .catch((err) => {
                console.error("load reviews / boatyard", err)
                setError("Không thể tải đánh giá")
            })
            .finally(() => setLoading(false))
    }, [productId, productBoatyardId, productAccountId])

    const updateDisplayedReviews = (allReviews: Review[], page: number) => {
        const startIdx = (page - 1) * REVIEWS_PER_PAGE
        const endIdx = startIdx + REVIEWS_PER_PAGE
        setDisplayedReviews(allReviews.slice(0, endIdx))
        setHasMore(endIdx < allReviews.length)
        setCurrentPage(page)
    }

    const handleLoadMore = () => {
        const nextPage = currentPage + 1
        updateDisplayedReviews(reviews, nextPage)
    }

    const avgRating = () => {
        if (!reviews || reviews.length === 0) return null
        const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0)
        return (sum / reviews.length).toFixed(1)
    }

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviews.forEach((r) => {
            const rating = Math.min(5, Math.max(1, r.rating))
            distribution[rating as keyof typeof distribution]++
        })
        return distribution
    }

    const handleSubmitReview = async () => {
        if (submitting) return
        setSubmitting(true)
        setReviewError(null)
        try {
            await createProductReviewApi(productId, { rating: newRating, comment: newComment })
            const refreshed = await getProductReviewsApi(productId)
            const items = (refreshed as any)?.data?.items ?? []
            const mapped: Review[] = items.map((it: any) => ({
                id: it.id,
                productId: it.productId,
                productName: it.productName,
                userId: it.accountId || it.userId,
                userName: it.accountName || it.userName,
                userAvatar: it.userAvatar || it.avatar,
                rating: it.rating ?? it.star ?? 0,
                comment: it.comment ?? it.content ?? "",
                createdAt: it.createdDate || it.createdAt || new Date().toISOString(),
            }))
            setReviews(mapped)
            setNewRating(5)
            setNewComment("")
            setShowForm(false)
        } catch (err: any) {
            console.error("create review failed", err)
            // Check for 400 status error = user hasn't purchased the product
            const statusCode = err?.response?.status || err?.response?.data?.status
            if (statusCode === 400) {
                const errorMsg = "Bạn chưa mua sản phẩm này nên không thể đánh giá"
                setReviewError(errorMsg)
                toast({
                    title: "Không thể đánh giá",
                    description: errorMsg,
                    variant: "destructive",
                })
            } else {
                // Get detailed message from API response - try data first, then message
                let errorMsg = "Không thể tạo đánh giá"
                if (err?.response?.data?.data) {
                    errorMsg = err.response.data.data
                } else if (err?.response?.data?.message) {
                    errorMsg = err.response.data.message
                } else if (err?.message) {
                    errorMsg = err.message
                }
                setReviewError(errorMsg)
                toast({
                    title: "Lỗi",
                    description: errorMsg,
                    variant: "destructive",
                })
            }
            // Keep form open to show error message
            setShowForm(true)
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                    />
                ))}
            </div>
        )
    }

    return (
        <Card className="border-0 bg-gradient-to-br from-background to-background/95">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">Đánh giá khách hàng</CardTitle>
                    </div>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={
                                            i < Math.round(Number(avgRating() || 0))
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-muted-foreground/20"
                                        }
                                    />
                                ))}
                            </div>
                            <span className="font-semibold text-sm text-amber-900 dark:text-amber-100">{avgRating()}</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="inline-block animate-spin mb-2">⏳</div>
                            <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Rating Summary */}
                        {reviews.length > 0 && (
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <div className="text-xs text-muted-foreground font-medium mb-3">
                                    {reviews.length} đánh giá từ khách hàng
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const distribution = getRatingDistribution()
                                        const count = distribution[rating as keyof typeof distribution]
                                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                                        return (
                                            <div key={rating} className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 w-12 text-xs">
                                                    <span className="font-medium">{rating}</span>
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                </div>
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${percentage}%` }} />
                                                </div>
                                                <div className="text-xs text-muted-foreground w-12 text-right">{count}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {reviews.length === 0 && (
                            <div className="text-xs text-muted-foreground font-medium">Chưa có đánh giá nào</div>
                        )}

                        {/* Review Form Section */}
                        {!isOwnBoatyard && (
                            <>
                                {reviewError && (
                                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-destructive">{reviewError}</p>
                                    </div>
                                )}
                                {!showForm ? (
                                    <Button onClick={() => { setShowForm(true); setReviewError(null) }} variant="outline" className="w-full h-10 border-dashed">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Viết đánh giá của bạn
                                    </Button>
                                ) : (
                                    <div className="space-y-3 p-4 bg-muted/40 rounded-lg border border-border/50">
                                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                                                    Xếp hạng của bạn:
                                                </span>
                                                <div className="flex gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={18}
                                                            className={i < newRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-amber-900 dark:text-amber-100">{newRating}/5</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-foreground mb-2 block">Chọn sao</label>
                                            <div className="flex gap-1">
                                                {[5, 4, 3, 2, 1].map((rating) => (
                                                    <button
                                                        key={rating}
                                                        onClick={() => setNewRating(rating)}
                                                        className="group cursor-pointer transition-transform hover:scale-110"
                                                    >
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={24}
                                                                className={`${i < rating
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-muted-foreground/30 group-hover:text-amber-400/50"
                                                                    } transition-colors`}
                                                            />
                                                        ))}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-foreground mb-2 block">Nhận xét của bạn</label>
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                                                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSubmitReview}
                                                disabled={submitting || !newComment.trim()}
                                                size="sm"
                                                className="flex-1"
                                            >
                                                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                                            </Button>
                                            <Button onClick={() => { setShowForm(false); setReviewError(null) }} variant="outline" size="sm" className="flex-1">
                                                Hủy
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {isOwnBoatyard && (
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs text-blue-700 dark:text-blue-200">
                                    ℹ️ Bạn là chủ xưởng của sản phẩm này nên không thể tự đánh giá.
                                </p>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {displayedReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors bg-card/50 hover:bg-card/80"
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                                        {review.userAvatar ? (
                                                            <img
                                                                src={review.userAvatar || "/placeholder.svg"}
                                                                alt={review.userName}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm text-foreground">
                                                                    {review.userName || "Người dùng"}
                                                                </span>
                                                                {review.userId && boatAccountId && review.userId === boatAccountId && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Chủ xưởng
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {renderStars(review.rating)}
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLoadMore}
                                            className="gap-2 bg-transparent"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                            Xem thêm ({reviews.length - displayedReviews.length} đánh giá còn lại)
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
