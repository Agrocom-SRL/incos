import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import { ROLES_INTEGRANTE_TUTORIA } from '../../../domain/constants/titulacion.constants.js';
import { ActaDefensaMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: ListActasDefensaProyectoUseCase
 * Módulo: Titulación (TIT), extensión 2026-08-01 (acta de defensa de grado)
 *
 * Lista las actas de defensa de un proyecto (N actas si PSP grupal), con el
 * tribunal anidado, ordenadas por estudiante TITULAR primero.
 *
 * Sin guard de pertenencia adicional para ESTUDIANTE: se sigue el MISMO
 * patrón que el resto de satélites de la ficha del proyecto
 * (`ListBitacoraProyectoUseCase`, `ListDictamenesProyectoUseCase`, y el
 * propio `GetProyectoGradoByIdUseCase` de T6) — solo existencia del proyecto
 * (`getProyectoOrFail`); la restricción de acceso vive en el permiso
 * `titulacion.proyecto`·DETALLE (ESTUDIANTE lo tiene con el mismo alcance
 * que el resto de la ficha, sin guard de fila hoy en ningún satélite).
 */
export class ListActasDefensaProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.actaDefensaRepository
   * @param {Object} params.integranteProyectoRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    actaDefensaRepository,
    integranteProyectoRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.actaDefensaRepository = actaDefensaRepository;
    this.integranteProyectoRepository = integranteProyectoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @returns {Promise<{actasDefensa: Array<Object>, total: number}>}
   */
  async execute(proyectoGradoId) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const [actas, integrantes] = await Promise.all([
      this.actaDefensaRepository.findByProyectoId(proyectoGradoId),
      this.integranteProyectoRepository.findByProyectoGradoId(proyectoGradoId),
    ]);

    const titularIds = new Set(
      integrantes
        .filter((i) => i.rol === ROLES_INTEGRANTE_TUTORIA.TITULAR)
        .map((i) => i.estudianteId)
    );
    const ordenadas = [...actas].sort((a, b) => {
      const aEsTitular = titularIds.has(a.estudianteId) ? 0 : 1;
      const bEsTitular = titularIds.has(b.estudianteId) ? 0 : 1;
      if (aEsTitular !== bEsTitular) return aEsTitular - bEsTitular;
      return (a.numeroActa ?? 0) - (b.numeroActa ?? 0);
    });

    this.logger.info('[Titulación] Actas de defensa del proyecto listadas', {
      proyectoGradoId,
      total: ordenadas.length,
    });

    return { actasDefensa: ActaDefensaMapper.toList(ordenadas), total: ordenadas.length };
  }
}
