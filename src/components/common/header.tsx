"use client"

import { useState, useEffect } from "react"
import { Anchor, LogOut, LayoutDashboard, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate, Link } from "react-router-dom"
import type { Role } from "@/types/enums"
import { getBoatyardDetailApi } from "@/api/boatyardApi/boatyardApi"
import { getSupplierDetailApi } from "@/api/supplierApi"

export default function Header() {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<Role | null>(null)
    const [userInfo, setUserInfo] = useState<{
        name: string
        email: string
        avatarUrl?: string
    } | null>(null)

    // Check authentication state and load user info
    useEffect(() => {
        let isMounted = true
        let hasLoadedUserInfo = false

        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken")
            const role = localStorage.getItem("userRole") as Role | null
            
            if (!isMounted) return

            setIsAuthenticated(!!token)
            setUserRole(role)

            // Load user info if authenticated
            if (token && role) {
                const username = localStorage.getItem("username") || ""
                const email = localStorage.getItem("email") || ""
                
                // Set default info first
                if (isMounted) {
                    setUserInfo({
                        name: username || (role === "Boatyard" ? "Xưởng Sửa chữa" : "Nhà cung cấp"),
                        email: email || "user@example.com",
                    })
                }

                // Load detailed info from API only once (not on every check)
                if (!hasLoadedUserInfo) {
                    hasLoadedUserInfo = true
                    try {
                        if (role === "Boatyard") {
                            const response = await getBoatyardDetailApi()
                            if (isMounted && response.status === 200 && response.data) {
                                setUserInfo({
                                    name: response.data.name || response.data.fullName || username || "Xưởng Sửa chữa",
                                    email: response.data.email || email || "user@example.com",
                                    avatarUrl: response.data.avatarUrl || undefined,
                                })
                            }
                        } else if (role === "Supplier") {
                            const response = await getSupplierDetailApi()
                            if (isMounted && response.status === 200 && response.data) {
                                setUserInfo({
                                    name: response.data.name || response.data.fullName || username || "Nhà cung cấp",
                                    email: response.data.email || email || "user@example.com",
                                    avatarUrl: response.data.avatarUrl || undefined,
                                })
                            }
                        }
                    } catch (error) {
                        // Silently fail - use default info from localStorage
                        console.error("Error loading user details:", error)
                        hasLoadedUserInfo = false // Allow retry on next mount if error
                    }
                }
            } else {
                if (isMounted) {
                    setUserInfo(null)
                }
                hasLoadedUserInfo = false
            }
        }

        checkAuth()

        // Listen for storage changes (for logout/login from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "accessToken" || e.key === "userRole" || e.key === "username" || e.key === "email") {
                hasLoadedUserInfo = false // Reset flag on storage change
                checkAuth()
            }
        }

        window.addEventListener("storage", handleStorageChange)

        return () => {
            isMounted = false
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("username")
        localStorage.removeItem("email")
        setIsAuthenticated(false)
        setUserRole(null)
        setUserInfo(null)
        navigate("/")
        // Force page reload to update all components
        window.location.reload()
    }

    const getDashboardPath = () => {
        if (userRole === "Boatyard") return "/repair-shop/dashboard"
        if (userRole === "Supplier") return "/supplier/dashboard"
        return "/"
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Anchor className="h-8 w-8 text-primary" />
                        <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                            MaritimeHub
                        </Link>
                    </div>
                    <nav className="flex-1 flex justify-center">
                        <ul className="flex gap-8">
                            <li>
                                <Link to="/" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                                    Trang Chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                                    Sản phẩm
                                </Link>
                            </li>
                            <li>
                                <Link to="/suppliers" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                                    Nhà cung cấp
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="flex items-center gap-4">
                        {isAuthenticated && userRole && userInfo ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                            <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {getInitials(userInfo.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{userInfo.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to={getDashboardPath()} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {userRole === "Boatyard" && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/repair-shop/profile" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Thông tin cá nhân</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {userRole === "Supplier" && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/supplier/profile" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Thông tin cá nhân</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => navigate("/login")}>
                                    Đăng nhập
                                </Button>
                                <Button onClick={() => navigate("/register")}>Đăng ký</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
