import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteRepository
 * Define el contrato que debe cumplir el repositorio de estudiantes
 *
 * Convención de capas: IEstudianteRepository → models/estudiante.js (`estudiantes`)
 * → Student / StudentMapper / StudentRepository
 * DDL: database/01-schemas/08-estudiantes-parte1.sql (tabla estudiantes)
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
 * - obtenerDatosPersonales(filters) - Obtiene datos personales completos desde vista_estudiante_datos_personales
 */
export class IEstudianteRepository extends IRepository {
  /**
   * Obtiene datos personales completos del estudiante desde vista_estudiante_datos_personales.
   * Retorna torso (estudiantes) + estado civil, residencia, apoderados, orígenes, discapacidades (JSON).
   *
   * @param {Object} filters - Filtros opcionales (datos que diferencian a cada estudiante)
   *   - id: ID del estudiante
   *   - codigo_estudiante: Código único del estudiante
   *   - ci: Cédula de identidad (usar junto con expedicion para identificación única)
   *   - expedicion: Expedición del CI (SC, LP, CB, etc.)
   * @returns {Promise<Array>} Array de objetos planos con datos enriquecidos (0 o 1 elemento si se filtra por id/codigo/ci+expedicion)
   *   Campos según vista_estudiante_datos_personales: id, codigo_estudiante, ci, expedicion, nombres,
   *   apellido_paterno, apellido_materno, fecha_nacimiento, genero, estado_civil_id, tipo_sangre,
   *   tiene_discapacidad, email_personal, celular, telefono_fijo, direccion, municipio_residencia_id,
   *   zona, observaciones, usuario_id, activo, created_at, updated_at, estado_civil_nombre,
   *   estado_civil_abreviatura, residencia_*, apoderados (JSON), origenes (JSON), discapacidades (JSON)
   */
  async obtenerDatosPersonales(filters = {}) {
    throw new Error('Method obtenerDatosPersonales must be implemented by subclass');
  }
}
