// src/presentation/routes/index.js
/**
 * Routes Registry - Agrupa todas las rutas de los módulos
 * 
 * Single Responsibility: Proporciona acceso centralizado a todas las rutas
 * Open/Closed: Fácil de extender agregando nuevas rutas sin modificar este archivo
 * 
 * Clean Architecture:
 * - Presentation Layer: Contiene metadata de UI (labels del menú, orden, estructura visual)
 * 
 * Nota: Solo exporta getAllRoutes(). Si necesitas rutas individuales,
 * impórtalas directamente desde los módulos (ej: '@modules/estudiantes/routes')
 */

// Importar todas las rutas desde los módulos
import { dashboardRoutes } from '../modules/dashboard/routes.jsx';
import { estudiantesRoutes } from '../modules/estudiantes/routes.jsx';
import { inscripcionesRoutes } from '../modules/inscripciones/routes.jsx';
import { trazabilidad } from '../modules/trazabilidad/routes.jsx';
import { calificacionesRoutes } from '../modules/calificaciones/routes.jsx';
import { nivelacionesRoutes } from '../modules/nivelaciones/routes.jsx';
import { docentesRoutes } from '../modules/docentes/routes.jsx';
import { gestionesRoutes } from '../modules/gestiones/routes.jsx';
import { supervisionRoutes } from '../modules/supervision/routes.jsx';
import { pagosRoutes } from '../modules/pagos/routes.jsx';
import { historialRoutes } from '../modules/historial/routes.jsx';
import { reportesRoutes } from '../modules/reportes/routes.jsx';
import { configuracionRoutes } from '../modules/configuracion/routes.jsx';
import { usuariosRoutes } from '../modules/usuarios/routes.jsx';

/**
 * Obtiene todas las rutas de todos los módulos
 * @returns {Array} - Array con todas las rutas agrupadas
 */
export const getAllRoutes = () => {
    return [
        ...dashboardRoutes,
        ...estudiantesRoutes,
        ...inscripcionesRoutes,
        ...trazabilidad,
        ...calificacionesRoutes,
        ...nivelacionesRoutes,
        ...docentesRoutes,
        ...gestionesRoutes,
        ...supervisionRoutes,
        ...pagosRoutes,
        ...historialRoutes,
        ...reportesRoutes,
        ...configuracionRoutes,
        ...usuariosRoutes,
    ];
};
