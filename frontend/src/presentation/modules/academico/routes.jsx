// src/presentation/modules/academico/routes.jsx
/**
 * Dominio Académico (ACA). Raíz de menú: dominios/routes.jsx → key ACA.
 *
 * Cada ítem del submenú tiene su directorio y routes.jsx propio
 * (mismo patrón que institucional/horarios, institucional/oferta, …).
 */

import { UnderConstruction } from '@components/pages';
import { calificacionesRoutes } from './calificaciones/routes.jsx';
import { centralizadorRoutes } from './centralizador/routes.jsx';
import { librosRoutes } from './libros/routes.jsx';
import { asistenciaRoutes } from './asistencia/routes.jsx';
import { nivelacionesRoutes } from './nivelaciones/routes.jsx';
import { historialRoutes } from './historial/routes.jsx';
import { seguimientoRoutes } from './seguimiento/routes.jsx';
import { avanceRoutes } from './avance/routes.jsx';
import { acompanamientoRoutes } from './acompanamiento/routes.jsx';

export const academicoRoutes = [
  {
    path: '/academico',
    element: <UnderConstruction />,
    key: 'ACA-ROOT',
    menu: null,
  },
  ...calificacionesRoutes,
  ...centralizadorRoutes,
  ...librosRoutes,
  ...asistenciaRoutes,
  ...nivelacionesRoutes,
  ...historialRoutes,
  // Seguimiento académico (ítem ACA-SEGUIMIENTO): agrupa Avance + Acompañamiento
  // en tabs por permiso; avance/acompanamiento conservan sus URLs como gemelas.
  ...seguimientoRoutes,
  ...avanceRoutes,
  ...acompanamientoRoutes,
];

export default academicoRoutes;
