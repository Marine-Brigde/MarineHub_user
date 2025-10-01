import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Anchor className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold text-foreground">MaritimeHub</h1>
                    </div>
                    <nav className="flex-1 flex justify-center">
                        <ul className="flex gap-8">
                            <li>
                                <Link to="/" className="text-base font-medium text-foreground hover:text-primary transition-colors">Trang Chủ</Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-base font-medium text-foreground hover:text-primary transition-colors">Sản phẩm</Link>
                            </li>
                            <li>
                                <Link to="/suppliers" className="text-base font-medium text-foreground hover:text-primary transition-colors">Nhà cung cấp</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/login')}>Đăng nhập</Button>
                        <Button onClick={() => navigate('/register')}>Đăng ký</Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
