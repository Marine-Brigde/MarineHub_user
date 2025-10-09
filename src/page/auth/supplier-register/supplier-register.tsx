import { SupplierRegisterForm } from "@/components/auth/supplier-register-form"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function SupplierRegisterPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ overflow: "hidden", position: "relative" }}>
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 transition duration-300 group-hover:blur-sm scale-110 brightness-75 contrast-125 saturate-110"
                style={{
                    filter: 'blur(0.5px) brightness(0.7) contrast(1.2) saturate(1.1)',
                    transform: 'scale(1.05)',
                    willChange: 'transform'
                }}
                src="/541277703_24864000929890843_2493772521354789360_n.mp4"
            />
            {/* Overlay để tăng độ tương phản */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-accent/10 z-0" />
            {/* Overlay mờ để làm mềm video */}
            <div className="absolute inset-0 bg-black/20 z-0" />
            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                        <ArrowLeft />
                        Quay lại
                    </Button>
                </div>

                <Card className="bg-background/90 backdrop-blur-sm border-background/20">
                    <CardContent className="p-8">
                        <SupplierRegisterForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
