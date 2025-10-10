"use client"

import { BoatyardRegisterForm } from "@/components/auth/regisster-form"
import { Card, CardContent } from "@/components/ui/card"
import { Anchor, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"

export default function RegisterPage() {
    const navigate = useNavigate()

    return (
        <div className="h-screen overflow-hidden bg-background relative">
            {/* Video nền */}
            <img


                className="fixed inset-0 w-full h-full object-cover z-0"

                src="/image/backgroud.jpg"
            />

            {/* Overlay mờ để làm dịu video */}
            <div className="fixed inset-0 bg-black/20 z-0" />
            <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-accent/10 z-0" />

            <div className="relative z-10 h-full overflow-y-auto py-8 px-4">
                <div className="flex items-start justify-center min-h-full">
                    <div className="w-full max-w-2xl">
                        {/* Nút quay lại */}
                        <div className="mb-4 flex items-center justify-between">


                            <Link to="/" className="inline-flex items-center gap-2">
                                <Anchor className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold text-foreground">
                                    MaritimeHub
                                </span>
                            </Link>
                        </div>

                        <Card className="bg-background/90 backdrop-blur-sm border-background/20">
                            <CardContent className="p-2 sm:p-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate(-1)}
                                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                                >
                                    <ArrowLeft />
                                    Quay lại
                                </Button>
                                <BoatyardRegisterForm />
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Đã có tài khoản?{" "}
                                        <Link
                                            to="/login"
                                            className="text-primary hover:underline"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
