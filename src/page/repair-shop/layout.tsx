import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RepairShopSidebar } from "@/components/repair-shop/reapair-shop-siderbar"

export default function RepairShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <RepairShopSidebar />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    )
}
