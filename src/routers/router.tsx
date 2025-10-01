
import LoginPage from '@/page/auth/login/login';
import RegisterPage from '@/page/auth/register/register';
import HomePage from '@/page/home/home';
import RepairShopDashboardPage from '@/page/repair-shop/dashboard/dasboard';
import RepairShopLayout from '@/page/repair-shop/layout';
import ProductsPage from '@/page/supplier/products/products';
import SupplierDashboardPage from '@/page/supplier/dashboard/dasboard';
import { createBrowserRouter } from 'react-router-dom';
import SupplierLayout from '@/page/supplier/layout';


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
        path: '/repair-shop/dashboard',
        element: (
            <RepairShopLayout>
                <RepairShopDashboardPage />
            </RepairShopLayout>
        ),
    },

    {
        path: '/products',
        element: (
            <SupplierLayout>
                <SupplierDashboardPage />
            </SupplierLayout>
        )
    },
    {
        path: '/suppliers',
        element: (
            <SupplierLayout>
                <ProductsPage />
            </SupplierLayout>
        )
    },

]);

export default router;