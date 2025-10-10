"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Package, MapPin, Mail, Phone, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"

import type { SupplierRequest } from "@/models/supplier"
import type { OtpRequest } from "@/models/Auth"
import { createSupplierApi } from "@/api/supplierApi"
import { authApi } from "@/api/authApi"
import { MapComponent } from "../map/MapComponent"

type SupplierFormData = Omit<SupplierRequest, "otp">

export function SupplierRegisterForm() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [otpLoading, setOtpLoading] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)

    const [formData, setFormData] = useState<SupplierFormData>({
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

    const registerSupplier = async (otp: string) => {
        try {
            const supplierData: SupplierRequest = {
                ...formData,
                otp,
                avatar: formData.avatar ?? null,
            }
            const res = await createSupplierApi(supplierData)
            if (res.status === 201) {
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
        setError("")
        setSuccess("")
        setIsLoading(true)

        // ... existing validation code ...
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự")
            setIsLoading(false)
            return
        }
        if (!formData.email.includes("@") || !formData.email.includes(".")) {
            setError("Email không hợp lệ")
            setIsLoading(false)
            return
        }
        if (!formData.name.trim()) {
            setError("Tên công ty không được để trống")
            setIsLoading(false)
            return
        }
        if (!formData.username.trim()) {
            setError("Tên đăng nhập không được để trống")
            setIsLoading(false)
            return
        }
        if (!formData.fullName.trim()) {
            setError("Họ và tên không được để trống")
            setIsLoading(false)
            return
        }
        if (!formData.phoneNumber.trim()) {
            setError("Số điện thoại không được để trống")
            setIsLoading(false)
            return
        }
        if (!formData.address.trim()) {
            setError("Địa chỉ không được để trống")
            setIsLoading(false)
            return
        }
        if (!formData.latitude.trim() || isNaN(Number(formData.latitude))) {
            setError("Vĩ độ phải là số hợp lệ")
            setIsLoading(false)
            return
        }
        if (!formData.longitude.trim() || isNaN(Number(formData.longitude))) {
            setError("Kinh độ phải là số hợp lệ")
            setIsLoading(false)
            return
        }
        if (!otpSent) {
            setError("Bạn cần lấy OTP trước khi đăng ký!")
            setIsLoading(false)
            return
        }
        if (otp.length !== 4) {
            setError("Vui lòng nhập mã OTP 4 số!")
            setIsLoading(false)
            return
        }

        const result = await registerSupplier(otp)
        if (result.success) {
            setSuccess("Đăng ký thành công! Đang chuyển hướng...")
            setTimeout(() => {
                navigate("/suppliers")
            }, 2000)
        } else {
            setError(result.error || "Có lỗi xảy ra")
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Đăng ký Nhà cung cấp</h2>
                </div>
                <p className="text-muted-foreground">Tham gia mạng lưới nhà cung cấp hàng hải hàng đầu</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Tên công ty
                        </Label>
                        <Input
                            id="name"
                            placeholder="Tên công ty"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Tên đăng nhập
                        </Label>
                        <Input
                            id="username"
                            placeholder="Tên đăng nhập"
                            value={formData.username}
                            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Họ và tên đầy đủ
                        </Label>
                        <Input
                            id="fullName"
                            placeholder="Họ và tên đầy đủ"
                            value={formData.fullName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Số điện thoại
                        </Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="0123456789"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOTP}
                                disabled={otpLoading || !formData.email}
                                className="whitespace-nowrap bg-transparent"
                            >
                                {otpLoading ? "Đang gửi..." : "Lấy OTP"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="otp">Mã OTP</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Nhập mã OTP 4 số"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={4}
                            required
                            className="text-center text-lg tracking-widest"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                            Mật khẩu
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
                    <div className="space-y-2">
                        <Label htmlFor="avatar">Ảnh đại diện (tùy chọn)</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    setFormData((prev) => ({ ...prev, avatar: file }))
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="max-h-[300px] overflow-hidden rounded-lg">
                    <MapComponent onLocationSelect={handleLocationSelect} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Địa chỉ
                    </Label>
                    <Textarea
                        id="address"
                        placeholder="Địa chỉ công ty"
                        value={formData.address}
                        onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                        required
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="any"
                            placeholder="10.762622"
                            value={formData.latitude}
                            onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="any"
                            placeholder="106.660172"
                            value={formData.longitude}
                            onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        "Đang xử lý..."
                    ) : (
                        <>
                            <Package className="mr-2 h-4 w-4" />
                            Đăng ký Nhà cung cấp
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
