// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { authApi } from "@/api/authApi";
import type { LoginRequest, LoginResponseData } from "@/models/Auth";
import type { ApiResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
    onLoadingChange: (loading: boolean) => void;
}

export function LoginForm({ onLoadingChange }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginRequest>({
        usernameOrEmail: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation tiếng Việt
        if (!formData.usernameOrEmail.trim()) {
            setError("Vui lòng nhập tên đăng nhập hoặc email");
            return;
        }
        if (!formData.password.trim()) {
            setError("Vui lòng nhập mật khẩu");
            return;
        }

        onLoadingChange(true); // Bắt đầu loading
        setError(null);

        try {
            // Giả lập delay 10 giây (hoặc kết hợp với API thật)
            await new Promise(resolve => setTimeout(resolve, 4000));

            const response: ApiResponse<LoginResponseData> = await authApi.login(formData);
            const { data: loginData } = response;

            localStorage.setItem("accessToken", loginData.data.accessToken);
            localStorage.setItem("userRole", loginData.data.role);
            localStorage.setItem("username", loginData.data.username);
            localStorage.setItem("email", loginData.data.email);

            toast({
                title: "Đăng nhập thành công",
                description: `Chào mừng, ${loginData.data.username}!`,
                variant: "success",
            });

            switch (loginData.data.role) {
                case "Supplier":
                    navigate("/supplier/dashboard");
                    break;
                case "Boatyard":
                    navigate("/");
                    break;

            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Login error:', err);

            // Check for 404 status - wrong username/password
            if (err?.response?.status === 404 || err?.response?.data?.status === 404) {
                setError("Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
            } else {
                // Get detailed error message from API or fallback
                const errorMsg = err?.response?.data?.data || err?.response?.data?.message || err?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
                setError(errorMsg);
            }
        } finally {
            onLoadingChange(false); // Kết thúc loading
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="space-y-2">
                <Label htmlFor="usernameOrEmail">Tên đăng nhập hoặc Email</Label>
                <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="Nhập tên đăng nhập hoặc email"
                    value={formData.usernameOrEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, usernameOrEmail: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Đăng nhập
            </Button>
        </form>
    );
}