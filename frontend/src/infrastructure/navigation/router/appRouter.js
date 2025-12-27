// src/infrastructure/navigation/router/createAppRouter.js
/**
 * Factory para crear y configurar el router de la aplicación
 * 
 * Responsabilidades:
 * - Configurar todas las rutas de la aplicación
 * - Manejar verificación de autenticación (ruta raíz)
 * - Aplicar layout principal a todas las rutas protegidas
 * 
 * Single Responsibility: Solo crea y configura el router (Factory Pattern)
 * Dependency Inversion: Depende de abstracciones (config, services, layout)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementa la creación del router usando react-router-dom
 * - Depende de: routerConfig (mismo directorio), navigation services, presentation (LayoutWrapper)
 * 
 * TODO: Cuando se implemente autenticación, aquí se verificará:
 * - Si el usuario está autenticado → redirigir a /dashboard
 * - Si no está autenticado → redirigir a /login
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getAllRoutes } from '@navigation-router/routerConfig';
import { normalizeRoutes } from '@navigation-services/routeNormalizer';
import LayoutWrapper from '@presentation/components/router/LayoutWrapper';

/**
 * Factory function que crea y configura el router de la aplicación
 * 
 * Arquitectura:
 * 1. Obtiene todas las rutas de los módulos (routerConfig en mismo directorio)
 * 2. Filtra rutas con elementos (excluye grupos padre)
 * 3. Normaliza los paths (navigation services)
 * 4. Crea el router con LayoutWrapper (presentation layer)
 * 
 * Maneja la verificación de autenticación en la ruta raíz:
 * - Por ahora: siempre redirige a /dashboard (simula usuario logueado)
 * - Futuro: verificar token/sesión y redirigir según autenticación
 * 
 * @returns {Router} - El router configurado de react-router-dom
 */
export const createAppRouter = () => {
    // Obtener todas las rutas de los módulos
    const allRoutes = getAllRoutes();
    
    // Filtrar solo rutas con elemento (excluir grupos padre sin página)
    const routesWithElements = allRoutes.filter(route => route.element !== null && route.element !== undefined);
    
    // Normalizar las rutas
    const normalizedRoutes = normalizeRoutes(routesWithElements);
    
    // TODO: Verificación de autenticación
    // const isAuthenticated = checkAuth(); // Implementar cuando haya módulo de auth
    
    // Crear el router con el layout principal
    return createBrowserRouter([
        {
            path: '/',
            element: <LayoutWrapper />,
            children: [
                // Ruta raíz: verificación de autenticación y redirección
                // Por ahora simula usuario logueado (siempre redirige a dashboard)
                // TODO: Implementar verificación real de autenticación
                {
                    index: true,
                    element: <Navigate to="/dashboard" replace />,
                    // Futuro: element: isAuthenticated 
                    //     ? <Navigate to="/dashboard" replace />
                    //     : <Navigate to="/login" replace />
                },
                // Todas las demás rutas protegidas (requieren autenticación)
                ...normalizedRoutes.map(route => ({
                    path: route.path,
                    element: route.element,
                    // TODO: Agregar loader/guard para verificar autenticación en cada ruta
                })),
            ],
        },
    ]);
};
