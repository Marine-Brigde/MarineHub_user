"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Save, Loader2, CheckCircle2, Camera, Package } from "lucide-react"
import { getProfileApi, updateProfileApi } from "@/api/authApi"
import type { ProfileData } from "@/models/Auth"

export default function SupplierProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    const [profileData, setProfileData] = useState<ProfileData & { personalIntroduction?: string; email?: string; username?: string; name?: string }>({
        id: "",
        fullName: "",
        address: "",
        phoneNumber: "",
        avatarUrl: "",
        personalIntroduction: "",
        email: "",
        username: "",
        name: "",
    })

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        personalIntroduction: "",
        avatar: null as File | null,
    })

    // Load profile data
    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setIsLoading(true)
            setError("")
            const response = await getProfileApi()
            
            if (response.status === 200 && response.data) {
                // Lấy thông tin từ localStorage cho các field không có trong API response
                const email = localStorage.getItem("email") || ""
                const username = localStorage.getItem("username") || ""
                
                setProfileData({
                    ...response.data,
                    personalIntroduction: (response.data as any).personalIntroduction || "",
                    email,
                    username,
                    name: "", // Không có trong API response
                })
                setFormData({
                    fullName: response.data.fullName || "",
                    phoneNumber: response.data.phoneNumber || "",
                    personalIntroduction: (response.data as any).personalIntroduction || "",
                    avatar: null,
                })
            } else {
                setError(response.message || "Không thể tải thông tin profile")
            }
        } catch (err: any) {
            console.error("Error loading profile:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi tải thông tin profile"
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            setError("")
            setSuccess("")

            // Validate
            if (!formData.fullName.trim()) {
                setError("Họ và tên không được để trống")
                setIsSaving(false)
                return
            }

            if (!formData.phoneNumber.trim()) {
                setError("Số điện thoại không được để trống")
                setIsSaving(false)
                return
            }

            // Prepare update data
            const updateData: any = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
            }

            // Add personalIntroduction if supported by API
            if (formData.personalIntroduction !== undefined) {
                updateData.personalIntroduction = formData.personalIntroduction
            }

            // Add avatar if selected
            if (formData.avatar) {
                updateData.avatar = formData.avatar
            }

            const response = await updateProfileApi(updateData)

            if (response.status === 200) {
                setSuccess("Cập nhật thông tin thành công!")
                setIsEditing(false)
                // Reload profile to get updated data
                await loadProfile()
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(""), 3000)
            } else {
                setError(response.message || "Cập nhật thất bại")
            }
        } catch (err: any) {
            console.error("Error updating profile:", err)
            const message = err?.message || err?.response?.data?.message || "Lỗi khi cập nhật thông tin"
            setError(message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            fullName: profileData.fullName || "",
            phoneNumber: profileData.phoneNumber || "",
            personalIntroduction: profileData.personalIntroduction || "",
            avatar: null,
        })
        setIsEditing(false)
        setError("")
        setSuccess("")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Thông tin cá nhân</h1>
                    <p className="text-muted-foreground mt-1">Quản lý thông tin profile của bạn</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="default">
                        <User className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleCancel} variant="outline">
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Avatar & Basic Info */}
                <div className="space-y-6">
                    {/* Avatar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
                            <CardDescription>Ảnh profile của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-primary/20">
                                    <AvatarImage 
                                        src={formData.avatar ? URL.createObjectURL(formData.avatar) : profileData.avatarUrl} 
                                        alt={profileData.fullName}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {profileData.fullName?.charAt(0)?.toUpperCase() || "N"}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setFormData((prev) => ({ ...prev, avatar: file }))
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            {isEditing && (
                                <p className="text-xs text-center text-muted-foreground">
                                    Click vào icon camera để thay đổi ảnh
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <p className="text-sm font-medium">{profileData.email}</p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-xs text-muted-foreground">Tên đăng nhập</Label>
                                <p className="text-sm font-medium">{profileData.username}</p>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    Tên công ty
                                </Label>
                                <p className="text-sm font-medium">{profileData.name || "Chưa cập nhật"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Editable Fields */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Thông tin cá nhân
                            </CardTitle>
                            <CardDescription>
                                Cập nhật thông tin cá nhân của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Họ và tên <span className="text-destructive">*</span>
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="fullName"
                                        placeholder="Nhập họ và tên đầy đủ"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                                        }
                                        required
                                    />
                                ) : (
                                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                                        {profileData.fullName || "Chưa cập nhật"}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Số điện thoại <span className="text-destructive">*</span>
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="0123456789"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                                        }
                                        required
                                    />
                                ) : (
                                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                                        {profileData.phoneNumber || "Chưa cập nhật"}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information (Read-only) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Địa chỉ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {profileData.address || "Chưa cập nhật địa chỉ"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
