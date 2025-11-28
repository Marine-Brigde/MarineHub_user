"use client"

import SupplierOrders from '@/components/supplier/supplier-orders'

export default function SupplierOrdersPage() {
    return (
        <div className="min-h-screen bg-background">

            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <SupplierOrders />
                </div>
            </div>
        </div>
    )
}
