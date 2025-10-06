"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Package, MapPin, Mail, Phone, User, Building } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"

interface SupplierFormData {
    name: string
    username: string
    email: string
    password: string
    fullName: string
    phoneNumber: string
    address: string
    latitude: string
    longitude: string
    avatar?: File
}

// Helper function to convert API field names to Vietnamese display names
function getFieldDisplayName(field: string): string {
    const fieldMap: { [key: string]: string } = {
        'Name': 'Tên công ty',
        'Username': 'Tên đăng nhập',
        'Email': 'Email',
        'Password': 'Mật khẩu',
        'FullName': 'Họ và tên',
        'PhoneNumber': 'Số điện thoại',
        'Address': 'Địa chỉ',
        'Latitude': 'Vĩ độ',
        'Longitude': 'Kinh độ',
        'Otp': 'Mã OTP',
        'Avatar': 'Ảnh đại diện'
    }
    return fieldMap[field] || field
}

interface OTPDialogProps {
    open: boolean
    onClose: () => void
    email: string
    onVerify: (otp: string) => void
    isLoading: boolean
}

function OTPDialog({ open, onClose, email, onVerify, isLoading }: OTPDialogProps) {
    const [otp, setOtp] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onVerify(otp)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Xác thực OTP
                    </DialogTitle>
                    <DialogDescription>
                        Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>. 
                        Vui lòng nhập mã để hoàn tất đăng ký.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading || otp.length !== 4}
                        >
                            {isLoading ? "Đang xác thực..." : "Xác thực"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function SupplierRegisterForm() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [otpDialogOpen, setOtpDialogOpen] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

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
        avatar: undefined
    })

    const sendOTP = async (email: string) => {
        try {
            const response = await fetch('https://marine-bridge.orbitmap.vn/api/v1/auth/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'text/plain'
                },
                body: JSON.stringify({ email })
            })

            if (response.ok) {
                const result = await response.json()
                return { success: true, data: result }
            } else {
                const error = await response.json()
                return { success: false, error: error.message || 'Lỗi khi gửi OTP' }
            }
        } catch (error) {
            return { success: false, error: 'Lỗi kết nối mạng' }
        }
    }

    const registerSupplier = async (otp: string) => {
        try {
            const formDataToSend = new FormData()
            
            // Append each field individually with exact field names from API
            formDataToSend.append('Name', formData.name)
            formDataToSend.append('Username', formData.username)
            formDataToSend.append('Email', formData.email)
            formDataToSend.append('Password', formData.password)
            formDataToSend.append('FullName', formData.fullName)
            formDataToSend.append('PhoneNumber', formData.phoneNumber)
            formDataToSend.append('Address', formData.address)
            formDataToSend.append('Latitude', formData.latitude)
            formDataToSend.append('Longitude', formData.longitude)
            formDataToSend.append('Otp', otp)
            
            // Only append avatar if file exists
            if (formData.avatar) {
                formDataToSend.append('Avatar', formData.avatar)
            }

            console.log('Sending data:', {
                Name: formData.name,
                Username: formData.username,
                Email: formData.email,
                Password: '***',
                FullName: formData.fullName,
                PhoneNumber: formData.phoneNumber,
                Address: formData.address,
                Latitude: formData.latitude,
                Longitude: formData.longitude,
                Otp: otp,
                HasAvatar: !!formData.avatar
            })

            const response = await fetch('https://marine-bridge.orbitmap.vn/api/v1/suppliers', {
                method: 'POST',
                headers: {
                    'accept': 'text/plain'
                },
                body: formDataToSend
            })

            console.log('Response status:', response.status)
            
            const responseText = await response.text()
            console.log('Response body:', responseText)

            if (response.ok) {
                const result = JSON.parse(responseText)
                return { success: true, data: result }
            } else {
                let errorMessage = 'Lỗi khi đăng ký'
                let fieldErrors: string[] = []
                
                try {
                    const errorData = JSON.parse(responseText)
                    console.log('Error response:', errorData)
                    
                    // Handle different error formats
                    if (errorData.message) {
                        errorMessage = errorData.message
                    } else if (errorData.error) {
                        errorMessage = errorData.error
                    }
                    
                    // Check for field-specific errors
                    if (errorData.errors) {
                        if (typeof errorData.errors === 'object') {
                            fieldErrors = Object.entries(errorData.errors).map(([field, messages]: [string, any]) => {
                                const fieldName = getFieldDisplayName(field)
                                if (Array.isArray(messages)) {
                                    return `${fieldName}: ${messages.join(', ')}`
                                } else {
                                    return `${fieldName}: ${messages}`
                                }
                            })
                        } else if (Array.isArray(errorData.errors)) {
                            fieldErrors = errorData.errors
                        }
                    }
                    
                    // Check for common field error patterns
                    if (errorData.details || errorData.validation || errorData.fields) {
                        const details = errorData.details || errorData.validation || errorData.fields
                        if (typeof details === 'object') {
                            fieldErrors = Object.entries(details).map(([field, message]: [string, any]) => {
                                const fieldName = getFieldDisplayName(field)
                                return `${fieldName}: ${message}`
                            })
                        }
                    }
                    
                    // Check for specific error messages that indicate field issues
                    const message = errorMessage.toLowerCase()
                    if (message.includes('email') && (message.includes('already') || message.includes('exists') || message.includes('đã tồn tại'))) {
                        fieldErrors.push('Email: Email này đã được sử dụng')
                    }
                    if (message.includes('username') && (message.includes('already') || message.includes('exists') || message.includes('đã tồn tại'))) {
                        fieldErrors.push('Tên đăng nhập: Tên đăng nhập này đã được sử dụng')
                    }
                    if (message.includes('phone') && (message.includes('already') || message.includes('exists') || message.includes('đã tồn tại'))) {
                        fieldErrors.push('Số điện thoại: Số điện thoại này đã được sử dụng')
                    }
                    
                } catch {
                    errorMessage = `HTTP ${response.status}: ${responseText || 'Unknown error'}`
                }
                
                // Combine main error with field errors
                if (fieldErrors.length > 0) {
                    errorMessage += '\n\nChi tiết lỗi:\n' + fieldErrors.join('\n')
                }
                
                return { success: false, error: errorMessage }
            }
        } catch (error) {
            console.error('Registration error:', error)
            return { success: false, error: 'Lỗi kết nối mạng: ' + (error as Error).message }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        // Validate form
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

        // Send OTP
        const otpResult = await sendOTP(formData.email)
        if (otpResult.success) {
            setOtpDialogOpen(true)
            setSuccess("Mã OTP đã được gửi đến email của bạn")
        } else {
            setError(otpResult.error)
        }

        setIsLoading(false)
    }

    const handleOTPVerify = async (otp: string) => {
        setIsLoading(true)
        setError("")

        const result = await registerSupplier(otp)
        if (result.success) {
            setSuccess("Đăng ký thành công! Đang chuyển hướng...")
            setOtpDialogOpen(false)
            
            // Delay 2 giây để user thấy thông báo thành công
            setTimeout(() => {
                navigate('/suppliers')
            }, 2000)
        } else {
            setError(result.error || 'Có lỗi xảy ra')
        }

        setIsLoading(false)
    }

    return (
        <>
            <div className="space-y-6">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Package className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Đăng ký Nhà cung cấp</h2>
                    </div>
                    <p className="text-muted-foreground">
                        Tham gia mạng lưới nhà cung cấp hàng hải hàng đầu
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription className="whitespace-pre-line">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
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
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <OTPDialog
                open={otpDialogOpen}
                onClose={() => setOtpDialogOpen(false)}
                email={formData.email}
                onVerify={handleOTPVerify}
                isLoading={isLoading}
            />
        </>
    )
}
