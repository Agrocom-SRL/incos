/**
 * Use Case: ListCarrerasUseCase
 * Módulo: Configuración
 * Lista carreras con filtros, paginación y resumen académico (materias/periodos).
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { CareerMapper } from '../../mappers/configuracion/index.js';

export class ListCarrerasUseCase extends BaseListUseCase {
  constructor({ careerRepository, logger }) {
    super({
      repository: careerRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'carreras',
      collectionFieldName: 'careers',
      dataFieldName: 'carreras',
    });
    this.careerRepository = careerRepository;
  }

  getMapper() {
    return CareerMapper;
  }

  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const result = await super.execute(baseFilters, page, limit, queryParams);
    const carreras = result?.carreras;
    if (!Array.isArray(carreras) || carreras.length === 0) {
      return result;
    }

    const ids = carreras.map((c) => c.id).filter(Boolean);
    const resumenMap = await this.careerRepository.findResumenAcademicoByCarreraIds(ids);

    result.carreras = carreras.map((c) => {
      const resumen = resumenMap.get(Number(c.id)) ?? {};
      return {
        ...c,
        cantidad_materias: resumen.cantidad_materias ?? 0,
        cantidad_periodos: resumen.cantidad_periodos ?? 0,
      };
    });

    return result;
  }
}
