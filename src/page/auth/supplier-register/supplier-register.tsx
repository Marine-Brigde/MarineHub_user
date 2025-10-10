"use client"

import { SupplierRegisterForm } from "@/components/auth/supplier-register-form"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function SupplierRegisterPage() {
    const navigate = useNavigate()

    return (
        <div className="h-screen overflow-hidden bg-background relative">
            {/* Video background */}
            <img

                className="fixed inset-0 w-full h-full object-cover z-0"

                src="/image/backgroud.jpg"
            />
            {/* Overlay để tăng độ tương phản */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-accent/10 z-0" />
            {/* Overlay mờ để làm mềm video */}
            <div className="fixed inset-0 bg-black/20 z-0" />

            <div className="relative z-10 h-full overflow-y-auto py-8 px-4">
                <div className="flex items-start justify-center min-h-full">
                    <div className="w-full max-w-2xl">
                        <div className="mb-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            >
                                <ArrowLeft />
                                Quay lại
                            </Button>
                        </div>

                        <Card className="bg-background/90 backdrop-blur-sm border-background/20">
                            <CardContent className="p-6 sm:p-8">
                                <SupplierRegisterForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
