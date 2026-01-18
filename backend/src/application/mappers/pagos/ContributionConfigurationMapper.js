/**
 * Mapper de aplicación: ContributionConfiguration
 * Convierte entidades de dominio (ContributionConfiguration) a formato de presentación (API/Spanish)
 */

export function entityToPresentation(contributionConfiguration) {
  if (!contributionConfiguration) return null;

  return {
    id: contributionConfiguration.id,
    gestionId: contributionConfiguration.managementId,
    montoBase: contributionConfiguration.baseAmount,
    aporteActivo: contributionConfiguration.contributionActive,
    fechaInicio: contributionConfiguration.startDate,
    fechaFin: contributionConfiguration.endDate,
    activo: contributionConfiguration.active,
    createdAt: contributionConfiguration.createdAt,
  };
}

export function entitiesToPresentation(contributionConfigurations) {
  if (!Array.isArray(contributionConfigurations)) return [];
  return contributionConfigurations.map(entityToPresentation);
}

export class ContributionConfigurationMapper {
  static entityToPresentation(contributionConfiguration) {
    return entityToPresentation(contributionConfiguration);
  }

  static entitiesToPresentation(contributionConfigurations) {
    return entitiesToPresentation(contributionConfigurations);
  }
}
