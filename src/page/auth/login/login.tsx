
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Anchor } from "lucide-react"
import { Link } from "react-router-dom"


export default function LoginPage() {
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
                                    <Link to="/register" className="text-primary hover:underline">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
