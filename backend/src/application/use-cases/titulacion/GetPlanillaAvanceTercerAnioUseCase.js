import { ValidationError } from '../../../domain/errors/AppError.js';
import { TutoriaAvanceMapper } from '../../mappers/titulacion/index.js';
import {
  ESTUDIANTES_POR_FOLIO_TUTORIA,
  RESULTADOS_TUTORIA_TERCER_ANIO,
} from '../../../domain/constants/titulacion.constants.js';

/**
 * Use Case: GetPlanillaAvanceTercerAnioUseCase
 * Módulo: Titulación (TIT), Requisito 3 — extensión 2026-07-31
 *
 * Planilla de avance de tutorías "10 en 10" (bimestral, 3er año): roster
 * ordenado en orden institucional (vista 181, ya ordena por apellido
 * paterno/materno/nombres) paginado en folios de 10, más `resumenTutores`
 * (docentes distintos del roster, para la hoja de firmas) y `tally` (conteo
 * por `resultado_tutoria`). NO requiere tabla nueva (ver §0.5 del plan de
 * desarrollo): se deriva en tiempo de lectura de la vista 181.
 */
export class GetPlanillaAvanceTercerAnioUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.tutoriaAvanceViewRepository - Vista 181
   * @param {Object} params.calificacionContextoRepository - Gestión vigente
   * @param {Object} params.managementRepository - Año de gestión para la cabecera
   * @param {ILogger} params.logger
   */
  constructor({
    tutoriaAvanceViewRepository,
    calificacionContextoRepository,
    managementRepository,
    logger,
  }) {
    this.tutoriaAvanceViewRepository = tutoriaAvanceViewRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { carreraId (requerido), gestionId, bimestre (requerido) }
   * @returns {Promise<{planillaAvanceTercerAnio: Object}>}
   */
  async execute(queryParams = {}) {
    const { carreraId, bimestre } = queryParams;
    if (!carreraId) {
      throw new ValidationError('carreraId es requerido');
    }
    if (!bimestre) {
      throw new ValidationError('bimestre es requerido');
    }

    const gestionId = queryParams.gestionId
      ? Number(queryParams.gestionId)
      : await this._resolverGestionVigente();

    const rows = await this.tutoriaAvanceViewRepository.findPlanillaAvanceTercerAnio({
      carreraId: Number(carreraId),
      gestionId: gestionId ?? undefined,
      bimestre: Number(bimestre),
    });

    const filas = TutoriaAvanceMapper.planillaRowsToPresentation(rows);
    // La vista ya ordena en orden institucional (apellido paterno, apellido
    // materno, nombres); solo se numera para la nómina impresa.
    filas.forEach((fila, idx) => {
      fila.numeroOrden = idx + 1;
    });

    const folios = [];
    for (let i = 0; i < filas.length; i += ESTUDIANTES_POR_FOLIO_TUTORIA) {
      folios.push(filas.slice(i, i + ESTUDIANTES_POR_FOLIO_TUTORIA));
    }

    const resumenTutores = [...new Set(filas.map((f) => f.tutorNombre).filter(Boolean))].sort();

    const tally = filas.reduce(
      (acc, fila) => {
        switch (fila.resultadoTutoria) {
          case RESULTADOS_TUTORIA_TERCER_ANIO.APROBADO:
            acc.aprobados += 1;
            break;
          case RESULTADOS_TUTORIA_TERCER_ANIO.REPROBADO:
            acc.reprobados += 1;
            break;
          case RESULTADOS_TUTORIA_TERCER_ANIO.ABANDONO:
            acc.abandonos += 1;
            break;
          default:
            acc.enProceso += 1;
        }
        return acc;
      },
      { aprobados: 0, reprobados: 0, abandonos: 0, enProceso: 0 }
    );
    tally.total = filas.length;

    const gestionAnio = await this._resolverGestionAnio(gestionId ?? filas[0]?.gestionId ?? null);

    const cabecera = {
      carreraId: Number(carreraId),
      carreraNombre: filas[0]?.carreraNombre ?? null,
      gestionId: gestionId ?? filas[0]?.gestionId ?? null,
      gestionAnio,
      bimestre: Number(bimestre),
    };

    const planillaAvanceTercerAnio = { cabecera, folios, resumenTutores, tally };

    this.logger.info('[Titulación] Planilla de avance de tutorías (3er año) generada', {
      carreraId,
      gestionId,
      bimestre,
      estudiantes: filas.length,
      folios: folios.length,
    });

    return { planillaAvanceTercerAnio };
  }

  /** @private */
  async _resolverGestionVigente() {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    return ctx?.gestion_id != null ? Number(ctx.gestion_id) : null;
  }

  /** @private */
  async _resolverGestionAnio(gestionId) {
    if (!gestionId) return null;
    const gestion = await this.managementRepository.findById(Number(gestionId));
    const plain = gestion?.toPlainObject?.() ?? gestion;
    return plain?.year ?? plain?.anio ?? null;
  }
}
