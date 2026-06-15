import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { StudyPlanMapper } from '../../mappers/configuracion/index.js';

export class ListPlanesEstudiosUseCase extends BaseListUseCase {
  constructor({ studyPlanRepository, logger }) {
    super({
      repository: studyPlanRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'planes de estudio',
      collectionFieldName: 'studyPlans',
      dataFieldName: 'planes_estudios',
    });
  }

  getMapper() {
    return StudyPlanMapper;
  }
}

