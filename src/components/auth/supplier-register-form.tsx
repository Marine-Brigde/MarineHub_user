import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Package, MapPin, Mail, Phone, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

import type { RegisterRequest, OtpRequest } from "@/models/Auth";
import type { ApiResponse } from "@/types/api";
import { authApi } from "@/api/authApi";
import { MapComponent } from "../map/MapComponent";

type SupplierFormData = Omit<RegisterRequest, "Otp">;

export function SupplierRegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [formData, setFormData] = useState<SupplierFormData>({
        FullName: "",
        Username: "",
        Email: "",
        Password: "",
        PhoneNumber: "",
        Address: "",
        Avatar: undefined,
    });

    // Handle location selection from MapComponent
    const handleLocationSelect = (_lat: string, _lng: string, address: string) => {
        setFormData((prev) => ({
            ...prev,
            Address: address,
        }));
    };

    // Gửi OTP
    const handleSendOTP = async () => {
        setOtpLoading(true);
        setError("");
        setSuccess("");
        if (!formData.Email.includes("@") || !formData.Email.includes(".")) {
            setError("Email không hợp lệ");
            setOtpLoading(false);
            return;
        }
        try {
            const payload: OtpRequest = { email: formData.Email };
            const res = await authApi.sendOtp(payload);
            if (res.status === 201) {
                setOtpSent(true);
                setSuccess("Mã OTP đã được gửi đến email của bạn");
            } else {
                setError(res.message || "Lỗi khi gửi OTP");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.message || "Lỗi kết nối mạng";
            setError(message);
        }
        setOtpLoading(false);
    };

    // Đăng ký nhà cung cấp
    const registerSupplier = async (otp: string) => {
        try {
            const registerData: RegisterRequest = {
                ...formData,
                Otp: otp,
                Avatar: formData.Avatar ?? null,
            };
            const res: ApiResponse<any> = await authApi.register(registerData);
            if (res.status === 200 || res.status === 201) {
                return { success: true, data: res.data };
            } else {
                return { success: false, error: res.message || "Lỗi khi đăng ký" };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.message || "Lỗi kết nối mạng";
            return { success: false, error: message };
        }
    };

    // Xử lý submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        // Validate form
        if (formData.Password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            setIsLoading(false);
            return;
        }
        if (!formData.Email.includes("@") || !formData.Email.includes(".")) {
            setError("Email không hợp lệ");
            setIsLoading(false);
            return;
        }
        if (!formData.FullName.trim()) {
            setError("Họ và tên không được để trống");
            setIsLoading(false);
            return;
        }
        if (!formData.Username.trim()) {
            setError("Tên đăng nhập không được để trống");
            setIsLoading(false);
            return;
        }
        if (!formData.PhoneNumber.trim()) {
            setError("Số điện thoại không được để trống");
            setIsLoading(false);
            return;
        }
        if (!formData.Address.trim()) {
            setError("Địa chỉ không được để trống");
            setIsLoading(false);
            return;
        }
        if (!otpSent) {
            setError("Bạn cần lấy OTP trước khi đăng ký!");
            setIsLoading(false);
            return;
        }
        if (otp.length !== 4) {
            setError("Vui lòng nhập mã OTP 4 số!");
            setIsLoading(false);
            return;
        }

        // Đăng ký
        const result = await registerSupplier(otp);
        if (result.success) {
            setSuccess("Đăng ký thành công! Đang chuyển hướng...");
            setTimeout(() => {
                navigate("/suppliers");
            }, 2000);
        } else {
            setError(result.error || "Có lỗi xảy ra");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow space-y-6">
                <div className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Package className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Đăng ký Nhà cung cấp</h2>
                    </div>
                    <p className="text-muted-foreground">Tham gia mạng lưới nhà cung cấp hàng hải hàng đầu</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mx-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 mx-4">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 p-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label htmlFor="fullName" className="flex items-center gap-2">
                                 <User className="h-4 w-4" />
                                 Họ và tên đầy đủ
                             </Label>
                             <Input
                                 id="fullName"
                                 placeholder="Họ và tên đầy đủ"
                                 value={formData.FullName}
                                 onChange={(e) => setFormData((prev) => ({ ...prev, FullName: e.target.value }))}
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
                                 value={formData.Username}
                                 onChange={(e) => setFormData((prev) => ({ ...prev, Username: e.target.value }))}
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
                                 value={formData.PhoneNumber}
                                 onChange={(e) => setFormData((prev) => ({ ...prev, PhoneNumber: e.target.value }))}
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
                                     value={formData.Email}
                                     onChange={(e) => setFormData((prev) => ({ ...prev, Email: e.target.value }))}
                                     required
                                 />
                                 <Button
                                     type="button"
                                     variant="outline"
                                     onClick={handleSendOTP}
                                     disabled={otpLoading || !formData.Email}
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
                             <Label htmlFor="password" className="flex items-center gap-2">Mật khẩu</Label>
                             <div className="relative">
                                 <Input
                                     id="password"
                                     type={showPassword ? "text" : "password"}
                                     placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                     value={formData.Password}
                                     onChange={(e) => setFormData((prev) => ({ ...prev, Password: e.target.value }))}
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
                                     const file = e.target.files?.[0];
                                     if (file) {
                                         setFormData((prev) => ({ ...prev, Avatar: file }));
                                     }
                                 }}
                             />
                         </div>
                     </div>

                    <MapComponent onLocationSelect={handleLocationSelect} />

                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Địa chỉ
                        </Label>
                        <Textarea
                            id="address"
                            placeholder="Địa chỉ công ty"
                            value={formData.Address}
                            onChange={(e) => setFormData((prev) => ({ ...prev, Address: e.target.value }))}
                            required
                            rows={3}
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
        </div>
    );
}