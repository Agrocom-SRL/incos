/**
 * Interfaz del Repositorio de Fichas de Seguimiento en Clase (módulo DOC ·
 * Supervisión docente). Tabla: fichas_seguimiento_clase (schema 27), listado
 * desde la vista 174 (vista_supervision_fichas_listado).
 *
 * Extiende IBaseRepository (arquetipo A: CRUD) SIN `eliminar` — la ficha
 * realizada no se borra (vocabulario de acciones LISTAR/DETALLE/CREAR/EDITAR/
 * EXPORTAR, sin ELIMINAR ni APROBAR). Suma el wrapper self del portal del
 * docente (`obtenerMisFichas`) y la exportación a PDF (`exportarPdf`).
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IFichaSeguimientoRepository extends IBaseRepository {
  /**
   * Fichas de los cursos del docente AUTENTICADO (S5, `fichasSeguimiento`).
   * El docente se resuelve en el servidor (anti-IDOR); nunca se envía un id.
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMisFichas() {
    throw new Error('Método obtenerMisFichas debe ser implementado');
  }

  /**
   * Descarga binaria del PDF de la ficha (S6).
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarPdf(_id) {
    throw new Error('Método exportarPdf debe ser implementado');
  }
}
