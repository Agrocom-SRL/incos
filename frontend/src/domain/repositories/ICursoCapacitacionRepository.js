/**
 * Interfaz del Repositorio de Cursos de Capacitación (módulo CAP)
 * Tabla: capacitaciones (listado desde la vista 155)
 *
 * Extiende IBaseRepository con métodos específicos del catálogo de cursos.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ICursoCapacitacionRepository extends IBaseRepository {
  /**
   * Cambia el estado activo/inactivo del curso (PATCH /:id/estado, acción ACTIVAR).
   * @param {string|number} _id
   * @param {boolean} _activo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async cambiarEstado(_id, _activo) {
    throw new Error('Método cambiarEstado debe ser implementado');
  }

  /**
   * Bloques `horarios` (tipo_horario='CLASES') disponibles para un aula, con
   * `ocupado` por paralelo académico u otro curso de capacitación.
   * @param {{aulaId: string|number, excludeCursoId?: string|number}} _params
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerHorariosDisponibles(_params) {
    throw new Error('Método obtenerHorariosDisponibles debe ser implementado');
  }

  /**
   * Abre las inscripciones del curso: PROPUESTO→ABIERTO (POST /:id/abrir, acción EDITAR).
   * Rechaza (409) si el estado efectivo no es PROPUESTO.
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async abrirInscripciones(_id) {
    throw new Error('Método abrirInscripciones debe ser implementado');
  }

  /**
   * Cancela el curso: PROPUESTO/ABIERTO→CANCELADO (POST /:id/cancelar, acción EDITAR).
   * Rechaza (409) si el curso ya está EN_CURSO/CERRADO.
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async cancelarCurso(_id) {
    throw new Error('Método cancelarCurso debe ser implementado');
  }

  /**
   * Descarga el Excel (.xlsx) del listado de inscritos vigentes del curso
   * (GET /:id/inscritos/exportar, permiso capacitacion.inscripcion EXPORTAR).
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarInscritos(_id) {
    throw new Error('Método exportarInscritos debe ser implementado');
  }
}
