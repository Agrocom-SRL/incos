// src/presentation/routes/modules/index.js
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
 * impórtalas directamente desde sus archivos (ej: './dashboard.routes.jsx')
 */

// Importar todas las rutas para usarlas en getAllRoutes()
import { dashboardRoutes } from './dashboard.routes.jsx';
import { gestionesRoutes } from './gestiones.routes.jsx';
import { configuracionRoutes } from './configuracion.routes.jsx';
import { estudiantesRoutes } from './estudiantes.routes.jsx';
import { inscripcionesRoutes } from './inscripciones.routes.jsx';
import { trazabilidad } from './trazabilidad.routes.jsx';
import { calificacionesRoutes } from './calificaciones.routes.jsx';
import { nivelacionesRoutes } from './nivelaciones.routes.jsx';
import { docentesRoutes } from './docentes.routes.jsx';
import { supervisionRoutes } from './supervision.routes.jsx';
import { pagosRoutes } from './pagos.routes.jsx';
import { historialRoutes } from './historial.routes.jsx';
import { reportesRoutes } from './reportes.routes.jsx';
import { usuariosRoutes } from './usuarios.routes.jsx';

/**
 * Obtiene todas las rutas de todos los módulos
 * @returns {Array} - Array con todas las rutas agrupadas
 */
export const getAllRoutes = () => {
    return [
        ...dashboardRoutes,
        ...gestionesRoutes,
        ...configuracionRoutes,
        ...estudiantesRoutes,
        ...inscripcionesRoutes,
        ...trazabilidad,
        ...calificacionesRoutes,
        ...nivelacionesRoutes,
        ...docentesRoutes,
        ...supervisionRoutes,
        ...pagosRoutes,
        ...historialRoutes,
        ...reportesRoutes,
        ...usuariosRoutes,
    ];
};
