// src/infrastructure/navigation/router/routerConfig.js
/**
 * Configuración centralizada de rutas
 * 
 * Single Responsibility: Solo agrupa y exporta todas las rutas de los módulos
 * Open/Closed: Fácil de extender agregando nuevas rutas sin modificar este archivo
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración técnica que agrupa rutas de presentation
 * - Depende de: presentation/routes/modules (definiciones de rutas)
 * 
 * Las definiciones de rutas están en presentation porque contienen metadata de UI
 * (labels del menú, orden, estructura visual) aunque también definen paths técnicos.
 */

import { dashboardRoutes } from '@routes/modules/dashboard.routes.jsx';
import { gestionesRoutes } from '@routes/modules/gestiones.routes.jsx';
import { configuracionRoutes } from '@routes/modules/configuracion.routes.jsx';
import { estudiantesRoutes } from '@routes/modules/estudiantes.routes.jsx';
import { inscripcionesRoutes } from '@routes/modules/inscripciones.routes.jsx';
import { trazabilidad } from '@routes/modules/trazabilidad.routes.jsx';
import { calificacionesRoutes } from '@routes/modules/calificaciones.routes.jsx';
import { nivelacionesRoutes } from '@routes/modules/nivelaciones.routes.jsx';
import { docentesRoutes } from '@routes/modules/docentes.routes.jsx';
import { supervisionRoutes } from '@routes/modules/supervision.routes.jsx';
import { pagosRoutes } from '@routes/modules/pagos.routes.jsx';
import { historialRoutes } from '@routes/modules/historial.routes.jsx';
import { reportesRoutes } from '@routes/modules/reportes.routes.jsx';
import { usuariosRoutes } from '@routes/modules/usuarios.routes.jsx';

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
