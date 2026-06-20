import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/** Umbral (días) para considerar un compromiso como PRÓXIMO a vencer. */
const DIAS_PROXIMA = 3;

/**
 * Planilla de control de Cuentas por cobrar (solo lectura).
 *
 * Lee filas crudas (1 por estudiante matriculado por carrera/paralelo/gestión)
 * desde la vista 89 reutilizada y construye la jerarquía:
 *   CARRERA → PARALELO → ESTUDIANTES
 * con saldos, fecha de último pago, LEFT JOIN lógico con el compromiso VIGENTE
 * (`compromisos_pago`) y la leyenda de estado de la planilla.
 *
 * El negocio vive aquí (no en controller ni repo).
 *
 * Leyenda de estado por estudiante:
 * - saldoPendiente == 0                         → 'AL_DIA'
 * - saldo > 0 y SIN compromiso vigente          → 'SIN_COMPROMISO' (obs "Sin compromiso")
 * - saldo > 0 y compromiso fechaCompromiso<hoy  → 'VENCIDA'
 * - saldo > 0 y (fechaCompromiso - hoy) <= 3d   → 'PROXIMA'
 * - saldo > 0 y compromiso a más de 3 días      → 'AL_DIA'
 */
export class GetCuentasPorCobrarReporteUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/ICuentasPorCobrarViewRepository.js').ICuentasPorCobrarViewRepository} params.cuentasPorCobrarViewRepository
   * @param {import('../../../domain/interfaces/repositories/ICompromisoPagoRepository.js').ICompromisoPagoRepository} params.compromisoPagoRepository
   * @param {import('../../../domain/interfaces/repositories/IGestionRepository.js').IGestionRepository} params.managementRepository
   * @param {import('../../../domain/interfaces/repositories/IRepository.js').IRepository} params.contributionConfigurationRepository
   * @param {Object} params.logger
   */
  constructor({
    cuentasPorCobrarViewRepository,
    compromisoPagoRepository,
    managementRepository,
    contributionConfigurationRepository,
    logger,
  }) {
    this.cuentasPorCobrarViewRepository = cuentasPorCobrarViewRepository;
    this.compromisoPagoRepository = compromisoPagoRepository;
    this.managementRepository = managementRepository;
    this.contributionConfigurationRepository = contributionConfigurationRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number|null|undefined} [params.gestionId]
   * @returns {Promise<Object>} estructura `cuentasPorCobrar`
   */
  async execute({ gestionId: rawGestionId } = {}) {
    const management = await this._resolveManagement(rawGestionId);
    const gestionId = management.id;
    const hoy = this._today();

    const rows = await this.cuentasPorCobrarViewRepository.findRowsByGestionId(gestionId);

    // Fecha del último pago por cabecera (no está en la vista 89).
    const ultimoPagoRows = await this.cuentasPorCobrarViewRepository.findUltimoPagoByGestionId(
      gestionId
    );
    const ultimoPagoByCabecera = new Map();
    for (const r of ultimoPagoRows) {
      ultimoPagoByCabecera.set(Number(r.pago_aporte_id), this._toDateStr(r.fecha_ultimo_pago));
    }

    // Compromisos VIGENTES por cabecera (LEFT JOIN lógico, sin N+1).
    const cabeceraIds = rows
      .map((r) => (r.pago_aporte_id != null ? Number(r.pago_aporte_id) : null))
      .filter((id) => id != null);
    const compromisos = await this.compromisoPagoRepository.findVigentesByPagoAporteIds(cabeceraIds);
    const compromisoByCabecera = new Map();
    for (const c of compromisos) {
      compromisoByCabecera.set(Number(c.pagoAporteId), c);
    }

    const montoMaximoPorEstudiante = await this._resolveMontoMaximo(gestionId);

    // Estructura: CARRERA → PARALELO → ESTUDIANTES (dedup por estudiante/cabecera).
    const carrerasMap = new Map();
    const estudiantesVistos = new Set(); // dedup global por (carrera|paralelo|estudiante)

    for (const row of rows) {
      const carreraId = Number(row.carrera_id);
      const paraleloKey =
        row.paralelo_id != null ? `p${Number(row.paralelo_id)}` : `n${row.paralelo_nombre ?? '—'}`;
      const estudianteId = Number(row.estudiante_id);
      const dedupKey = `${carreraId}|${paraleloKey}|${estudianteId}`;
      if (estudiantesVistos.has(dedupKey)) {
        continue;
      }
      estudiantesVistos.add(dedupKey);

      if (!carrerasMap.has(carreraId)) {
        carrerasMap.set(carreraId, {
          carreraId,
          carreraNombre: row.carrera_nombre ?? '',
          carreraCodigo: row.carrera_codigo ?? null,
          paralelos: new Map(),
        });
      }
      const carrera = carrerasMap.get(carreraId);

      if (!carrera.paralelos.has(paraleloKey)) {
        carrera.paralelos.set(paraleloKey, {
          paraleloId: row.paralelo_id != null ? Number(row.paralelo_id) : null,
          paralelo: row.paralelo_nombre ?? null,
          turno: row.paralelo_turno ?? null,
          estudiantes: [],
        });
      }
      const paralelo = carrera.paralelos.get(paraleloKey);

      const estudiante = this._buildEstudiante(
        row,
        montoMaximoPorEstudiante,
        ultimoPagoByCabecera,
        compromisoByCabecera,
        hoy
      );
      paralelo.estudiantes.push(estudiante);
    }

    // Construir salida con totales.
    const carreras = [];
    let totalMatriculadosGlobal = 0;
    let totalPendienteGlobal = 0;
    let totalCanceladoGlobal = 0;
    let montoMaximoTotalGlobal = 0;

    for (const carrera of carrerasMap.values()) {
      const paralelos = [];
      let carreraMatriculados = 0;
      let carreraMontoMaximoTotal = 0;
      let carreraCancelado = 0;
      let carreraPendiente = 0;

      for (const par of carrera.paralelos.values()) {
        const matriculados = par.estudiantes.length;
        const montoMaximoTotal = this._round(matriculados * montoMaximoPorEstudiante);

        // Orden por nombre completo (apellido paterno, materno, nombres).
        par.estudiantes.sort((a, b) =>
          String(a.nombreCompleto).localeCompare(String(b.nombreCompleto), 'es', {
            sensitivity: 'base',
          })
        );

        paralelos.push({
          paraleloId: par.paraleloId,
          paralelo: par.paralelo,
          turno: par.turno,
          totalMatriculados: matriculados,
          montoMaximoTotal,
          estudiantes: par.estudiantes,
        });

        carreraMatriculados += matriculados;
        carreraMontoMaximoTotal = this._round(carreraMontoMaximoTotal + montoMaximoTotal);
        for (const e of par.estudiantes) {
          carreraCancelado = this._round(carreraCancelado + e.totalPagado);
          carreraPendiente = this._round(carreraPendiente + e.saldoPendiente);
        }
      }

      paralelos.sort((a, b) =>
        String(a.paralelo ?? '').localeCompare(String(b.paralelo ?? ''), 'es', {
          sensitivity: 'base',
        })
      );

      carreras.push({
        carreraId: carrera.carreraId,
        carreraNombre: carrera.carreraNombre,
        carreraCodigo: carrera.carreraCodigo,
        totalMatriculados: carreraMatriculados,
        montoMaximoTotal: carreraMontoMaximoTotal,
        totalCancelado: carreraCancelado,
        totalPendiente: carreraPendiente,
        porcentajePendiente: this._round(this._pct(carreraPendiente, carreraMontoMaximoTotal)),
        paralelos,
      });

      totalMatriculadosGlobal += carreraMatriculados;
      totalPendienteGlobal = this._round(totalPendienteGlobal + carreraPendiente);
      totalCanceladoGlobal = this._round(totalCanceladoGlobal + carreraCancelado);
      montoMaximoTotalGlobal = this._round(montoMaximoTotalGlobal + carreraMontoMaximoTotal);
    }

    carreras.sort((a, b) =>
      String(a.carreraNombre).localeCompare(String(b.carreraNombre), 'es', { sensitivity: 'base' })
    );

    const resumen = {
      totalMatriculados: totalMatriculadosGlobal,
      montoMaximoTotal: montoMaximoTotalGlobal,
      totalCancelado: totalCanceladoGlobal,
      totalPendientePorCobrar: totalPendienteGlobal,
      porcentajePendiente: this._round(this._pct(totalPendienteGlobal, montoMaximoTotalGlobal)),
    };

    this.logger?.info?.('[Pagos] Planilla cuentas por cobrar generada', {
      gestionId,
      carreras: carreras.length,
      totalMatriculados: totalMatriculadosGlobal,
      totalPendientePorCobrar: totalPendienteGlobal,
    });

    return {
      gestion: {
        id: management.id,
        nombre: management.nombre,
        anio: management.anio,
      },
      montoMaximoPorEstudiante,
      carreras,
      resumen,
    };
  }

  // ============================================
  // Helpers de negocio
  // ============================================

  /**
   * Construye el objeto estudiante con saldos, último pago, compromiso y estado.
   * @private
   */
  _buildEstudiante(row, montoMaximoPorEstudiante, ultimoPagoByCabecera, compromisoByCabecera, hoy) {
    const pagoAporteId = row.pago_aporte_id != null ? Number(row.pago_aporte_id) : null;

    // montoTotal = monto_obligatorio del estudiante (de la vista). Si no hay
    // cabecera (sin aporte registrado), cae al monto máximo configurado.
    const montoObligatorio = this._num(row.monto_total_deuda, montoMaximoPorEstudiante);
    const totalPagado = this._num(row.monto_pagado, 0);
    const saldoVista = row.saldo_pendiente != null ? this._num(row.saldo_pendiente, 0) : null;
    const saldoPendiente = this._round(
      saldoVista != null ? saldoVista : Math.max(0, montoObligatorio - totalPagado)
    );

    const fechaUltimoPago = pagoAporteId != null ? ultimoPagoByCabecera.get(pagoAporteId) ?? null : null;
    const compromiso = pagoAporteId != null ? compromisoByCabecera.get(pagoAporteId) ?? null : null;
    const fechaCompromiso = compromiso ? this._toDateStr(compromiso.fechaCompromiso) : null;

    let diasAtraso = null;
    if (fechaCompromiso) {
      // Positivo si vencido (hoy posterior a la fecha comprometida).
      diasAtraso = this._diffDays(hoy, fechaCompromiso);
    }

    const { estado, observacion } = this._resolveEstado({
      saldoPendiente,
      fechaCompromiso,
      hoy,
      observacionCompromiso: compromiso?.observacion ?? null,
    });

    return {
      estudianteId: Number(row.estudiante_id),
      pagoAporteId,
      carnet: row.ci ?? null,
      codigoEstudiante: row.codigo_estudiante ?? null,
      nombreCompleto: this._buildNombreCompleto(row),
      montoTotal: this._round(montoObligatorio),
      totalPagado: this._round(totalPagado),
      fechaUltimoPago,
      saldoPendiente,
      porcentajeSaldo: this._round(this._pct(saldoPendiente, montoObligatorio)),
      fechaCompromiso,
      diasAtraso,
      estado,
      observacion,
    };
  }

  /**
   * Aplica la leyenda de estado de la planilla.
   * @private
   */
  _resolveEstado({ saldoPendiente, fechaCompromiso, hoy, observacionCompromiso }) {
    if (saldoPendiente <= 0) {
      return { estado: 'AL_DIA', observacion: observacionCompromiso ?? null };
    }
    if (!fechaCompromiso) {
      return { estado: 'SIN_COMPROMISO', observacion: 'Sin compromiso' };
    }
    // diff positivo => fechaCompromiso ya pasó (vencida).
    const diff = this._diffDays(hoy, fechaCompromiso);
    if (diff > 0) {
      return { estado: 'VENCIDA', observacion: observacionCompromiso ?? null };
    }
    // Faltan días: (fechaCompromiso - hoy) = -diff. Próxima si <= umbral.
    const faltan = -diff;
    if (faltan <= DIAS_PROXIMA) {
      return { estado: 'PROXIMA', observacion: observacionCompromiso ?? null };
    }
    return { estado: 'AL_DIA', observacion: observacionCompromiso ?? null };
  }

  /**
   * Orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (regla de UI INCOS). Usa las
   * columnas de la vista; cae a `nombre_completo` si faltan partes.
   * @private
   */
  _buildNombreCompleto(row) {
    const partes = [row.apellido_paterno, row.apellido_materno, row.nombres]
      .map((p) => (p == null ? '' : String(p).trim()))
      .filter((p) => p !== '');
    if (partes.length > 0) {
      return partes.join(' ');
    }
    return row.nombre_completo != null ? String(row.nombre_completo).trim() : '';
  }

  /**
   * Resuelve el monto máximo por estudiante desde configuracion_aportes
   * (monto_base de la gestión). Fallback 0 si no hay configuración.
   * @private
   */
  async _resolveMontoMaximo(gestionId) {
    try {
      const config = await this.contributionConfigurationRepository.findBy({ managementId: gestionId });
      const base =
        config?.baseAmount ?? config?.montoBase ?? config?.monto_base ?? config?.amount ?? null;
      if (base != null && Number.isFinite(Number(base))) {
        return this._round(Number(base));
      }
    } catch (error) {
      this.logger?.warn?.('[Pagos] No se pudo resolver monto máximo de aporte', {
        gestionId,
        error: error.message,
      });
    }
    return 0;
  }

  /** Fecha de hoy (servidor) normalizada a YYYY-MM-DD. @private */
  _today() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Normaliza un valor de fecha (Date|string) a YYYY-MM-DD o null. @private */
  _toDateStr(value) {
    if (value == null || value === '') return null;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const str = String(value).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
  }

  /**
   * Días entre dos fechas YYYY-MM-DD: (a - b) en días enteros.
   * @private
   */
  _diffDays(aStr, bStr) {
    const a = new Date(`${aStr}T00:00:00`);
    const b = new Date(`${bStr}T00:00:00`);
    const ms = a.getTime() - b.getTime();
    return Math.round(ms / 86400000);
  }

  _num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  _pct(parte, total) {
    if (!total || total <= 0) return 0;
    return (parte / total) * 100;
  }

  _round(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  /**
   * Resuelve la gestión: la pasada por id (validada) o la VIGENTE.
   * @private
   */
  async _resolveManagement(rawGestionId) {
    let model;

    if (rawGestionId != null && rawGestionId !== '') {
      const id = parseInt(String(rawGestionId), 10);
      if (Number.isNaN(id) || id < 1) {
        throw new ValidationError('gestion_id inválido');
      }
      model = await this.managementRepository.findById(id);
      if (!model) {
        throw new NotFoundError(`Gestión con ID ${id}`);
      }
    } else {
      model = await this.managementRepository.findBy({ vigente: true, isActive: true });
      if (!model) {
        throw new ValidationError('No hay una gestión vigente configurada en el sistema');
      }
    }

    const plain = model.toPlainObject ? model.toPlainObject() : model;
    const id = plain?.id ?? model.id;
    if (id == null) {
      throw new ValidationError('No se pudo determinar la gestión');
    }

    return {
      id: Number(id),
      nombre: plain?.name ?? plain?.nombre ?? null,
      anio: plain?.year ?? plain?.anio ?? null,
    };
  }
}
