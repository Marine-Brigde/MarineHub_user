import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SupplierSidebar } from "@/components/supplier/supplier-siderbar"

export default function SupplierLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <SupplierSidebar />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    )
}
