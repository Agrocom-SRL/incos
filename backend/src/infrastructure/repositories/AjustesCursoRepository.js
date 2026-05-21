import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';
import { EvaluationConfigurationRepository } from './EvaluationConfigurationRepository.js';
import { EvaluationTypeRepository } from './EvaluationTypeRepository.js';
import { claveAjustesCurso } from '../../application/utils/ajustesCursoClaves.js';
import { mapPoliticaInstitucionalResponse } from '../../application/mappers/politicaInstitucionalMapper.js';
import { invalidarCacheConsolidado } from '../services/CalificacionCacheInvalidator.js';

/**
 * Ajustes por asignación docente + JSON en configuracion_evaluacion.
 */
export class AjustesCursoRepository {
  constructor() {
    this.contexto = new CalificacionContextoRepository();
    this.configRepo = new EvaluationConfigurationRepository();
    this.tipoEvalRepo = new EvaluationTypeRepository();
  }

  async _tiposFinales() {
    const result = await this.tipoEvalRepo.findAll({ scopes: ['MATERIA_COMPLETA'] });
    return (result?.evaluationTypes ?? []).map((e) => ({
      codigo: e.code ?? e.codigo,
      nombre: e.name ?? e.nombre,
    }));
  }

  async _politicaInstitucional(gestionId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    const row = await this.configRepo.findActiveRowByGestionId(gestionId);
    const tipos = await this._tiposFinales();
    return mapPoliticaInstitucionalResponse({
      gestion: {
        id: gestionId,
        anio: ctx?.gestion_anio,
        nombre: ctx?.gestion_nombre,
      },
      row,
      tiposFinales: tipos,
      updatedByNombre: row?.updated_by_username ?? null,
    });
  }

  async _filaAjustesJson(gestionId, asignacionId) {
    const clave = claveAjustesCurso(asignacionId);
    const rows = await sequelize.query(
      `
      SELECT ce.valor, ce.updated_at, ce.updated_by, u.username AS updated_by_username
      FROM configuracion_evaluacion ce
      LEFT JOIN usuarios u ON u.id = ce.updated_by AND u.deleted_at IS NULL
      WHERE ce.gestion_id = ?
        AND ce.clave = ?
        AND ce.vigente = TRUE
        AND ce.activo = TRUE
        AND ce.deleted_at IS NULL
      ORDER BY ce.id DESC
      LIMIT 1
      `,
      {
        replacements: [gestionId, clave],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    const row = rows[0];
    if (!row?.valor) return { extra: {}, auditoria: null };
    let parsed = {};
    try {
      parsed = typeof row.valor === 'string' ? JSON.parse(row.valor) : row.valor;
    } catch {
      parsed = {};
    }
    return {
      extra: parsed,
      auditoria: {
        updatedAt: row.updated_at,
        updatedByNombre: row.updated_by_username ?? null,
      },
    };
  }

  /**
   * @param {number} asignacionId
   */
  async obtenerAjustes(asignacionId) {
    const adRows = await sequelize.query(
      `
      SELECT
        ad.id,
        ad.gestion_plan_id,
        ad.teorico_override,
        ad.practico_override,
        ad.politica_asistencia,
        ad.peso_asistencia,
        ad.minimo_asistencia,
        ad.nota_reprobada
      FROM asignaciones_docentes ad
      WHERE ad.id = ?
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
      LIMIT 1
      `,
      { replacements: [asignacionId], type: sequelize.QueryTypes.SELECT },
    );
    const ad = adRows[0];
    if (!ad) return null;

    const gpRows = await sequelize.query(
      `SELECT gestion_id FROM gestiones_planes WHERE id = ? LIMIT 1`,
      {
        replacements: [ad.gestion_plan_id],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    const gestionId = gpRows[0]?.gestion_id;
    if (!gestionId) return null;

    const politica = await this._politicaInstitucional(gestionId);
    const { extra, auditoria } = await this._filaAjustesJson(gestionId, asignacionId);

    const usarCuotaInstitucional =
      ad.teorico_override == null && ad.practico_override == null;

    const finalesInst = (politica.evaluacionesFinalesReglas ?? []).map((r) => ({
      codigo: r.tipoEvaluacionCodigo,
      nombre: r.tipoEvaluacionNombre,
      habilitadaInstitucional: true,
      pesoInstitucional: r.ponderacion,
    }));

    const overridesFinales = extra.evaluacionesFinales ?? {};
    const evaluacionesFinales = finalesInst.map((t) => {
      const habilitada =
        overridesFinales[t.codigo]?.habilitada !== undefined
          ? Boolean(overridesFinales[t.codigo].habilitada)
          : true;
      const peso = overridesFinales[t.codigo]?.peso ?? t.pesoInstitucional;
      return {
        codigo: t.codigo,
        nombre: t.nombre,
        habilitada,
        activo: habilitada,
        peso,
      };
    });

    return {
      asignacionId: Number(asignacionId),
      gestionId,
      institucional: {
        cuotaTeorico: politica.cuotaTeorico,
        cuotaPractico: politica.cuotaPractico,
        evaluacionesFinalesDisponibles: finalesInst,
        politicaAsistenciaDefault: politica.politicaAsistenciaDefault,
        notaMinimaAprobacion: politica.notaMinimaAprobacion,
      },
      ajustes: {
        usarCuotaInstitucional,
        teoricoOverride: ad.teorico_override != null ? Number(ad.teorico_override) : null,
        practicoOverride: ad.practico_override != null ? Number(ad.practico_override) : null,
        evaluacionesFinales,
        politicaAsistencia: ad.politica_asistencia ?? 'NO_AFECTA',
        pesoAsistencia: ad.peso_asistencia != null ? Number(ad.peso_asistencia) : null,
        minimoAsistencia: ad.minimo_asistencia != null ? Number(ad.minimo_asistencia) : null,
        notaReprobada: ad.nota_reprobada != null ? Number(ad.nota_reprobada) : null,
        nivelacionVisible: Boolean(extra.nivelacionVisible),
      },
      tieneOverrides:
        !usarCuotaInstitucional ||
        Boolean(extra.nivelacionVisible) ||
        Object.values(overridesFinales).some((o) => o?.habilitada === false),
      auditoria,
    };
  }

  /**
   * @param {number} asignacionId
   * @param {Object} body
   * @param {number} userId
   */
  async guardarAjustes(asignacionId, body, userId) {
    const prev = await this.obtenerAjustes(asignacionId);
    if (!prev) return null;

    const usarInst = Boolean(body.usarCuotaInstitucional);

    await sequelize.query(
      `
      UPDATE asignaciones_docentes
      SET teorico_override = ?,
          practico_override = ?,
          politica_asistencia = ?,
          peso_asistencia = ?,
          minimo_asistencia = ?,
          nota_reprobada = ?,
          updated_by = ?,
          updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      {
        replacements: [
          usarInst ? null : body.teoricoOverride ?? null,
          usarInst ? null : body.practicoOverride ?? null,
          body.politicaAsistencia ?? 'NO_AFECTA',
          body.pesoAsistencia ?? null,
          body.minimoAsistencia ?? null,
          body.notaReprobada ?? null,
          userId,
          asignacionId,
        ],
      },
    );

    const evalMap = {};
    for (const item of body.evaluacionesFinales ?? []) {
      if (item?.codigo) {
        const habilitada = Boolean(item.habilitada ?? item.activo);
        evalMap[item.codigo] = {
          habilitada,
          peso: habilitada && item.peso != null ? Number(item.peso) : null,
        };
      }
    }

    const jsonValor = {
      evaluacionesFinales: evalMap,
      nivelacionVisible: Boolean(body.nivelacionVisible),
    };

    const clave = claveAjustesCurso(asignacionId);
    const valorJson = JSON.stringify(jsonValor);

    await sequelize.query(
      `
      UPDATE configuracion_evaluacion
      SET vigente = FALSE, updated_at = NOW(), updated_by = ?
      WHERE gestion_id = ? AND clave = ? AND vigente = TRUE AND deleted_at IS NULL
      `,
      {
        replacements: [userId, prev.gestionId, clave],
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    await this.configRepo.create(
      {
        managementId: prev.gestionId,
        key: clave,
        value: valorJson,
        valueType: 'JSON',
        isCurrent: true,
        description: `Ajustes del curso (asignación ${asignacionId})`,
      },
      userId,
    );

    await invalidarCacheConsolidado(asignacionId, prev.gestionId);
    return this.obtenerAjustes(asignacionId);
  }
}
