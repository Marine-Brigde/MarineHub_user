import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anchor, Ship, Wrench, Package, MapPin, Clock, LogIn, Users, TrendingUp, Shield, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

import Header from "@/components/common/header";


export default function HomePage() {
    const navigate = useNavigate()

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

            {/* Become Supplier Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <Badge className="mb-5 bg-primary/10 text-primary text-sm border-primary/20">
                            <Users className="mr-2 h-4 w-4" />
                            Đối tác tin cậy
                        </Badge>
                        <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Trở thành <span className="text-primary">Nhà cung cấp</span> của chúng tôi
                        </h3>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                            Tham gia mạng lưới nhà cung cấp hàng hải hàng đầu và mở rộng cơ hội kinh doanh của bạn 
                            với hàng nghìn chủ tàu và xưởng sửa chữa trên toàn quốc.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="text-center">
                            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">Tăng doanh thu</h4>
                            <p className="text-sm text-muted-foreground">Tiếp cận thị trường lớn hơn với hàng nghìn khách hàng tiềm năng</p>
                        </div>
                        <div className="text-center">
                            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">Thanh toán an toàn</h4>
                            <p className="text-sm text-muted-foreground">Hệ thống thanh toán bảo mật và đảm bảo giao dịch</p>
                        </div>
                        <div className="text-center">
                            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">Hỗ trợ chuyên nghiệp</h4>
                            <p className="text-sm text-muted-foreground">Đội ngũ hỗ trợ 24/7 và công cụ quản lý hiện đại</p>
                        </div>
                        <div className="text-center">
                            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Star className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">Xây dựng uy tín</h4>
                            <p className="text-sm text-muted-foreground">Hệ thống đánh giá và phản hồi giúp xây dựng thương hiệu</p>
                        </div>
                    </div>

                    <div className="bg-card border border-primary/20 rounded-2xl p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h4 className="text-2xl font-bold text-foreground mb-4">
                                    Sẵn sàng bắt đầu hành trình cùng chúng tôi?
                                </h4>
                                <p className="text-muted-foreground mb-6">
                                    Đăng ký trở thành nhà cung cấp ngay hôm nay và tận dụng cơ hội mở rộng 
                                    kinh doanh trong lĩnh vực hàng hải đầy tiềm năng.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-sm text-foreground">Đăng ký miễn phí và nhanh chóng</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-sm text-foreground">Hướng dẫn chi tiết từ đội ngũ chuyên gia</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-sm text-foreground">Truy cập vào thị trường khách hàng rộng lớn</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <div className="inline-flex flex-col gap-4">
                                    <Button 
                                        size="lg" 
                                        className="w-full md:w-auto bg-primary hover:bg-primary/90"
                                        onClick={() => navigate('/supplier-register')}
                                    >
                                        <Package className="mr-2 h-5 w-5" />
                                        Trở thành Nhà cung cấp
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="w-full md:w-auto"
                                        onClick={() => navigate('/supplier-register')}
                                    >
                                        Đăng kí ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
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
