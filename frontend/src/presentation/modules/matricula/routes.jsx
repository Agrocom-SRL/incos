// src/presentation/modules/matricula/routes.jsx
/**
 * Dominio Matrícula (MAT). Raíz de menú: dominios/routes.jsx → key MAT.
 *
 * Consolida bajo un único folder los ítems de menú del dominio, cada uno
 * con su propio directorio y routes.jsx (mismo patrón de composición que
 * capacitacion/titulacion/finanzas):
 * - `nuevo/`: "Nuevo estudiante" (alta + edición, único componente
 *   `EstudiantesRegister.jsx`, permisos `matricula.admision.crear/editar`),
 *   URLs `/estudiantes/registrar` y `/estudiantes/:id/editar` (sin cambio de URL).
 * - `admision/`: "Proceso de admisión" (listado + ficha de detalle, permiso
 *   `matricula.admision.ver`), URLs `/estudiantes/listar` y `/estudiantes/:id`
 *   (sin cambio de URL). También aloja `MAT-DOCUMENTOS` (placeholder, aún sin
 *   construir) y el resto del núcleo compartido de estudiante (fusionado desde
 *   `estudiantes/`, ya eliminada), consumido en cruce por `nuevo/`, `becas/`,
 *   `aportes/`, `seguridad/`, `docentes/` y `registro/`.
 * - `becas/`: "Becas y descuentos" (listado + flujo de asignación en 3
 *   pasos), URLs `/estudiantes/becas/*` (sin cambio de URL).
 * - `registro/`: "Registro de matrículas" (inscripción a materias por
 *   gestión, permiso `matricula.inscribir`), URLs `/matricula/*` con
 *   redirects de compatibilidad desde `/inscripciones/*`.
 * - `aportes/`: "Aportes de matrícula" (pagos de cuotas por estudiante,
 *   permiso `matricula.pago.aporte.ver`), URL con menú `/matricula/aportes/listar`
 *   más las URLs legacy `/pagos/*` (sin menú, dominio Finanzas, siguen
 *   operativas — misma carpeta atiende ambos dominios, sin cambio de URL).
 */

import { UnderConstruction } from '@components/pages';
import { estudiantesNuevoRoutes } from './nuevo/routes.jsx';
import { estudiantesAdmisionRoutes } from './admision/routes.jsx';
import { matriculaBecasRoutes } from './becas/routes.jsx';
import { matriculaRegistroRoutes } from './registro/routes.jsx';
import { matriculaAportesRoutes } from './aportes/routes.jsx';

export const matriculaRoutes = [
  {
    path: '/matricula',
    element: <UnderConstruction />,
    key: 'MAT-ROOT',
    menu: null,
  },
  ...estudiantesNuevoRoutes,
  ...estudiantesAdmisionRoutes,
  ...matriculaBecasRoutes,
  ...matriculaRegistroRoutes,
  ...matriculaAportesRoutes,
];

export default matriculaRoutes;
