/**
 * Use Case: ListDepartamentosUseCase
 * Módulo: Geográficos
 * Lista departamentos con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { DepartmentMapper } from '../../mappers/geograficos/index.js';

export class ListDepartamentosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ departmentRepository, logger }) {
    super({
      repository: departmentRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'departamentos',
      collectionFieldName: 'departments',
      dataFieldName: 'departamentos',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Department a presentación
   * @returns {DepartmentMapper}
   */
  getMapper() {
    return DepartmentMapper;
  }

  // NOTA: Para agregar campos adicionales en el futuro, sobrescribir enrichData().
  // El método es completamente flexible y permite agregar CUALQUIER cantidad de campos:
  //
  // async enrichData(data, repositoryResult) {
  //   const enriched = await Promise.all(data.map(async (depto) => {
  //     // Puedes hacer múltiples consultas y agregar múltiples campos
  //     const [cantidadProvincias, cantidadMunicipios, cantidadEstudiantes] = await Promise.all([
  //       this.provinceRepository.count({ departmentId: depto.id }),
  //       this.municipalityRepository.count({ departmentId: depto.id }),
  //       this.studentRepository.count({ departmentId: depto.id }),
  //     ]);
  //     
  //     // Agregar todos los campos que necesites
  //     return {
  //       ...depto,
  //       cantidadProvincias,
  //       cantidadMunicipios,
  //       cantidadEstudiantes,
  //       tieneEstudiantes: cantidadEstudiantes > 0,
  //       resumen: `${cantidadProvincias} provincias`,
  //       // ... cualquier otro campo que necesites
  //     };
  //   }));
  //   return enriched;
  // }
}

