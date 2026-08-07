import { resolveDocenteIdForUsuario } from '../../../utils/resolveDocenteIdForUsuario.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';

/**
 * Use Case: ListMisFichasSeguimientoDocenteUseCase (S5)
 * Módulo: Docentes (DOC · supervisión docente · portal del docente)
 *
 * Fichas de seguimiento realizadas sobre los cursos del docente de la SESIÓN.
 * La vista 174 (WHERE docente_id = ?) resuelve el conjunto de fichas propias
 * (contexto + anti-IDOR); la ficha completa (TEXT de observaciones y SI/NO de
 * documentación, ausentes en la vista) se trae en un segundo batch desde el
 * repositorio CRUD de la entidad raíz, filtrando por esos mismos ids — el
 * docente lee el feedback textual completo de sus propias fichas, igual que
 * `GetFichaSeguimientoByIdUseCase` (DETALLE, sin permiso para DOCENTE).
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario, 403 si el usuario no está vinculado a un
 * docente); NUNCA se acepta docenteId del cliente (anti-IDOR).
 */
export class ListMisFichasSeguimientoDocenteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoListadoViewRepository - Vista 174
   * @param {Object} params.fichaSeguimientoClaseRepository - CRUD raíz (TEXT de observaciones)
   * @param {Object} params.teacherRepository - Resolución docente por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({
    fichaSeguimientoListadoViewRepository,
    fichaSeguimientoClaseRepository,
    teacherRepository,
    userRepository,
    logger,
  }) {
    this.fichaSeguimientoListadoViewRepository = fichaSeguimientoListadoViewRepository;
    this.fichaSeguimientoClaseRepository = fichaSeguimientoClaseRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{fichasSeguimiento: Array, total: number}>}
   */
  async execute({ usuarioId } = {}) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows, total } = await this.fichaSeguimientoListadoViewRepository.findListado(
      { docenteId },
      1,
      10000
    );

    this.logger.info('[Supervisión docente] Mis fichas listadas', {
      usuarioId,
      docenteId,
      total,
    });

    if (rows.length === 0) {
      return { fichasSeguimiento: [], total: 0 };
    }

    const ids = rows.map((row) => row.id);
    const { fichasSeguimientoClase: entidades } =
      await this.fichaSeguimientoClaseRepository.findAll({ ids });
    const entidadPorId = new Map(entidades.map((entidad) => [entidad.id, entidad]));

    const fichasSeguimiento = rows
      .map((row) => FichaSeguimientoMapper.toDetail(entidadPorId.get(row.id), row))
      .filter(Boolean);

    return { fichasSeguimiento, total };
  }
}
