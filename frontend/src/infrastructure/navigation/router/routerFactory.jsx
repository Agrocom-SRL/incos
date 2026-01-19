// src/infrastructure/navigation/router/routerFactory.jsx
/**
 * Router Factory - Factory Pattern
 * 
 * Propósito: Encapsular la lógica de creación del router de react-router-dom
 * 
 * Responsabilidades:
 * - Orquestar la creación del router de la aplicación
 * - Aplicar layout principal a todas las rutas protegidas
 * 
 * Single Responsibility: Solo orquesta la creación del router (Factory Pattern)
 * - Delegación de responsabilidades:
 *   - Filtrado de rutas → routeFilter service
 *   - Normalización de rutas → routeNormalizer service
 *   - Autenticación → (futuro: authGuard service)
 * Dependency Inversion: Depende de abstracciones (config, services, layout)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementa la creación del router usando react-router-dom
 * - Depende de: routes/modules (presentation layer), navigation services, presentation (MainLayout template)
 * 
 * TODO: Cuando se implemente autenticación, aquí se verificará:
 * - Si el usuario está autenticado → redirigir a /dashboard
 * - Si no está autenticado → redirigir a /login
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getAllRoutes } from '@routes';
import { normalizeRoutes } from '@navigation-services/routeNormalizer';
import { filterRoutesWithElements } from '@navigation-services/routeFilter';
import { MainLayout } from '@templates';
import { AuthGuard, PublicRoute } from '@navigation-guards';
import Login from '@modules/auth/pages/Login';

/**
 * Factory function que crea y configura el router de la aplicación
 * 
 * Arquitectura:
 * 1. Obtiene todas las rutas de los módulos (routes/modules en presentation layer)
 * 2. Filtra rutas con elementos (excluye grupos padre)
 * 3. Normaliza los paths (navigation services)
 * 4. Crea el router con MainLayout template (presentation layer)
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
    const routesWithElements = filterRoutesWithElements(allRoutes);
    
    // Normalizar las rutas
    const normalizedRoutes = normalizeRoutes(routesWithElements);
    
    // Separar rutas públicas (login) de rutas protegidas
    const publicRoutes = normalizedRoutes.filter(route => route.path === '/login');
    const protectedRoutes = normalizedRoutes.filter(route => route.path !== '/login');
    
    // Crear el router con autenticación
    return createBrowserRouter([
        // Ruta pública: Login (solo accesible si NO está autenticado)
        {
            path: '/login',
            element: (
                <PublicRoute>
                    <Login />
                </PublicRoute>
            ),
        },
        // Rutas protegidas: Requieren autenticación
        {
            path: '/',
            element: (
                <AuthGuard>
                    <MainLayout />
                </AuthGuard>
            ),
            children: [
                // Ruta raíz: redirigir a dashboard si está autenticado
                {
                    index: true,
                    element: <Navigate to="/dashboard" replace />,
                },
                // Todas las demás rutas protegidas (requieren autenticación)
                ...protectedRoutes.map(route => ({
                    path: route.path,
                    element: route.element,
                })),
            ],
        },
    ]);
};
