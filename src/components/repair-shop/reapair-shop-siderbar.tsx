

import { Anchor, BarChart3, Wrench, Calendar, Ship, MapPin, FileText, Settings, LogOut } from "lucide-react"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"

const menuItems = [
    {
        title: "Tổng quan",
        url: "/repair-shop/dashboard",
        icon: BarChart3,
    },
    {
        title: "Quản lý dịch vụ",
        url: "/repair-shop/services",
        icon: Wrench,
    },
    {
        title: "Lịch hẹn",
        url: "/repair-shop/appointments",
        icon: Calendar,
    },
    {
        title: "Theo dõi tàu",
        url: "/repair-shop/tracking",
        icon: Ship,
    },
    {
        title: "Vị trí & Đón tàu",
        url: "/repair-shop/location",
        icon: MapPin,
    },
    {
        title: "Báo cáo tiến độ",
        url: "/repair-shop/reports",
        icon: FileText,
    },
]

export function RepairShopSidebar() {


    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 py-2">
                    <Anchor className="h-8 w-8 text-accent" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sidebar-foreground">MaritimeHub</span>
                        <span className="text-xs text-sidebar-foreground/70">Xưởng sửa chữa</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title}>
                                <Link to={item.url}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                <SidebarSeparator />

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Cài đặt">
                            <Link to="/repair-shop/settings">
                                <Settings className="h-4 w-4" />
                                <span>Cài đặt</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2 py-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg?key=repair" />
                                <AvatarFallback>XS</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium text-sidebar-foreground truncate">Xưởng Sửa chữa Hải Phòng</span>
                                <span className="text-xs text-sidebar-foreground/70 truncate">repair@haiphong.com</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild
                            tooltip="Đăng xuất"
                            onClick={() => {
                                localStorage.removeItem("accessToken")
                                // Nếu bạn lưu thêm refreshToken hoặc user info, xóa luôn ở đây
                                // localStorage.removeItem("refreshToken")
                                // localStorage.removeItem("user")
                            }}>
                            <Link to="/login">
                                <LogOut className="h-4 w-4" />
                                <span>Đăng xuất</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
