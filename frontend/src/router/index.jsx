// src/router/index.jsx
/**
 * Punto de entrada principal del router
 * Single Responsibility: Solo exporta el componente AppRouter
 * Dependency Inversion: Depende de abstracciones (routerService)
 */

import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routerService';

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
