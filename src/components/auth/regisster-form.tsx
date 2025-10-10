"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Hammer, MapPin, ChevronRight, ChevronLeft, Calendar, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { BoatyardRequest, DockSlot } from "@/types/boatyard"
import type { OtpRequest } from "@/models/Auth"
import { authApi } from "@/api/authApi"
import { createBoatyardApi } from "@/api/boatyardApi/boatyardApi"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { MapComponent } from "../map/MapComponent"

type BoatyardFormData = Omit<BoatyardRequest, "otp" | "dockSlots">

const STEPS = [
    { id: 1, title: "Thông tin cơ bản", description: "Tài khoản và xác thực" },
    { id: 2, title: "Thông tin liên hệ", description: "Địa chỉ và vị trí" },
    { id: 3, title: "Quản lý Dock", description: "Cấu hình bến đỗ" },
]

export function BoatyardRegisterForm() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [otpLoading, setOtpLoading] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const [formData, setFormData] = useState<BoatyardFormData>({
        name: "",
        username: "",
        email: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        latitude: "",
        longitude: "",
        avatar: undefined,
    })

    const [dockSlots, setDockSlots] = useState<DockSlot[]>([])

    // Countdown for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const formatDateTimeForDisplay = (iso?: string) => {
        if (!iso) return ""
        try {
            const date = new Date(iso)
            return format(date, "dd/MM/yyyy HH:mm", { locale: vi })
        } catch {
            return ""
        }
    }

    const isoToDatetimeLocal = (iso?: string) => {
        if (!iso) return ""
        const d = new Date(iso)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        const hh = String(d.getHours()).padStart(2, "0")
        const min = String(d.getMinutes()).padStart(2, "0")
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`
    }

    const localDatetimeToIso = (local: string) => {
        if (!local) return ""
        const d = new Date(local)
        return d.toISOString()
    }

    const handleLocationSelect = (lat: string, lng: string, address: string) => {
        setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address,
        }))
    }

    const handleSendOTP = async () => {
        setOtpLoading(true)
        setError("")
        setSuccess("")
        if (!formData.email.includes("@") || !formData.email.includes(".")) {
            setError("Email không hợp lệ")
            setOtpLoading(false)
            return
        }
        try {
            const payload: OtpRequest = { email: formData.email }
            const res = await authApi.sendOtp(payload)
            if (res.status === 201) {
                setOtpSent(true)
                setSuccess("Mã OTP đã được gửi đến email của bạn")
                setCountdown(360) // 3 phút
            } else {
                setError(res.message || "Lỗi khi gửi OTP")
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.message || "Lỗi kết nối mạng"
            setError(message)
        }
        setOtpLoading(false)
    }

    const addDockSlot = () => {
        setDockSlots((prev) => [...prev, { name: "", assignedFrom: "", assignedUntil: "" }])
    }

    const removeDockSlot = (index: number) => {
        setDockSlots((prev) => prev.filter((_, i) => i !== index))
    }

    const updateDockSlotField = (index: number, field: keyof DockSlot, value: string) => {
        setDockSlots((prev) => {
            const copy = [...prev]
            copy[index] = { ...copy[index], [field]: value }
            return copy
        })
    }

    const validateStep = (step: number): boolean => {
        setError("")

        if (step === 1) {
            if (!formData.name.trim()) {
                setError("Tên xưởng không được để trống")
                return false
            }
            if (!formData.username.trim()) {
                setError("Tên đăng nhập không được để trống")
                return false
            }
            if (!formData.email.includes("@") || !formData.email.includes(".")) {
                setError("Email không hợp lệ")
                return false
            }
            if (formData.password.length < 6) {
                setError("Mật khẩu phải có ít nhất 6 ký tự")
                return false
            }
            if (!otpSent) {
                setError("Bạn cần lấy OTP trước khi tiếp tục!")
                return false
            }
            if (otp.length !== 4) {
                setError("Vui lòng nhập mã OTP 4 số!")
                return false
            }
        }

        if (step === 2) {
            if (!formData.fullName.trim()) {
                setError("Họ và tên không được để trống")
                return false
            }
            if (!formData.phoneNumber.trim()) {
                setError("Số điện thoại không được để trống")
                return false
            }
            if (!formData.address.trim()) {
                setError("Địa chỉ không được để trống")
                return false
            }
            if (!formData.latitude.trim() || isNaN(Number(formData.latitude))) {
                setError("Vĩ độ phải là số hợp lệ")
                return false
            }
            if (!formData.longitude.trim() || isNaN(Number(formData.longitude))) {
                setError("Kinh độ phải là số hợp lệ")
                return false
            }
        }

        if (step === 3) {
            for (let i = 0; i < dockSlots.length; i++) {
                const s = dockSlots[i]
                if (!s.name.trim()) {
                    setError(`Dock #${i + 1}: tên không được để trống`)
                    return false
                }
                if (s.assignedFrom && isNaN(Date.parse(s.assignedFrom))) {
                    setError(`Dock #${i + 1}: thời gian bắt đầu không hợp lệ`)
                    return false
                }
                if (s.assignedUntil && isNaN(Date.parse(s.assignedUntil))) {
                    setError(`Dock #${i + 1}: thời gian kết thúc không hợp lệ`)
                    return false
                }
            }
        }

        return true
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
        }
    }

    const handlePrevious = () => {
        setError("")
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const registerBoatyard = async (otp: string) => {
        try {
            const boatyardData: BoatyardRequest = {
                ...formData,
                otp,
                avatar: formData.avatar ?? null,
                dockSlots: dockSlots.map((s) => ({
                    name: s.name,
                    assignedFrom: s.assignedFrom,
                    assignedUntil: s.assignedUntil,
                })),
            }
            const res = await createBoatyardApi(boatyardData)
            if (res.status === 201 || res.status === 201) {
                return { success: true, data: res.data }
            } else {
                return { success: false, error: res.message || "Lỗi khi đăng ký" }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.message || "Lỗi kết nối mạng"
            return { success: false, error: message }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateStep(3)) {
            return
        }

        setIsLoading(true)
        setError("")
        setSuccess("")

        const result = await registerBoatyard(otp)
        if (result.success) {
            setSuccess("Đăng ký xưởng thành công! Đang chuyển hướng...")
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } else {
            setError(result.error || "Có lỗi xảy ra")
        }
        setIsLoading(false)
    }

    const progressPercentage = (currentStep / STEPS.length) * 100

    return (
        <div className="max-w-4xl mx-auto ">
            <div className="text-center ">
                <div className="flex items-center justify-center ">
                    <Hammer className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">Đăng ký Xưởng sửa chữa</h1>
                </div>
                <p className="text-muted-foreground">
                    Tham gia hệ thống Marine Bridge với tư cách Xưởng sửa chữa chuyên nghiệp
                </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 ">
                <div className="flex justify-between text-sm">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`flex-1 text-center ${step.id === currentStep
                                ? "text-primary font-semibold"
                                : step.id < currentStep
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                                }`}
                        >
                            <div className="mb-1">Bước {step.id}</div>
                            <div className="text-xs">{step.title}</div>
                        </div>
                    ))}
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                    <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Tên xưởng *</Label>
                                        <Input
                                            id="name"
                                            placeholder="VD: Xưởng sửa chữa Hải Phòng"
                                            value={formData.name}
                                            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Tên đăng nhập *</Label>
                                        <Input
                                            id="username"
                                            placeholder="VD: haiphong_boatyard"
                                            value={formData.username}
                                            onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                            required
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSendOTP}
                                            disabled={otpLoading || !formData.email || countdown > 0}
                                            className="whitespace-nowrap bg-transparent"
                                        >
                                            {otpLoading
                                                ? "Đang gửi..."
                                                : countdown > 0
                                                    ? `Gửi lại (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")})`
                                                    : otpSent
                                                        ? "Gửi lại"
                                                        : "Lấy OTP"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Mã OTP *</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Nhập 4 số"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            maxLength={4}
                                            required
                                            className="text-center text-2xl tracking-[0.5em] font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mật khẩu *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Tối thiểu 6 ký tự"
                                                value={formData.password}
                                                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Ảnh đại diện (tùy chọn)</Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) setFormData((p) => ({ ...p, avatar: file }))
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Contact & Location */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên *</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="0123456789"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Chọn vị trí trên bản đồ
                                    </Label>
                                    <div className="rounded-lg overflow-hidden border">
                                        <MapComponent onLocationSelect={handleLocationSelect} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        value={formData.address}
                                        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Vĩ độ (Latitude) *</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            placeholder="10.762622"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Kinh độ (Longitude) *</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            placeholder="106.660172"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Dock Slots */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Quản lý Dock Slots</h3>
                                        <p className="text-sm text-muted-foreground">Thêm các bến đỗ và thời gian sử dụng (tùy chọn)</p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={addDockSlot}>
                                        + Thêm Dock
                                    </Button>
                                </div>

                                {dockSlots.length === 0 && (
                                    <Card className="border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                            <Hammer className="h-12 w-12 text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground mb-2">Chưa có Dock nào</p>
                                            <p className="text-sm text-muted-foreground">Nhấn "Thêm Dock" để thêm bến đỗ mới</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="space-y-4">
                                    {dockSlots.map((slot, idx) => (
                                        <Card key={idx} className="border-l-4 border-l-primary">
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-semibold text-lg">Dock #{idx + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeDockSlot(idx)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Tên Dock *</Label>
                                                        <Input
                                                            value={slot.name}
                                                            onChange={(e) => updateDockSlotField(idx, "name", e.target.value)}
                                                            placeholder="VD: Dock A1, Bến số 1"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                Thời gian bắt đầu
                                                            </Label>
                                                            <Input
                                                                type="datetime-local"
                                                                value={isoToDatetimeLocal(slot.assignedFrom)}
                                                                onChange={(e) =>
                                                                    updateDockSlotField(idx, "assignedFrom", localDatetimeToIso(e.target.value))
                                                                }
                                                                className="text-sm"
                                                            />
                                                            {slot.assignedFrom && (
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDateTimeForDisplay(slot.assignedFrom)}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                Thời gian kết thúc
                                                            </Label>
                                                            <Input
                                                                type="datetime-local"
                                                                value={isoToDatetimeLocal(slot.assignedUntil)}
                                                                onChange={(e) =>
                                                                    updateDockSlotField(idx, "assignedUntil", localDatetimeToIso(e.target.value))
                                                                }
                                                                className="text-sm"
                                                            />
                                                            {slot.assignedUntil && (
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDateTimeForDisplay(slot.assignedUntil)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button type="button" onClick={handleNext}>
                                    Tiếp theo
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}