// src/router/routerService.jsx
/**
 * Servicio para crear y configurar el router
 * 
 * Single Responsibility: Solo crea y configura el router
 * Dependency Inversion: Depende de abstracciones (config, normalizer, layout)
 * 
 * Ubicación: router/ (capa de navegación, no es infraestructura técnica)
 */

import { createBrowserRouter } from 'react-router-dom';
import { getAllRoutes } from '@config/router/routesConfig';
import { normalizeRoutes } from '@utils/router/routeNormalizer';
import LayoutWrapper from '@presentation/components/router/LayoutWrapper';

/**
 * Crea y configura el router de la aplicación
 * @returns {Router} - El router configurado
 */
export const createAppRouter = () => {
    // Obtener todas las rutas de los módulos
    const allRoutes = getAllRoutes();
    
    // Normalizar las rutas
    const normalizedRoutes = normalizeRoutes(allRoutes);
    
    // Crear el router con el layout principal
    return createBrowserRouter([
        {
            path: '/',
            element: <LayoutWrapper />,
            children: normalizedRoutes.map(route => ({
                path: route.path,
                element: route.element,
            })),
        },
    ]);
};
