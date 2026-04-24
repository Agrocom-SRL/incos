import { StudentMapper } from '../../mappers/estudiantes/index.js';

/**
 * Búsqueda de estudiantes sin cuenta de usuario, para asociar en alta de usuario (SEG).
 * No requiere permisos de matrícula: la ruta HTTP usa `seguridad.usuario.crear`.
 */
export class BuscarParaAltaUsuarioEstudiantesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/StudentRepository.js').StudentRepository} deps.studentRepository
   */
  constructor({ studentRepository }) {
    this.studentRepository = studentRepository;
  }

  /**
   * @param {string} searchTerm
   * @param {number} [limit=20]
   * @returns {Promise<Object[]>} Filas en formato de presentación (StudentMapper)
   */
  async execute(searchTerm, limit = 20) {
    const term = String(searchTerm || '').trim();
    if (term.length < 2) return [];

    const cap = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const raw = await this.studentRepository.search(term, { limit: 50 });
    const sinCuenta = raw.filter((s) => s.userId == null || s.userId === undefined);
    return sinCuenta.slice(0, cap).map((s) => StudentMapper.entityToPresentation(s));
  }
}
