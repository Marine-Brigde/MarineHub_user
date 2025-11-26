"use client"
import Header from '@/components/common/header'
import SupplierOrders from '@/components/supplier/supplier-orders'

export default function SupplierOrdersPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <SupplierOrders />
                </div>
            </div>
        </div>
    )
}
