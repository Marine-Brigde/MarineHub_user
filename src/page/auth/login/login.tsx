
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Anchor } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


export default function LoginPage() {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const navigate = useNavigate();
    const handleRoleSelect = (role: string) => {
        setShowRoleModal(false);
        if (role === 'supplier') navigate('/supplier-register');
        else if (role === 'repair-shop') navigate('/register');
    };
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ overflow: "hidden", position: "relative" }}>
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 transition duration-300 group-hover:blur-sm"

                src="/541277703_24864000929890843_2493772521354789360_n.mp4"
            />
            <div className="w-full max-w-md relative z-10">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4">
                            <Anchor className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold text-foreground">MaritimeHub</span>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                            <CardDescription>Đăng nhập vào tài khoản MaritimeHub của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginForm />
                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Chưa có tài khoản?{" "}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline focus:outline-none"
                                        onClick={() => setShowRoleModal(true)}
                                    >
                                        Đăng ký ngay
                                    </button>
                                </p>
                                <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
                                    <DialogContent className="max-w-xs mx-auto">
                                        <DialogHeader>
                                            <DialogTitle>Chọn vai trò đăng ký</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col gap-4 mt-2">
                                            <button
                                                className="w-full px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
                                                onClick={() => handleRoleSelect('supplier')}
                                            >
                                                Đăng ký Nhà cung cấp
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 rounded bg-secondary text-foreground border hover:bg-secondary/80 transition"
                                                onClick={() => handleRoleSelect('repair-shop')}
                                            >
                                                Đăng ký Xưởng sửa chữa
                                            </button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
