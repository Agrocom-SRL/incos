/**
 * Use Case: ListTiposParentescoUseCase
 * Módulo: Referencia
 * Lista tipos de parentesco con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { RelationshipTypeMapper, mergeUsosComplementarios } from '../../mappers/referencia/index.js';

export class ListTiposParentescoUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.relationshipTypeRepository - Repositorio de tipos de parentesco
   * @param {IComplementariosUsosViewRepository} params.complementariosUsosViewRepository - Conteos de uso (vista 151)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ relationshipTypeRepository, complementariosUsosViewRepository, logger }) {
    super({
      repository: relationshipTypeRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'tipos de parentesco',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'relationshipTypes',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'tiposParentesco',
    });
    this.complementariosUsosViewRepository = complementariosUsosViewRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades RelationshipType a presentación
   * @returns {RelationshipTypeMapper}
   */
  getMapper() {
    return RelationshipTypeMapper;
  }

  /**
   * Enriquece cada ítem con los conteos de uso del catálogo
   * (cantidadEstudiantes / cantidadDocentes / cantidadPersonal, 0 por defecto)
   * @param {Object[]} data - Ítems en formato de presentación
   * @returns {Promise<Object[]>}
   */
  async enrichData(data) {
    const usos = await this.complementariosUsosViewRepository.getUsosByCatalogo('PARENTESCO');
    return mergeUsosComplementarios(data, usos);
  }
}
