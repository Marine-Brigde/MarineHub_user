import { useLocation } from "react-router-dom"
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
        title: "Bến đậu tàu",
        url: "/repair-shop/dock",
        icon: MapPin,
    },
    {
        title: "Báo cáo tiến độ",
        url: "/repair-shop/reports",
        icon: FileText,
    },
]

export function RepairShopSidebar() {
    const location = useLocation();

    return (
        <Sidebar className="min-w-[270px]">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-3 px-4 py-4">
                    <Anchor className="h-10 w-10 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-sidebar-foreground">MaritimeHub</span>
                        <span className="text-sm text-sidebar-foreground/70">Xưởng sửa chữa</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="gap-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.url);
                        return (
                            <SidebarMenuItem key={item.title} className="mb-2">
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                    className={`flex items-center gap-4 px-5 py-3 rounded-lg text-base transition-all
                                        ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10"}`}
                                >
                                    <Link to={item.url}>
                                        <item.icon className="h-6 w-6" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>

                <SidebarSeparator className="my-4" />

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Cài đặt"
                            isActive={location.pathname.startsWith("/repair-shop/settings")}
                            className={`flex items-center gap-4 px-5 py-3 rounded-lg text-base transition-all
                                ${location.pathname.startsWith("/repair-shop/settings") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10"}`}
                        >
                            <Link to="/repair-shop/settings">
                                <Settings className="h-6 w-6" />
                                <span>Cài đặt</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border mt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-4 py-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="/placeholder.svg?key=repair" />
                                <AvatarFallback>XS</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-base font-medium text-sidebar-foreground truncate">Xưởng Sửa chữa Hải Phòng</span>
                                <span className="text-sm text-sidebar-foreground/70 truncate">repair@haiphong.com</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Đăng xuất"
                            className="flex items-center gap-4 px-5 py-3 rounded-lg text-base hover:bg-red-100 transition-all"
                            onClick={() => {
                                localStorage.removeItem("accessToken")
                            }}
                        >
                            <Link to="/login">
                                <LogOut className="h-6 w-6" />
                                <span>Đăng xuất</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
