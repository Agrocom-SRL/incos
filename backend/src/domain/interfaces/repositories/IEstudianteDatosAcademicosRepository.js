import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteDatosAcademicosRepository
 * Define el contrato que debe cumplir el repositorio de datos académicos de estudiantes
 * 
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 * 
 * Métodos específicos:
 * - obtenerDatosAcademicos(filters) - Obtiene datos académicos completos desde vista_estudiante_datos_academicos
 */
export class IEstudianteDatosAcademicosRepository extends IRepository {
  /**
   * Obtiene datos académicos completos del estudiante desde vista_estudiante_datos_academicos.
   * Retorna datos académicos básicos: carrera, gestión_ingreso, estado_academico, etc.
   * NO incluye datos de inscripciones (paralelo, periodo, materias).
   *
   * @param {Object} filters - Filtros opcionales (datos que diferencian a cada estudiante)
   *   - estudiante_id: ID del estudiante
   *   - codigo_estudiante: Código único del estudiante
   *   - ci: Cédula de identidad (usar junto con expedicion para identificación única)
   *   - expedicion: Expedición del CI (SC, LP, CB, etc.)
   * @returns {Promise<Array>} Array de objetos planos con datos académicos enriquecidos (0 o 1 elemento si se filtra por id/codigo/ci+expedicion)
   *   Campos según vista_estudiante_datos_academicos: estudiante_datos_academicos_id, estudiante_id, carrera_id,
   *   gestion_ingreso_id, estado_academico, estado_registro, unidad_educativa_procedencia, anio_egreso_secundaria,
   *   promedio_anual, fecha_egreso, fecha_retiro, motivo_retiro, foto_url, codigo_estudiante, ci, expedicion,
   *   carrera_nombre, carrera_codigo, carrera_descripcion, carrera_area_formacion, carrera_titulo_otorgado,
   *   gestion_ingreso_nombre, gestion_ingreso_anio, gestion_ingreso_vigente
   */
  async obtenerDatosAcademicos(filters = {}) {
    throw new Error('Method obtenerDatosAcademicos must be implemented by subclass');
  }
}

