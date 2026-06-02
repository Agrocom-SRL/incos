import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_GESTION_PLAN } from '../../../domain/constants/cursos.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ManagementPlanPresentationMapper.js';

export class CreateGestionPlanUseCase {
  constructor({
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    logger,
  }) {
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const gestionId = Number(body.gestionId ?? body.gestion_id);
    const planEstudioId = Number(body.planEstudioId ?? body.plan_estudio_id);
    if (!Number.isFinite(gestionId) || gestionId < 1 || !Number.isFinite(planEstudioId) || planEstudioId < 1) {
      throw new ValidationError('gestion_id y plan_estudio_id son requeridos');
    }

    const gestion = await this.managementRepository.findById(gestionId);
    if (!gestion) throw new NotFoundError('gestión académica');

    const plan = await this.studyPlanRepository.findById(planEstudioId);
    if (!plan) throw new NotFoundError('plan de estudios');

    const planRow = await this.studyPlanRepository.getModel().findByPk(planEstudioId);
    if (!planRow?.activo) {
      throw new ValidationError('El plan de estudios no está activo');
    }
    if (!planRow?.vigente) {
      throw new ValidationError('Solo se pueden habilitar planes marcados como vigentes en el catálogo');
    }

    const existing = await this.managementPlanRepository.findBy({
      managementId: gestionId,
      studyPlanId: planEstudioId,
    });
    if (existing) {
      throw new ValidationError('Este plan ya está habilitado en la gestión seleccionada');
    }

    const nombre = `Oferta ${gestion.name || gestion.code || gestion.year} - ${plan.planName || `Plan ${planEstudioId}`}`;

    const created = await this.managementPlanRepository.create(
      {
        managementId: gestionId,
        studyPlanId: planEstudioId,
        name: nombre,
        state: ESTADOS_GESTION_PLAN.PROPUESTO,
      },
      userId
    );

    this.logger.info('[Oferta] Plan habilitado en gestión', {
      gestionPlanId: created.id,
      gestionId,
      planEstudioId,
    });

    return { gestionPlan: entityToPresentation(created) };
  }
}
