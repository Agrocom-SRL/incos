import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

const plano = (e) => (e?.toPlainObject ? e.toPlainObject() : e);

export class CreatePrerrequisitoUseCase {
  /**
   * @param {Object} deps
   * @param {Object} deps.prerequisiteRepository
   * @param {Object} [deps.planSubjectRepository] si se inyecta, comprueba que ambas asignaturas sean del plan
   * @param {Object} deps.logger
   */
  constructor({ prerequisiteRepository, planSubjectRepository = null, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const planRaw = body.plan_estudio_id ?? body.planEstudioId ?? null;
    const asignaturaRaw = body.asignatura_id ?? body.asignaturaId ?? null;
    const prerrequisitoRaw = body.prerrequisito_id ?? body.prerrequisitoId ?? null;
    if (!planRaw) throw new ValidationError('plan_estudio_id es requerido');
    if (!asignaturaRaw) throw new ValidationError('asignatura_id es requerido');
    if (!prerrequisitoRaw) throw new ValidationError('prerrequisito_id es requerido');

    const planEstudioId = parseIdPositivo(planRaw, 'plan_estudio_id');
    const asignaturaId = parseIdPositivo(asignaturaRaw, 'asignatura_id');
    const prerrequisitoId = parseIdPositivo(prerrequisitoRaw, 'prerrequisito_id');

    if (asignaturaId === prerrequisitoId) {
      throw new ValidationError('Una asignatura no puede ser prerrequisito de sí misma');
    }

    await this._validarAsignaturasDelPlan(planEstudioId, [asignaturaId, prerrequisitoId]);

    // Todas las relaciones del plan: sirven para detectar duplicado y ciclos.
    const existentes = await this.prerequisiteRepository.findAll({ studyPlanId: planEstudioId }, null, null);
    const relaciones = (existentes?.prerequisites ?? []).map(plano).map((r) => ({
      asignaturaId: Number(r.subjectId),
      prerrequisitoId: Number(r.prerequisiteId),
    }));

    if (relaciones.some((r) => r.asignaturaId === asignaturaId && r.prerrequisitoId === prerrequisitoId)) {
      throw new ConflictError('Ese prerrequisito ya existe para la asignatura');
    }
    if (this._cierraCiclo(relaciones, asignaturaId, prerrequisitoId)) {
      throw new ValidationError(
        'El prerrequisito crearía un ciclo: el prerrequisito ya depende, directa o indirectamente, de esta asignatura'
      );
    }

    const created = await this.prerequisiteRepository.create(
      { studyPlanId: planEstudioId, subjectId: asignaturaId, prerequisiteId: prerrequisitoId, active: true },
      userId
    );
    return { prerrequisito: created };
  }

  async _validarAsignaturasDelPlan(planEstudioId, asignaturaIds) {
    if (!this.planSubjectRepository) return;
    for (const id of asignaturaIds) {
      const asignatura = await this.planSubjectRepository.findById(id);
      if (!asignatura) throw new NotFoundError(`Asignatura del plan ${id}`);
      if (Number(plano(asignatura).studyPlanId) !== planEstudioId) {
        throw new ValidationError(`La asignatura ${id} no pertenece al plan de estudios ${planEstudioId}`);
      }
    }
  }

  /**
   * Agregar `asignatura requiere prerrequisito` cierra un ciclo si desde el prerrequisito se
   * puede llegar a la asignatura siguiendo las relaciones «X requiere Y» ya existentes.
   */
  _cierraCiclo(relaciones, asignaturaId, prerrequisitoId) {
    const requiere = new Map();
    for (const r of relaciones) {
      if (!requiere.has(r.asignaturaId)) requiere.set(r.asignaturaId, []);
      requiere.get(r.asignaturaId).push(r.prerrequisitoId);
    }
    const visitados = new Set();
    const pila = [prerrequisitoId];
    while (pila.length > 0) {
      const actual = pila.pop();
      if (actual === asignaturaId) return true;
      if (visitados.has(actual)) continue;
      visitados.add(actual);
      pila.push(...(requiere.get(actual) ?? []));
    }
    return false;
  }
}
