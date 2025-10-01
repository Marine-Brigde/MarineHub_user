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
        url: "/supplier/dashboard",
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
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 py-2">
                    <Anchor className="h-8 w-8 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sidebar-foreground">MaritimeHub</span>
                        <span className="text-xs text-sidebar-foreground/70">Nhà cung cấp</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={false} tooltip={item.title}>
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
                            <Link to="/supplier/settings">
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
                                <AvatarImage src="/placeholder-su7cr.png" />
                                <AvatarFallback>NC</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium text-sidebar-foreground truncate">Công ty ABC Marine</span>
                                <span className="text-xs text-sidebar-foreground/70 truncate">supplier@abc.com</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Đăng xuất">
                            <Link to="/auth/login">
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
