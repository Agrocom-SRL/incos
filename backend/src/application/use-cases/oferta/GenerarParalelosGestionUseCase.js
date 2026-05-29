import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';
import { entitiesToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

export class GenerarParalelosGestionUseCase {
  constructor({
    managementPlanRepository,
    studyPlanRepository,
    parallelRepository,
    parallelManagementRepository,
    logger,
  }) {
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.parallelRepository = parallelRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(gestionPlanId, userId = null) {
    const gestionPlan = await this.managementPlanRepository.findById(gestionPlanId);
    if (!gestionPlan) throw new NotFoundError('plan habilitado en gestión');
    if (!gestionPlan.studyPlanId) {
      throw new ValidationError('El plan habilitado no tiene plan de estudios asociado');
    }

    const planRow = await this.studyPlanRepository.getModel().findByPk(gestionPlan.studyPlanId);
    if (!planRow?.carreraId) {
      throw new ValidationError('No se pudo determinar la carrera del plan de estudios');
    }

    const paralelos = await this.parallelRepository.findAll({
      careerId: planRow.carreraId,
      pagina: 1,
      limite: 500,
    });
    const maestros = paralelos.parallels ?? [];
    if (!maestros.length) {
      throw new ValidationError('No hay paralelos maestros activos para la carrera del plan');
    }

    const existingIds = new Set(
      await this.parallelManagementRepository.findExistingParallelIds(gestionPlanId)
    );

    const created = [];
    await sequelize.transaction(async () => {
      for (const paralelo of maestros) {
        if (existingIds.has(paralelo.id)) continue;

        const row = await this.parallelManagementRepository.create(
          {
            managementPlanId: gestionPlanId,
            parallelId: paralelo.id,
            classroomId: null,
            shift: paralelo.shift,
            state: ESTADOS_PARALELO_GESTION.BORRADOR,
            maxCapacity: 35,
            minCapacity: 10,
          },
          userId
        );
        created.push(row);
        existingIds.add(paralelo.id);
      }
    });

    this.logger.info('[Oferta] Paralelos de gestión generados', {
      gestionPlanId,
      creados: created.length,
      omitidos: maestros.length - created.length,
    });

    return {
      paralelosGestion: entitiesToPresentation(created),
      resumen: {
        creados: created.length,
        existentes: maestros.length - created.length,
        totalMaestros: maestros.length,
      },
    };
  }
}
