// src/presentation/components/router/AppRouter.jsx
/**
 * Componente principal del router de la aplicación
 * 
 * Single Responsibility: Envuelve el RouterProvider con el router configurado
 * Dependency Inversion: Depende de la factory createAppRouter (infrastructure)
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente React que consume el router configurado
 * - Depende de: createAppRouter (factory del router en infrastructure/navigation)
 */

import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from '@navigation-router/appRouter';

// Crear el router una sola vez
const router = createAppRouter();

/**
 * Componente principal del router de la aplicación
 * Proporciona el router a toda la aplicación
 */
export const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
