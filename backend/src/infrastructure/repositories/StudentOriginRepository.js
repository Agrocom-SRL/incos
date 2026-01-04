import { EstudianteOrigen as EstudianteOrigenModel } from '../database/models/estudiante_origen.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentOriginMapper } from '../mappers/StudentOriginMapper.js';

/**
 * Repositorio de orígenes de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentOriginMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentOriginMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta
 * - Usa StudentOriginMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 */
export class StudentOriginRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteOrigen
   */
  getModel() {
    return EstudianteOrigenModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentOrigin|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentOriginMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['ciudadNacimiento'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['esPrincipal', 'DESC'], ['tipoOrigen', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentOriginMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   * 
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentOriginMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentOrigins';
  }

  /**
   * Buscar orígenes por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentOrigin[]>} Array de entidades StudentOrigin
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: this.getDefaultSort(),
    });

    return StudentOriginMapper.toEntityList(models);
  }

  /**
   * Crear múltiples orígenes para un estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @param {Array<{countryId?: number, birthMunicipalityId?: number, birthCity?: string, motherTongueId?: number, secondaryLanguageId?: number, originType?: string, isPrincipal?: boolean}>} origenes - Array de orígenes
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<StudentOrigin[]>} Array de entidades StudentOrigin creadas
   */
  async createMultiple(estudianteId, origenes, userId = null) {
    const created = [];
    
    for (const origen of origenes) {
      const data = {
        studentId: estudianteId,
        countryId: origen.countryId || origen.paisId || null,
        birthMunicipalityId: origen.birthMunicipalityId || origen.municipioNacimientoId || null,
        birthCity: origen.birthCity || origen.ciudadNacimiento || null,
        motherTongueId: origen.motherTongueId || origen.idiomaMaternoId || null,
        secondaryLanguageId: origen.secondaryLanguageId || origen.idiomaSecundarioId || null,
        originType: origen.originType || origen.tipoOrigen || 'NACIONALIDAD_PRINCIPAL',
        isPrincipal: origen.isPrincipal !== undefined ? origen.isPrincipal : (origen.esPrincipal !== undefined ? origen.esPrincipal : true),
      };
      
      const createdItem = await this.create(data, userId);
      created.push(createdItem);
    }
    
    return created;
  }

  /**
   * Eliminar todos los orígenes de un estudiante (soft delete)
   * @param {number} estudianteId
   * @param {number} userId
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteByEstudianteId(estudianteId, userId = null) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
    });

    let deletedCount = 0;
    for (const model of models) {
      await this.delete(model.id, userId);
      deletedCount++;
    }

    return deletedCount;
  }

  /**
   * Determina si un origen es boliviano o extranjero
   * Lógica:
   * - Si tiene birthMunicipalityId/municipio_nacimiento_id → Es Bolivia (los municipios son solo de Bolivia)
   * - Si tiene countryId/pais_id y NO tiene birthMunicipalityId/municipio_nacimiento_id → Es extranjero
   * - Si ambos son NULL → No está definido
   * 
   * @param {StudentOrigin|Object} origen - Entidad StudentOrigin o objeto de origen (puede ser entidad o modelo)
   * @returns {string|null} 'BOLIVIANA', 'EXTRANJERA', o null si no está definido
   */
  static determinarTipoNacionalidad(origen) {
    if (!origen) return null;
    
    // Convertir a objeto plano si es entidad
    const origenData = origen.toPlainObject ? origen.toPlainObject() : origen;
    
    // Si tiene birthMunicipalityId/municipio_nacimiento_id, es Bolivia
    if (origenData.birthMunicipalityId || origenData.municipioNacimientoId || origenData.municipio_nacimiento_id) {
      return 'BOLIVIANA';
    }
    
    // Si tiene countryId/pais_id y NO tiene birthMunicipalityId/municipio_nacimiento_id, es extranjero
    if (origenData.countryId || origenData.paisId || origenData.pais_id) {
      return 'EXTRANJERA';
    }
    
    // Si ambos son NULL, no está definido
    return null;
  }

  /**
   * Determina el tipo de nacionalidad del estudiante basándose en sus orígenes
   * Retorna: 'BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD', o null
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<{tipo: string, origenes: StudentOrigin[]}>} Tipo de nacionalidad y array de entidades StudentOrigin
   */
  async determinarTipoNacionalidadEstudiante(estudianteId) {
    const origenes = await this.findByEstudianteId(estudianteId);
    
    if (!origenes || origenes.length === 0) {
      return { tipo: null, origenes: [] };
    }
    
    // Si hay más de un origen activo, es doble nacionalidad
    if (origenes.length > 1) {
      return { tipo: 'DOBLE_NACIONALIDAD', origenes };
    }
    
    // Si hay un solo origen, determinar su tipo
    const origen = origenes[0];
    const tipo = StudentOriginRepository.determinarTipoNacionalidad(origen.toPlainObject ? origen.toPlainObject() : origen);
    
    return { tipo, origenes };
  }

  /**
   * Convierte orígenes a formato de presentación con información de tipo de nacionalidad
   * 
   * @param {StudentOrigin[]|Object[]} origenes - Array de entidades StudentOrigin o objetos planos
   * @returns {Object[]} Array de objetos con información de presentación
   */
  static origenesToPresentation(origenes) {
    if (!Array.isArray(origenes)) return [];
    
    return origenes.map(origen => {
      const origenData = origen.toPlainObject ? origen.toPlainObject() : origen;
      const tipoNacionalidad = StudentOriginRepository.determinarTipoNacionalidad(origenData);
      
      return {
        id: origenData.id,
        studentId: origenData.studentId,
        countryId: origenData.countryId,
        birthMunicipalityId: origenData.birthMunicipalityId,
        birthCity: origenData.birthCity,
        motherTongueId: origenData.motherTongueId,
        secondaryLanguageId: origenData.secondaryLanguageId,
        originType: origenData.originType,
        isPrincipal: origenData.isPrincipal,
        tipoNacionalidad, // Agregado: 'BOLIVIANA', 'EXTRANJERA', o null
        active: origenData.active,
        createdAt: origenData.createdAt,
        updatedAt: origenData.updatedAt,
      };
    });
  }
}

