// src/presentation/components/router/LayoutWrapper.jsx
/**
 * Layout wrapper que envuelve todas las rutas con MainLayout
 * Single Responsibility: Solo maneja el layout principal
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from '@templates/mainlayout';
import { Sidebar, Header } from '@templates/MainLayout/components';
import LoadingFallback from './LoadingFallback';

const LayoutWrapper = () => {
    return (
        <MainLayout
            header={(props) => <Header {...props} />}
            sidebar={(props) => <Sidebar {...props} />}
        >
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        </MainLayout>
    );
};

export default LayoutWrapper;
