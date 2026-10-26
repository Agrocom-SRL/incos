/**
 * Use Case: CreateGestionUseCase
 * Módulo: Académico
 *
 * Crea una gestión académica (gestiones). La gestión nace con `vigente=false`;
 * marcarla vigente es responsabilidad de MarcarGestionVigenteUseCase
 * (POST /gestiones/:id/marcar-vigente).
 *
 * Unicidad lógica: la tabla no tiene UNIQUE sobre `codigo`, por lo que este
 * caso de uso valida que no exista otra gestión ACTIVA con el mismo código.
 */

import { ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_GESTION_VALUES } from '../../../domain/constants/gestion.constants.js';
import { parseFechaISO, parseAnio } from '../../utils/validacionEntrada.js';
import { entityToPresentation } from '../../mappers/academico/ManagementMapper.js';

export class CreateGestionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ managementRepository, logger }) {
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Crea una gestión académica.
   *
   * @param {Object} body - Payload { codigo, nombre, anio, tipo, fecha_inicio, fecha_fin }
   * @param {number|null} userId - Usuario que crea (auditoría)
   * @returns {Promise<{gestion: Object}>} Gestión creada en formato de presentación
   */
  async execute(body = {}, userId = null) {
    const codigo = String(body.codigo ?? body.code ?? '').trim();
    const nombre = String(body.nombre ?? body.name ?? '').trim();
    const anioRaw = body.anio ?? body.year;
    const tipo = body.tipo ?? body.type;
    const fechaInicioRaw = body.fecha_inicio ?? body.fechaInicio;
    const fechaFinRaw = body.fecha_fin ?? body.fechaFin;

    if (!codigo || !nombre || !tipo || !fechaInicioRaw || !fechaFinRaw) {
      throw new ValidationError(
        'codigo, nombre, anio, tipo, fecha_inicio y fecha_fin son requeridos'
      );
    }
    const anio = parseAnio(anioRaw, 'anio');
    if (!TIPOS_GESTION_VALUES.includes(tipo)) {
      throw new ValidationError(`tipo debe ser uno de: ${TIPOS_GESTION_VALUES.join(', ')}`);
    }
    const fechaInicio = parseFechaISO(fechaInicioRaw, 'fecha_inicio');
    const fechaFin = parseFechaISO(fechaFinRaw, 'fecha_fin');
    if (fechaFin < fechaInicio) {
      throw new ValidationError('fecha_fin no puede ser anterior a fecha_inicio');
    }

    // Unicidad lógica del código: solo se compara contra gestiones activas
    // (findBy excluye inactivos por defecto).
    const existente = await this.managementRepository.findBy({ code: codigo });
    if (existente) {
      throw new ValidationError(`Ya existe una gestión activa con el código ${codigo}`);
    }

    const created = await this.managementRepository.create(
      {
        code: codigo,
        name: nombre,
        year: anio,
        type: tipo,
        startDate: fechaInicio,
        endDate: fechaFin,
        // Toda gestión nueva nace NO vigente; se marca aparte.
        vigente: false,
      },
      userId
    );

    this.logger.info('[Académico] Gestión creada', {
      gestionId: created.id,
      codigo,
      anio,
      tipo,
    });

    return { gestion: entityToPresentation(created) };
  }
}
