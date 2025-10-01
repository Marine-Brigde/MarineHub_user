import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anchor, Ship, Wrench, Package, MapPin, Clock, LogIn } from "lucide-react"

import Header from "@/components/common/header";


export default function HomePage() {



    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Header />
            <section className="py-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <Badge className="mb-6 bg-accent/10 text-accent-foreground border-accent/20">
                        Hệ thống quản lý hàng hải chuyên nghiệp
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                        Kết nối <span className="text-primary">Nhà cung cấp</span> và{" "}
                        <span className="text-accent">Xưởng sửa chữa</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                        Nền tảng toàn diện cho việc quản lý thiết bị hàng hải, đặt hàng phụ tùng, và dịch vụ sửa chữa tàu thuyền một
                        cách hiệu quả và tin cậy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                        <Button size="lg" className="w-full sm:w-auto">
                            <Wrench className="mr-2 h-5 w-5" />
                            Đăng ký Xưởng sửa chữa
                        </Button>


                        <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                            <LogIn className="mr-2 h-5 w-5" />
                            Đăng nhập
                        </Button>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-foreground mb-4">Tính năng chính</h3>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Hệ thống được thiết kế đặc biệt cho ngành hàng hải với các tính năng chuyên biệt
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Supplier Features */}
                        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-primary">Nhà cung cấp</CardTitle>
                                        <CardDescription>Quản lý sản phẩm và đơn hàng</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-medium text-foreground">Quản lý sản phẩm hàng hải</h4>
                                        <p className="text-sm text-muted-foreground">Thiết bị, phụ tùng và vật tư chuyên dụng</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-medium text-foreground">Xử lý đơn hàng thông minh</h4>
                                        <p className="text-sm text-muted-foreground">Nhận và xử lý đơn hàng từ chủ tàu tự động</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Giao hàng định vị</h4>
                                        <p className="text-sm text-muted-foreground">Giao hàng đến vị trí xưởng do chủ tàu chỉ định</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-medium text-foreground">Quản lý lịch sử giao dịch</h4>
                                        <p className="text-sm text-muted-foreground">Theo dõi phản hồi và đánh giá từ khách hàng</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Repair Shop Features */}
                        <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Wrench className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-accent">Xưởng sửa chữa</CardTitle>
                                        <CardDescription>Quản lý dịch vụ và lịch hẹn</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-medium text-foreground">Quản lý dịch vụ sửa chữa</h4>
                                        <p className="text-sm text-muted-foreground">Thông tin dịch vụ và lịch trống chi tiết</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Nhận lịch hẹn tự động</h4>
                                        <p className="text-sm text-muted-foreground">Lịch hẹn sửa chữa từ chủ tàu</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Ship className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Theo dõi vị trí tàu</h4>
                                        <p className="text-sm text-muted-foreground">Chuẩn bị đón tàu dựa trên thông báo vị trí thực tế</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-medium text-foreground">Báo cáo tiến độ</h4>
                                        <p className="text-sm text-muted-foreground">Cập nhật tiến độ và gửi báo cáo hoàn thành</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center max-w-3xl">
                    <h3 className="text-3xl font-bold text-foreground mb-6">Sẵn sàng bắt đầu?</h3>
                    <p className="text-muted-foreground text-lg mb-8">
                        Tham gia cộng đồng hàng hải chuyên nghiệp và tối ưu hóa quy trình làm việc của bạn
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                        <Button size="lg" className="w-full sm:w-auto">
                            Bắt đầu miễn phí
                        </Button>

                        <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                            Liên hệ tư vấn
                        </Button>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/30 py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <Anchor className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-foreground">MaritimeHub</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            © 2025 MaritimeHub. Hệ thống quản lý hàng hải chuyên nghiệp.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
