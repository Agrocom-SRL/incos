/**
 * Interfaz de Repositorio: IStudentRepository
 * Define el contrato que debe cumplir el repositorio de estudiantes
 */
export class IStudentRepository {
  /**
   * Buscar estudiante por ID
   * @param {number} id
   * @returns {Promise<Student|null>}
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Buscar estudiante por CI y expedición
   * @param {string} ci
   * @param {string} expedicion
   * @returns {Promise<Student|null>}
   */
  async findByCI(ci, expedicion) {
    throw new Error('Method findByCI must be implemented');
  }

  /**
   * Buscar estudiante por código
   * @param {string} codigoEstudiante
   * @returns {Promise<Student|null>}
   */
  async findByCodigo(codigoEstudiante) {
    throw new Error('Method findByCodigo must be implemented');
  }

  /**
   * Buscar estudiante por email
   * @param {string} email
   * @returns {Promise<Student|null>}
   */
  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  /**
   * Crear un nuevo estudiante
   * @param {Student} student
   * @returns {Promise<Student>}
   */
  async create(student) {
    throw new Error('Method create must be implemented');
  }

  /**
   * Actualizar un estudiante
   * @param {number} id
   * @param {Object} studentData
   * @returns {Promise<Student>}
   */
  async update(id, studentData) {
    throw new Error('Method update must be implemented');
  }

  /**
   * Buscar estudiantes con filtros y paginación
   * @param {Object} filters
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{students: Student[], total: number}>}
   */
  async findAll(filters = {}, page = 1, limit = 50) {
    throw new Error('Method findAll must be implemented');
  }
}
