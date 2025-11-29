
import LoginPage from '@/page/auth/login/login';
import RegisterPage from '@/page/auth/register/register';
import SupplierRegisterPage from '@/page/auth/supplier-register/supplier-register';
import HomePage from '@/page/home/home';
import RepairShopDashboardPage from '@/page/repair-shop/dashboard/dasboard';
import RepairShopLayout from '@/page/repair-shop/layout';
import { default as SupplierProductsPage } from '@/page/supplier/products/products';
import { createBrowserRouter } from 'react-router-dom';
import SupplierLayout from '@/page/supplier/layout';
import ServicesPage from '@/page/repair-shop/services/services';
import { DockManagement } from '@/components/repair-shop/dock-management';
import CategoryManagement from '@/components/supplier/category-management';
import BoatyardProfilePage from '@/page/repair-shop/profile/profile';
import SupplierProfilePage from '@/page/supplier/profile/profile';
import SupplierComplaintsPage from '@/page/supplier/complaints/complaints';
import BoatyardComplaintsPage from '@/page/repair-shop/complaints/complaints';
import PublicProductsPage from '@/page/products/products';
import ProductDetailPage from '@/page/products/productDetail';
import PublicSuppliersPage from '@/page/suppliers/suppliers';
import SupplierDashboardPage from '@/page/supplier/dashboard/dasboard';
import SupplierReviewsPage from '@/page/supplier/reviews/reviews';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';


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
        path: '/repair-shop/dashboard',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <RepairShopDashboardPage />
                </RepairShopLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/repair-shop/services',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <ServicesPage />
                </RepairShopLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/repair-shop/dock',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <DockManagement />
                </RepairShopLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/repair-shop/profile',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <BoatyardProfilePage />
                </RepairShopLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/repair-shop/complaints',
        element: (
            <ProtectedRoute allowedRole="Boatyard">
                <RepairShopLayout>
                    <BoatyardComplaintsPage />
                </RepairShopLayout>
            </ProtectedRoute>
        )
    },

    {
        path: '/suppliers',
        element: <PublicSuppliersPage />,
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
    }

]);

export default router;