/**
 * Mapper de aplicación: ContributionPayment
 * Convierte filas de vista_pago_aporte_listado a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte filas de vista → Presentation Format
 * - Usado por ListPagosAportesUseCase (listado vía vista)
 * - Usa BaseMapper para mapeo condicional de campos (mismo enfoque que StudentMapper)
 *
 * Responsabilidades:
 * - Mapear fila de vista (snake_case) a formato de presentación para el frontend
 * - Incluir estudiante y gestion anidados ya resueltos por la vista
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una fila de vista_pago_aporte_listado (entidad de listado) a formato de presentación.
 * Usado por ListPagosAportesUseCase cuando el listado viene de la vista.
 * Solo incluye campos que existen en la fila (mapFieldIfExists).
 *
 * @param {Object} row - Fila de la vista (snake_case)
 * @returns {Object|null} Objeto en formato de presentación o null si row es null/undefined
 */
export function entityToPresentation(row) {
    if (!row) return null;

    const presentation = {};

    // Campos escalares: fila en snake_case → presentación (id, created_at, student_id, etc.)
    BaseMapper.mapFieldIfExists(row, 'id', 'id', presentation);
    BaseMapper.mapFieldIfExists(row, 'created_at', 'created_at', presentation);
    BaseMapper.mapFieldIfExists(row, 'estudiante_id', 'student_id', presentation);
    BaseMapper.mapFieldIfExists(row, 'gestion_id', 'management_id', presentation);
    BaseMapper.mapFieldIfExists(row, 'estudiante_beca_id', 'student_scholarship_id', presentation);
    BaseMapper.mapFieldIfExists(row, 'monto_base', 'monto_base', presentation);
    BaseMapper.mapFieldIfExists(row, 'descuento_beca', 'descuento_beca', presentation);
    BaseMapper.mapFieldIfExists(row, 'monto_obligatorio', 'monto_obligatorio', presentation);
    BaseMapper.mapFieldIfExists(row, 'total_pagado', 'total_pagado', presentation);
    BaseMapper.mapFieldIfExists(row, 'cantidad_pagos', 'cantidad_pagos', presentation);
    BaseMapper.mapFieldIfExists(row, 'saldo_pendiente', 'saldo_pendiente', presentation);
    BaseMapper.mapFieldIfExists(row, 'estado', 'estado', presentation);

    presentation.estudiante = {
        id: row.estudiante_id,
        nombre: row.estudiante_nombres,
        apellidoPaterno: row.estudiante_apellido_paterno,
        apellidoMaterno: row.estudiante_apellido_materno,
        codigoEstudiante: row.codigo_estudiante,
    };

    presentation.gestion = {
        id: row.gestion_id,
        nombre: row.gestion_nombre,
        anio: row.gestion_anio,
    };

    return presentation;
}

/**
 * Convierte un array de filas de vista_pago_aporte_listado a formato de presentación
 * @param {Object[]} rows - Filas de la vista
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(entityToPresentation);
}

/**
 * Clase mapper para ContributionPayment (exportada por compatibilidad)
 */
export class ContributionPaymentMapper {
    static entityToPresentation(row) {
        return entityToPresentation(row);
    }

    static entitiesToPresentation(rows) {
        return entitiesToPresentation(rows);
    }
}
