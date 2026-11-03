/**
 * Use Case: UpdateGestionUseCase
 * Módulo: Académico
 *
 * Actualiza los datos de una gestión académica (actual o pasada). Solo se
 * actualizan los campos enviados en el payload. `vigente` NO es editable por
 * esta vía: marcar/desmarcar vigencia es exclusivo de MarcarGestionVigenteUseCase
 * (POST /gestiones/:id/marcar-vigente).
 *
 * Unicidad lógica: la tabla no tiene UNIQUE sobre `codigo`, por lo que este
 * caso de uso valida que no exista OTRA gestión activa con el mismo código.
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_GESTION_VALUES } from '../../../domain/constants/gestion.constants.js';
import { parseFechaISO, parseIdPositivo, parseAnio } from '../../utils/validacionEntrada.js';
import { entityToPresentation } from '../../mappers/academico/ManagementMapper.js';

export class UpdateGestionUseCase {
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
   * Actualiza una gestión académica (solo los campos enviados).
   *
   * @param {number} gestionId - ID de la gestión a editar
   * @param {Object} body - Payload parcial { codigo?, nombre?, anio?, tipo?, fecha_inicio?, fecha_fin? }
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{gestion: Object}>} Gestión actualizada en formato de presentación
   */
  async execute(gestionIdRaw, body = {}, userId = null) {
    const gestionId = parseIdPositivo(gestionIdRaw, 'gestionId');
    const gestion = await this.managementRepository.findById(gestionId);
    if (!gestion || gestion.active === false) {
      throw new NotFoundError('gestión académica');
    }

    const data = {};

    if (body.codigo !== undefined || body.code !== undefined) {
      const codigo = String(body.codigo ?? body.code ?? '').trim();
      if (!codigo) throw new ValidationError('codigo no puede estar vacío');
      // Unicidad lógica del código entre gestiones activas, excluyendo la propia.
      const existente = await this.managementRepository.findBy({ code: codigo });
      if (existente && Number(existente.id) !== gestionId) {
        throw new ValidationError(`Ya existe una gestión activa con el código ${codigo}`);
      }
      data.code = codigo;
    }

    if (body.nombre !== undefined || body.name !== undefined) {
      const nombre = String(body.nombre ?? body.name ?? '').trim();
      if (!nombre) throw new ValidationError('nombre no puede estar vacío');
      data.name = nombre;
    }

    if (body.anio !== undefined || body.year !== undefined) {
      const anio = parseAnio(body.anio ?? body.year, 'anio');
      data.year = anio;
    }

    if (body.tipo !== undefined || body.type !== undefined) {
      const tipo = body.tipo ?? body.type;
      if (!TIPOS_GESTION_VALUES.includes(tipo)) {
        throw new ValidationError(`tipo debe ser uno de: ${TIPOS_GESTION_VALUES.join(', ')}`);
      }
      data.type = tipo;
    }

    if (body.fecha_inicio !== undefined || body.fechaInicio !== undefined) {
      data.startDate = parseFechaISO(body.fecha_inicio ?? body.fechaInicio, 'fecha_inicio');
    }
    if (body.fecha_fin !== undefined || body.fechaFin !== undefined) {
      data.endDate = parseFechaISO(body.fecha_fin ?? body.fechaFin, 'fecha_fin');
    }

    // Coherencia de fechas con los valores que quedarían vigentes tras el update.
    const fechaInicioFinal = data.startDate ?? (gestion.startDate ? parseFechaISO(gestion.startDate, 'fecha_inicio') : null);
    const fechaFinFinal = data.endDate ?? (gestion.endDate ? parseFechaISO(gestion.endDate, 'fecha_fin') : null);
    if (fechaInicioFinal && fechaFinFinal && fechaFinFinal < fechaInicioFinal) {
      throw new ValidationError('fecha_fin no puede ser anterior a fecha_inicio');
    }

    if (!Object.keys(data).length) {
      throw new ValidationError('No se envió ningún campo editable para actualizar');
    }

    // `vigente` (si viniera en el body) se ignora: no forma parte de `data`.
    const updated = await this.managementRepository.update(gestionId, data, userId);

    this.logger.info('[Académico] Gestión actualizada', {
      gestionId,
      campos: Object.keys(data),
    });

    return { gestion: entityToPresentation(updated) };
  }
}
