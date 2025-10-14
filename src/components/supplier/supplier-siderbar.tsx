"use client"

import { Anchor, BarChart3, Package, ShoppingCart, MapPin, MessageSquare, Settings, LogOut } from "lucide-react"

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
        url: "/suppliers",
        icon: BarChart3,
    },
    {
        title: "Quản lý sản phẩm",
        url: "/supplier/products",
        icon: Package,
    },
    {
        title: "Đơn hàng",
        url: "/supplier/orders",
        icon: ShoppingCart,
    },
    {
        title: "Giao hàng",
        url: "/supplier/delivery",
        icon: MapPin,
    },
    {
        title: "Đánh giá & Phản hồi",
        url: "/supplier/reviews",
        icon: MessageSquare,
    },
]

export function SupplierSidebar() {
    return (
        <Sidebar className="min-w-[270px]">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-3 px-4 py-4">
                    <Anchor className="h-10 w-10 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-sidebar-foreground">MaritimeHub</span>
                        <span className="text-sm text-sidebar-foreground/70">Nhà cung cấp</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="gap-2 mt-4">
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.title} className="mb-2">
                            <SidebarMenuButton
                                asChild
                                isActive={false}
                                tooltip={item.title}
                                className="flex items-center gap-4 px-5 py-3 rounded-lg text-base hover:bg-primary/10 transition-all"
                            >
                                <Link to={item.url}>
                                    <item.icon className="h-6 w-6" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                <SidebarSeparator className="my-4" />

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Cài đặt"
                            className="flex items-center gap-4 px-5 py-3 rounded-lg text-base hover:bg-primary/10 transition-all"
                        >
                            <Link to="/supplier/settings">
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
                                <AvatarImage src="/placeholder-su7cr.png" />
                                <AvatarFallback>NC</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-base font-medium text-sidebar-foreground truncate">Công ty ABC Marine</span>
                                <span className="text-sm text-sidebar-foreground/70 truncate">supplier@abc.com</span>
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
