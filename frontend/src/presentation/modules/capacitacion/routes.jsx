// src/presentation/modules/capacitacion/routes.jsx
/**
 * Dominio Capacitación (CAP). Raíz de menú: dominios/routes.jsx → key CAP.
 *
 * Cursos cortos a público externo (participantes sin usuario/rol del sistema),
 * independiente de la cadena formal de matrícula. Cada ítem del submenú tiene
 * su directorio y routes.jsx propio (mismo patrón que finanzas/).
 *
 * Menú CAP: Cursos · Participantes · Inscripciones · Grupos.
 * Permisos del seed 65-CAP: capacitacion.{curso,participante,inscripcion,pago,grupo}.
 */

import { UnderConstruction } from '@components/pages';
import { capacitacionCursosRoutes } from './cursos/routes.jsx';
import { capacitacionParticipantesRoutes } from './participantes/routes.jsx';
import { capacitacionInscripcionesRoutes } from './inscripciones/routes.jsx';
import { capacitacionGruposRoutes } from './grupos/routes.jsx';

export const capacitacionRoutes = [
  {
    path: '/capacitacion',
    element: <UnderConstruction />,
    key: 'CAP-ROOT',
    menu: null,
  },
  ...capacitacionCursosRoutes,
  ...capacitacionParticipantesRoutes,
  ...capacitacionInscripcionesRoutes,
  ...capacitacionGruposRoutes,
];

export default capacitacionRoutes;
