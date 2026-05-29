import { NotFoundError, UnprocessableEntityError } from '../../domain/errors/index.js';

/**
 * Valida coherencia oferta_curso ↔ gestion_plan y devuelve contexto para asignación.
 */
export async function resolveTeacherAssignmentOfferContext({
  courseOfferRepository,
  parallelManagementRepository,
  planSubjectRepository,
  managementPlanRepository,
  offerCourseId,
  managementPlanId,
}) {
  const offerId = Number(offerCourseId);
  const gpId = Number(managementPlanId);

  const managementPlan = await managementPlanRepository.findById(gpId);
  if (!managementPlan) {
    throw new NotFoundError('Plan habilitado (gestión-plan)');
  }

  const offer = await courseOfferRepository.findById(offerId);
  if (!offer) {
    throw new NotFoundError('Oferta de curso');
  }

  const offerPlain = offer.toPlainObject ? offer.toPlainObject() : offer;
  const parallelManagementId = offerPlain.parallelManagementId ?? offerPlain.paraleloGestionId;
  if (!parallelManagementId) {
    throw new UnprocessableEntityError('La oferta de curso no está vinculada a un paralelo-gestión.', [
      { field: 'oferta_curso_id', message: 'paralelo_gestion_id ausente' },
    ]);
  }

  const pgEntity = await parallelManagementRepository.findById(parallelManagementId);
  if (!pgEntity) {
    throw new NotFoundError('Paralelo-gestión');
  }

  const pgPlain = pgEntity.toPlainObject ? pgEntity.toPlainObject() : pgEntity;
  const offerManagementPlanId = pgPlain.managementPlanId ?? pgPlain.gestionPlanId;
  if (Number(offerManagementPlanId) !== gpId) {
    throw new UnprocessableEntityError(
      'La oferta de curso no pertenece al plan habilitado indicado.',
      [
        { field: 'gestion_plan_id', message: 'Incoherencia con paralelo_gestion de la oferta' },
        { field: 'oferta_curso_id', message: 'Incoherencia con paralelo_gestion de la oferta' },
      ]
    );
  }

  const planSubjectId = offerPlain.planSubjectId ?? offerPlain.asignaturaPlanId;
  if (!planSubjectId) {
    throw new UnprocessableEntityError('La oferta no tiene asignatura de plan vinculada.', [
      { field: 'oferta_curso_id', message: 'asignatura_plan_id ausente' },
    ]);
  }

  const planSubject = await planSubjectRepository.findById(planSubjectId);
  if (!planSubject) {
    throw new NotFoundError('Asignatura del plan');
  }

  const psPlain = planSubject.toPlainObject ? planSubject.toPlainObject() : planSubject;
  const enabledPlanId = managementPlan.studyPlanId ?? managementPlan.planEstudioId ?? null;
  const subjectPlanId = psPlain.studyPlanId ?? psPlain.planEstudioId ?? null;
  if (enabledPlanId == null || subjectPlanId == null || Number(enabledPlanId) !== Number(subjectPlanId)) {
    throw new UnprocessableEntityError(
      'La asignatura de la oferta no pertenece al plan de estudios habilitado.',
      [{ field: 'oferta_curso_id', message: 'Incoherencia de plan de estudios' }]
    );
  }

  return {
    managementPlan,
    offer,
    offerPlain,
    parallelManagementId,
    planSubject,
    planSubjectId,
    weeklyHours: psPlain.weeklyHours ?? psPlain.horasSemanales ?? null,
  };
}
