// src/router/config/routesConfig.js
/**
 * Configuración centralizada de rutas
 * Single Responsibility: Solo agrupa y exporta todas las rutas
 * Open/Closed: Fácil de extender agregando nuevas rutas sin modificar este archivo
 */

import { dashboardRoutes } from '@router/modules/dashboard.routes.jsx';
import { estudiantesRoutes } from '@router/modules/estudiantes.routes.jsx';
import { inscripcionesRoutes } from '@router/modules/inscripciones.routes.jsx';
import { calificacionesRoutes } from '@router/modules/calificaciones.routes.jsx';
import { nivelacionesRoutes } from '@router/modules/nivelaciones.routes.jsx';
import { docentesRoutes } from '@router/modules/docentes.routes.jsx';
import { pasantiasRoutes } from '@router/modules/pasantias.routes.jsx';
import { supervisionRoutes } from '@router/modules/supervision.routes.jsx';
import { horariosRoutes } from '@router/modules/horarios.routes.jsx';
import { pagosRoutes } from '@router/modules/pagos.routes.jsx';
import { historialRoutes } from '@router/modules/historial.routes.jsx';
import { boletinesRoutes } from '@router/modules/boletines.routes.jsx';
import { reportesRoutes } from '@router/modules/reportes.routes.jsx';
import { usuariosRoutes } from '@router/modules/usuarios.routes.jsx';

/**
 * Obtiene todas las rutas de todos los módulos
 * @returns {Array} - Array con todas las rutas agrupadas
 */
export const getAllRoutes = () => {
    return [
        ...dashboardRoutes,
        ...estudiantesRoutes,
        ...inscripcionesRoutes,
        ...calificacionesRoutes,
        ...nivelacionesRoutes,
        ...docentesRoutes,
        ...pasantiasRoutes,
        ...supervisionRoutes,
        ...horariosRoutes,
        ...pagosRoutes,
        ...historialRoutes,
        ...boletinesRoutes,
        ...reportesRoutes,
        ...usuariosRoutes,
    ];
};
