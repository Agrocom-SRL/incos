// src/presentation/modules/index.js
/**
 * Modules Registry - Agrupa todas las rutas de los módulos
 * 
 * Single Responsibility: Proporciona acceso centralizado a todas las rutas de los módulos
 * Open/Closed: Fácil de extender agregando nuevas rutas sin modificar este archivo
 * 
 * Clean Architecture:
 * - Presentation Layer: Contiene metadata de UI (labels del menú, orden, estructura visual)
 * 
 * Nota: Solo exporta getAllRoutes(). Si necesitas rutas individuales,
 * impórtalas directamente desde los módulos (ej: '@modules/estudiantes/routes')
 */

// Importar todas las rutas desde los módulos
import { authRoutes } from './auth/routes.jsx';
import { dashboardRoutes } from './dashboard/routes.jsx';
import { dominiosRoutes } from './dominios/routes.jsx';
import { estudiantesRoutes } from '@estudiantes/routes';
import { matriculaRoutes } from './matricula/routes.jsx';
import { academicoRoutes } from './academico/routes.jsx';
import { docentesRoutes } from './docentes/routes.jsx';
import { institucionalRoutes } from './institucional/routes.jsx';
import { supervisionRoutes } from './supervision/routes.jsx';
import { pagosRoutes } from './pagos/routes.jsx';
import { finanzasRoutes } from './finanzas/routes.jsx';
import { reportesRoutes } from './reportes/routes.jsx';
import { configuracionRoutes } from './configuracion/routes.jsx';
import { usuariosRoutes } from './usuarios/routes.jsx';

/**
 * Obtiene todas las rutas de todos los módulos
 * @returns {Array} - Array con todas las rutas agrupadas
 */
export const getAllRoutes = () => {
    return [
        ...authRoutes,
        ...dashboardRoutes,
        ...dominiosRoutes,
        ...estudiantesRoutes,
        ...matriculaRoutes,
        ...academicoRoutes,
        ...docentesRoutes,
        ...institucionalRoutes,
        ...supervisionRoutes,
        ...pagosRoutes,
        ...finanzasRoutes,
        ...reportesRoutes,
        ...configuracionRoutes,
        ...usuariosRoutes,
    ];
};

