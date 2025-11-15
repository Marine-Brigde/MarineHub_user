
import LoginPage from '@/page/auth/login/login';
import RegisterPage from '@/page/auth/register/register';
import SupplierRegisterPage from '@/page/auth/supplier-register/supplier-register';
import HomePage from '@/page/home/home';
import RepairShopDashboardPage from '@/page/repair-shop/dashboard/dasboard';
import RepairShopLayout from '@/page/repair-shop/layout';
import ProductsPage from '@/page/supplier/products/products';
import SupplierDashboardPage from '@/page/supplier/dashboard/dasboard';
import { createBrowserRouter } from 'react-router-dom';
import SupplierLayout from '@/page/supplier/layout';
import ServicesPage from '@/page/repair-shop/services/services';
import { DockManagement } from '@/components/repair-shop/dock-management';
import CategoryManagement from '@/components/supplier/category-management';
import BoatyardProfilePage from '@/page/repair-shop/profile/profile';


const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
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
        path: '/suppliers',
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
                <ProductsPage />
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
    }

]);

export default router;