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
import { useToast } from "@/hooks/use-toast"

type BoatyardFormData = Omit<BoatyardRequest, "otp" | "dockSlots">

const STEPS = [
    { id: 1, title: "Thông tin cơ bản", description: "Tài khoản và xác thực" },
    { id: 2, title: "Thông tin liên hệ", description: "Địa chỉ và vị trí" },
    { id: 3, title: "Quản lý Dock", description: "Cấu hình bến đỗ" },
]

const BANKS = [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Techcombank",
    "ACB",
    "MB Bank",
    "Agribank",
    "Sacombank",
]

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

const extractServerMessage = (body: unknown): string => {
    if (!body) return ""
    if (typeof body === "string") return body
    if (isRecord(body)) {
        if (typeof body.data === "string") return body.data
        if (typeof body.message === "string") return body.message
        if (isRecord(body.data) && typeof (body.data as Record<string, unknown>).message === "string")
            return (body.data as Record<string, unknown>).message as string
        if (isRecord(body.data) && typeof (body.data as Record<string, unknown>).error === "string")
            return (body.data as Record<string, unknown>).error as string
        if (typeof body.error === "string") return body.error
    }
    return ""
}

const getErrorMessage = (err: unknown): string => {
    if (!err) return "Lỗi kết nối mạng"
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message || "Lỗi"
    if (isRecord(err)) {
        const response = (err as Record<string, unknown>).response
        const candidate = response ?? err
        const msg = extractServerMessage(candidate)
        if (msg) return msg
        if (typeof (err as Record<string, unknown>).message === "string")
            return (err as Record<string, unknown>).message as string
    }
    try {
        return JSON.stringify(err)
    } catch {
        return "Lỗi không xác định"
    }
}

export function BoatyardRegisterForm() {
    const navigate = useNavigate()
    const { toast } = useToast()
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
        bankName: undefined,
        bankNo: undefined,
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
        // eslint-disable-next-line no-console
        console.debug('[Register] handleSendOTP, email=', formData.email)
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
            const res = (await authApi.sendOtp(payload)) as unknown
            const r = isRecord(res) ? res : {}
            const httpStatus = typeof r.status === "number" ? (r.status as number) : undefined
            const body = isRecord(res) && "data" in res ? (r.data ?? r) : res
            const msg = extractServerMessage(body) || "Đã gửi OTP"

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (httpStatus === 201 || httpStatus === 200 || (isRecord(body) && ((body as any).status === 201 || (body as any).status === 200))) {
                setOtpSent(true)
                setSuccess(msg)
                setCountdown(180) // 3 phút
                toast({
                    title: "Thành công",
                    description: msg,
                    variant: "success",
                })
            } else {
                const errMsg = msg || "Lỗi khi gửi OTP"
                setError(errMsg)
                toast({
                    title: "Lỗi",
                    description: errMsg,
                    variant: "destructive",
                })
            }
        } catch (err: unknown) {
            console.error("Lỗi khi gửi OTP:", err)
            const errorMsg = getErrorMessage(err)
            setError(errorMsg)
            toast({
                title: "Lỗi",
                description: errorMsg,
                variant: "destructive",
            })
        }
        setOtpLoading(false)
    }

    const addDockSlot = () => {
        // eslint-disable-next-line no-console
        console.debug('[Register] addDockSlot')
        setDockSlots((prev) => [...prev, { name: "", assignedFrom: "", assignedUntil: "" }])
    }

    const removeDockSlot = (index: number) => {
        // eslint-disable-next-line no-console
        console.debug('[Register] removeDockSlot', index)
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
        // eslint-disable-next-line no-console
        console.debug('[Register] handleNext currentStep=', currentStep)
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
        }
    }

    const handlePrevious = () => {
        setError("")
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const registerBoatyard = async (otpValue: string) => {
        try {
            const boatyardData: BoatyardRequest = {
                ...formData,
                otp: otpValue,
                avatar: formData.avatar ?? null,
                dockSlots: dockSlots.map((s) => ({
                    name: s.name,
                    assignedFrom: s.assignedFrom,
                    assignedUntil: s.assignedUntil,
                })),
            }
            const res = (await createBoatyardApi(boatyardData)) as unknown
            const r = isRecord(res) ? res : {}
            const httpStatus = typeof r.status === "number" ? (r.status as number) : undefined
            const body = isRecord(res) && "data" in res ? (r.data ?? r) : res
            const msg = extractServerMessage(body) || "Hoàn tất đăng ký"

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (httpStatus === 201 || httpStatus === 200 || (isRecord(body) && ((body as any).status === 201 || (body as any).status === 200))) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return { success: true, data: isRecord(body) ? (body as any).data ?? body : body, message: msg }
            } else {
                return { success: false, error: msg || (isRecord(r) && typeof r.message === "string" ? r.message : "Lỗi khi đăng ký") }
            }
        } catch (err: unknown) {
            console.error("Lỗi trong registerBoatyard:", err)
            return { success: false, error: getErrorMessage(err) }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // If available, inspect the element that triggered the submit (submitter).
        // Some browsers expose it on the native SubmitEvent as `submitter`.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const native = (e as any).nativeEvent as SubmitEvent | undefined
        const submitter = native?.submitter as HTMLElement | undefined
        // eslint-disable-next-line no-console
        console.debug('[Register] submitter=', submitter?.tagName, submitter?.id)
        // Protect: only allow submit on final step
        if (submitter && submitter.id && submitter.id !== 'register-final-submit') {
            // eslint-disable-next-line no-console
            console.debug('[Register] submit ignored: submitter is not final submit button', submitter.id)
            setError('Hành động bị hủy: không phải nút hoàn tất đăng ký')
            return
        }

        if (currentStep !== STEPS.length) {
            // eslint-disable-next-line no-console
            console.debug('[Register] handleSubmit ignored because not final step', currentStep)
            setError('Vui lòng hoàn tất tất cả các bước trước khi gửi')
            return
        }
        // eslint-disable-next-line no-console
        console.debug('[Register] handleSubmit triggered', { formData, dockSlots })

        if (!validateStep(3)) {
            return
        }

        setIsLoading(true)
        setError("")
        setSuccess("")

        const result = await registerBoatyard(otp)
        if (result.success) {
            const successMsg = "Đăng ký xưởng thành công!"
            setSuccess(successMsg)
            toast({
                title: "Thành công",
                description: successMsg,
                variant: "success",
            })
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } else {
            const errMsg = result.error || "Có lỗi xảy ra"
            setError(errMsg)
            toast({
                title: "Lỗi",
                description: errMsg,
                variant: "destructive",
            })
        }
        setIsLoading(false)
    }

    // Direct final submit handler: invoked from the final button's onClick to avoid accidental form submits
    const submitFinal = async () => {
        // eslint-disable-next-line no-console
        console.debug('[Register] submitFinal invoked')
        if (currentStep !== STEPS.length) {
            setError('Vui lòng hoàn tất tất cả các bước trước khi gửi')
            return
        }

        if (!validateStep(3)) return

        setIsLoading(true)
        setError('')
        setSuccess('')

        const result = await registerBoatyard(otp)
        if (result.success) {
            const successMsg = 'Đăng ký xưởng thành công!'
            setSuccess(successMsg)
            toast({
                title: "Thành công",
                description: successMsg,
                variant: "success",
            })
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } else {
            const errMsg = result.error || 'Có lỗi xảy ra'
            setError(errMsg)
            toast({
                title: "Lỗi",
                description: errMsg,
                variant: "destructive",
            })
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
                    <form
                        onSubmit={handleSubmit}
                        onClick={(e) => {
                            // eslint-disable-next-line no-console
                            console.debug('[Register] form click target=', (e.target as HTMLElement)?.tagName)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const target = e.target as HTMLElement
                                // eslint-disable-next-line no-console
                                console.debug('[Register] form keydown Enter target=', target?.tagName, 'type=', (target as HTMLElement)?.getAttribute?.('type'))

                                // Allow Enter only when the focused element is the actual submit button.
                                const isSubmitButton = target?.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit'
                                const isTextarea = target?.tagName === 'TEXTAREA'

                                if (!isSubmitButton && !isTextarea) {
                                    e.preventDefault()
                                    // eslint-disable-next-line no-console
                                    console.debug('[Register] prevented Enter submit (not submit button)')
                                }
                            }
                        }}
                        className="space-y-6"
                    >
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Ngân hàng</Label>
                                        <select
                                            id="bankName"
                                            value={formData.bankName ?? ""}
                                            onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))}
                                            className="mt-1 w-full border rounded px-2 py-2"
                                        >
                                            <option value="">-- Chọn ngân hàng (nếu có) --</option>
                                            {BANKS.map((b) => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bankNo">Số tài khoản</Label>
                                        <Input
                                            id="bankNo"
                                            placeholder="Số tài khoản (nếu có)"
                                            value={formData.bankNo ?? ""}
                                            onChange={(e) => setFormData((p) => ({ ...p, bankNo: e.target.value }))}
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
                                    <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); addDockSlot(); }}>
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
                                <Button id="register-final-submit" type="button" onClick={submitFinal} disabled={isLoading}>
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