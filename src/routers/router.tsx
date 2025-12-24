
import LoginPage from '@/page/auth/login/login';
import RegisterPage from '@/page/auth/register/register';
import SupplierRegisterPage from '@/page/auth/supplier-register/supplier-register';
import HomePage from '@/page/home/home';
import RepairShopDashboardPage from '@/page/repair-shop/dashboard/dasboard';
import RepairShopLayout from '@/page/repair-shop/layout';
import { Outlet } from 'react-router-dom';
import { default as SupplierProductsPage } from '@/page/supplier/products/products';
import { createBrowserRouter } from 'react-router-dom';
import SupplierLayout from '@/page/supplier/layout';
import ServicesPage from '@/page/repair-shop/services/services';
import { DockManagement } from '@/components/repair-shop/dock-management';
import RepairShopOrdersPage from '@/page/repair-shop/orders/orders';
import CategoryManagement from '@/components/supplier/category-management';
import BoatyardProfilePage from '@/page/repair-shop/profile/profile';

import SupplierProfilePage from '@/page/supplier/profile/profile';
import SupplierComplaintsPage from '@/page/supplier/complaints/complaints';
import SupplierOrdersPage from '@/page/supplier/orders/orders';
import BoatyardComplaintsPage from '@/page/repair-shop/complaints/complaints';
import PublicProductsPage from '@/page/products/products';
import ProductDetailPage from '@/page/products/productDetail';
import PublicSuppliersPage from '@/page/suppliers/suppliers';
import SupplierDetailPage from '@/page/suppliers/supplier-detail';
import SupplierDashboardPage from '@/page/supplier/dashboard/dasboard';
import SupplierReviewsPage from '@/page/supplier/reviews/reviews';
import SupplierModifierGroupsPage from '@/page/supplier/modifier-groups/modifier-groups';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PaymentSuccessPage from '@/page/payment/success';
import RepairShopBookingsPage from '@/page/repair-shop/bookings/bookings';
import RepairShopBookingDetailPage from '@/page/repair-shop/bookings/bookingDetail';


const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/products',
        element: <PublicProductsPage />,
    },
    {
        path: '/products/:id',
        element: <ProductDetailPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/supplier-register',
        element: <SupplierRegisterPage />,
    },
    {
        path: '/repair-shop',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <Outlet />
                </RepairShopLayout>
            </ProtectedRoute>
        ),
        children: [
            { path: 'dashboard', element: <RepairShopDashboardPage /> },
            { path: 'services', element: <ServicesPage /> },
            { path: 'dock', element: <DockManagement /> },
            { path: 'orders', element: <RepairShopOrdersPage /> },
            { path: 'bookings', element: <RepairShopBookingsPage /> },
            { path: 'bookings/:id', element: <RepairShopBookingDetailPage /> },

            { path: 'profile', element: <BoatyardProfilePage /> },
            { path: 'complaints', element: <BoatyardComplaintsPage /> },
            { path: 'success', element: <PaymentSuccessPage /> },
        ],
    },

    {
        path: '/suppliers',
        element: <PublicSuppliersPage />,
    },
    {
        path: '/suppliers/:id',
        element: <SupplierDetailPage />,
    },
    {
        path: '/supplier/dashboard',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierDashboardPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/products',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierProductsPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/orders',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierOrdersPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/categories',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <CategoryManagement />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/profile',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierProfilePage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/complaints',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierComplaintsPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/reviews',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierReviewsPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/supplier/modifier-groups',
        element: (
            <ProtectedRoute allowedRole="Supplier">
                <SupplierLayout>
                    <SupplierModifierGroupsPage />
                </SupplierLayout>
            </ProtectedRoute>
        )
    }
    ,
    {
        path: '/success',
        element: <PaymentSuccessPage />,
    }

]);

export default router;