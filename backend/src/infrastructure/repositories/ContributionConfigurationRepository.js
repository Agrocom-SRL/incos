import { IConfiguracionAporteRepository } from '../../domain/interfaces/repositories/IConfiguracionAporteRepository.js';
import { ConfiguracionAporte as ConfiguracionAporteModel } from '../database/models/configuracion_aporte.js';
import { BaseRepository } from './BaseRepository.js';
import { ContributionConfigurationMapper } from '../mappers/ContributionConfigurationMapper.js';

/**
 * Implementación del repositorio de configuración de aportes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IConfiguracionAporteRepository}
 */
export class ContributionConfigurationRepository extends BaseRepository {
  getModel() {
    return ConfiguracionAporteModel;
  }

  toEntity(model) {
    return ContributionConfigurationMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.managementId !== undefined) {
      where.gestionId = filters.managementId;
    }
    if (filters.baseAmount !== undefined) {
      where.montoBase = filters.baseAmount;
    }
    if (filters.contributionActive !== undefined) {
      where.aporteActivo = filters.contributionActive;
    }
    if (filters.startDate !== undefined) {
      where.fechaInicio = filters.startDate;
    }
    if (filters.endDate !== undefined) {
      where.fechaFin = filters.endDate;
    }

    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [['fechaInicio', 'DESC'], ['id', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return ContributionConfigurationMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ContributionConfigurationMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'contributionConfigurations';
  }
}
