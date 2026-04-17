/**
 * Búsqueda de docentes sin cuenta de usuario, para asociar en alta de usuario (SEG).
 */
export class BuscarParaAltaUsuarioDocentesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   */
  constructor({ teacherRepository }) {
    this.teacherRepository = teacherRepository;
  }

  /**
   * @param {string} searchTerm
   * @param {number} [limit=20]
   * @returns {Promise<Object[]>} Resumen para listas / pickers
   */
  async execute(searchTerm, limit = 20) {
    const term = String(searchTerm || '').trim();
    if (term.length < 2) return [];

    const cap = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const raw = await this.teacherRepository.search(term, { limit: 50 });
    const sinCuenta = raw.filter((t) => t.userId == null || t.userId === undefined).slice(0, cap);

    return sinCuenta.map((t) => {
      const p = t.toPlainObject ? t.toPlainObject() : t;
      return {
        id: p.id,
        nombres: p.firstName,
        apellidoPaterno: p.lastName,
        apellidoMaterno: p.motherLastName ?? null,
        ci: p.ci,
        expedicion: p.expedition ?? null,
        estadoLaboral: p.laborState ?? null,
        emailPersonal: p.personalEmail ?? null,
      };
    });
  }
}
