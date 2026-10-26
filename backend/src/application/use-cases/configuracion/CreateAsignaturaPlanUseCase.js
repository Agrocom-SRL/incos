import { ValidationError } from '../../../domain/errors/AppError.js';
import {
  parseBooleanoOpcional,
  parseIdPositivo,
  parseNumero,
  parseNumeroOpcional,
  parseTextoOpcional,
  primerDefinido,
} from '../../utils/validacionEntrada.js';

const requerido = (valor, nombre) => {
  if (valor === undefined || valor === null || valor === '') throw new ValidationError(`${nombre} es requerido`);
  return valor;
};

export class CreateAsignaturaPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const planEstudioId = parseIdPositivo(
      requerido(primerDefinido(body, 'plan_estudio_id', 'planEstudioId'), 'plan_estudio_id'),
      'plan_estudio_id'
    );
    const periodoId = parseIdPositivo(
      requerido(primerDefinido(body, 'periodo_id', 'periodoId'), 'periodo_id'),
      'periodo_id'
    );
    const materiaId = parseIdPositivo(
      requerido(primerDefinido(body, 'materia_id', 'materiaId'), 'materia_id'),
      'materia_id'
    );
    const horas = parseNumero(
      requerido(primerDefinido(body, 'horas_semanales', 'horasSemanales'), 'horas_semanales'),
      'horas_semanales',
      { min: 1 }
    );
    const orden = parseNumeroOpcional(
      primerDefinido(body, 'orden_visualizacion', 'ordenVisualizacion') ?? undefined,
      'orden_visualizacion',
      { min: 0, entero: true }
    );

    const created = await this.planSubjectRepository.create(
      {
        studyPlanId: planEstudioId,
        periodId: periodoId,
        subjectId: materiaId,
        weeklyHours: horas,
        modality: parseTextoOpcional(primerDefinido(body, 'modalidad', 'modality'), 'modalidad') ?? undefined,
        displayOrder: orden ?? undefined,
        active: parseBooleanoOpcional(body.activo, 'activo') ?? true,
      },
      userId
    );
    return { asignatura: created };
  }
}
