
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
import PublicSuppliersPage from '@/page/suppliers/suppliers';
import SupplierDashboardPage from '@/page/supplier/dashboard/dasboard';


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
            <RepairShopLayout>
                <RepairShopDashboardPage />
            </RepairShopLayout>
        ),
    },
    {
        path: '/repair-shop/services',

        element: (
            <RepairShopLayout>
                <ServicesPage />
            </RepairShopLayout>
        ),
    },
    {
        path: '/repair-shop/dock',
        element: (
            <RepairShopLayout>
                <DockManagement />
            </RepairShopLayout>)
    },
    {
        path: '/repair-shop/profile',
        element: (
            <RepairShopLayout>
                <BoatyardProfilePage />
            </RepairShopLayout>
        )
    },
    {
        path: '/repair-shop/complaints',
        element: (
            <RepairShopLayout>
                <BoatyardComplaintsPage />
            </RepairShopLayout>
        )
    },

    {
        path: '/suppliers',
        element: <PublicSuppliersPage />,
    },
    {
        path: '/supplier/dashboard',
        element: (
            <SupplierLayout>
                <SupplierDashboardPage />
            </SupplierLayout>
        )
    },
    {
        path: '/supplier/products',
        element: (
            <SupplierLayout>
                <SupplierProductsPage />
            </SupplierLayout>
        )
    },
    {
        path: '/supplier/categories',
        element: (
            <SupplierLayout>
                <CategoryManagement />
            </SupplierLayout>
        )
    },
    {
        path: '/supplier/profile',
        element: (
            <SupplierLayout>
                <SupplierProfilePage />
            </SupplierLayout>
        )
    },
    {
        path: '/supplier/complaints',
        element: (
            <SupplierLayout>
                <SupplierComplaintsPage />
            </SupplierLayout>
        )
    }

]);

export default router;