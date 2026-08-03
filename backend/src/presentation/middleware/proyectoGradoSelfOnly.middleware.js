import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS, TITULACION_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { tryResolveEstudianteIdForUsuario } from '../../application/utils/resolveEstudianteIdForUsuario.js';
import { assertIntegranteActivo } from '../../application/use-cases/titulacion/helpers/proyectoTutoriaGuards.js';

/**
 * Guard anti-IDOR para los satélites de la ficha del proyecto de grado que
 * reciben `:id` del cliente (`GET /proyectos-grado/:id`, `/:id/bitacora`,
 * `/:id/dictamenes`, `/:id/acta-defensa`).
 *
 * Hallazgo verificado 2026-08-02 (`docs/plan/acta-defensa-grado-plan-desarrollo.md`,
 * sección "Estado de los Bloques F y G", punto G5): ningún satélite de la
 * ficha validaba pertenencia por fila — el acceso de ESTUDIANTE se apoyaba
 * solo en el permiso grueso `titulacion.proyecto`·DETALLE (o
 * `titulacion.bitacora`·LISTAR), por lo que un estudiante autenticado podía
 * leer el proyecto (y sus satélites) de OTRO estudiante armando la llamada
 * HTTP a mano. No es explotable vía la UI real: el frontend de estudiante
 * usa `/mi-proyecto` y `/mis-tutorados`, que resuelven el ID en servidor
 * desde la sesión (nunca reciben `:id` del cliente) — por eso este guard NO
 * se agrega ahí.
 *
 * Reusa `assertIntegranteActivo` (mismo helper que ya usan los use cases de
 * escritura del módulo, ej. `AddIntegranteProyectoUseCase`) para no
 * duplicar la regla de pertenencia:
 *  - Si el usuario NO es estudiante (tryResolve devuelve null), pasa sin
 *    restricción (comportamiento admin/staff/docente normal).
 *  - Si el proyecto `:id` no existe, deja pasar para que el controlador
 *    responda 404 (no se filtra información a través de un 403).
 *  - Si el usuario ES estudiante y no es integrante ACTIVO del proyecto,
 *    `assertIntegranteActivo` lanza `ForbiddenError` — se propaga tal cual.
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (+
 * idValidator/validateRequest): necesita req.usuario y un req.params.id ya
 * validado. Resuelve los repositorios de forma perezosa desde el
 * contenedor DI (mismo patrón que aporteSelfOnlyGuard), para no alterar la
 * firma del router.
 */
export async function proyectoGradoIntegranteGuard(req, res, next) {
  try {
    const container = getAppContainer();
    const studentRepository = container.resolve(REPOSITORIOS_TOKENS.studentRepository);
    const userRepository = container.resolve(REPOSITORIOS_TOKENS.userRepository);

    const suEstudianteId = await tryResolveEstudianteIdForUsuario({
      studentRepository,
      userRepository,
      usuarioId: req.usuario.id,
    });

    // No es estudiante: comportamiento admin/staff/docente normal (sin restricción).
    if (suEstudianteId == null) {
      return next();
    }

    const proyectoGradoId = Number(req.params.id);
    const proyectoGradoRepository = container.resolve(TITULACION_TOKENS.proyectoGradoRepository);
    const proyecto = await proyectoGradoRepository.findById(proyectoGradoId);

    // Si el proyecto no existe, dejar que el controlador responda 404.
    if (!proyecto) {
      return next();
    }

    const integranteProyectoRepository = container.resolve(
      TITULACION_TOKENS.integranteProyectoRepository
    );
    await assertIntegranteActivo({
      integranteProyectoRepository,
      proyectoGradoId,
      estudianteId: suEstudianteId,
    });

    return next();
  } catch (err) {
    return next(err);
  }
}
