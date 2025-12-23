import { EstudianteOrigen as EstudianteOrigenModel } from '../database/models/EstudianteOrigen.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Repositorio de orígenes de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * Convierte un modelo Sequelize a objeto plano
   * @param {Object} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const entity = {
      id: model.id,
      estudianteId: model.estudianteId,
      paisId: model.paisId,
      municipioNacimientoId: model.municipioNacimientoId,
      ciudadNacimiento: model.ciudadNacimiento,
      idiomaMaternoId: model.idiomaMaternoId,
      idiomaSecundarioId: model.idiomaSecundarioId,
      tipoOrigen: model.tipoOrigen,
      esPrincipal: model.esPrincipal,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
    
    // Agregar tipo de nacionalidad calculado automáticamente
    entity.tipoNacionalidad = StudentOriginRepository.determinarTipoNacionalidad(entity);
    
    return entity;
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
   * Mapea datos a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      estudianteId: data.estudianteId,
      paisId: data.paisId || null,
      municipioNacimientoId: data.municipioNacimientoId || null,
      ciudadNacimiento: data.ciudadNacimiento || null,
      idiomaMaternoId: data.idiomaMaternoId || null,
      idiomaSecundarioId: data.idiomaSecundarioId || null,
      tipoOrigen: data.tipoOrigen || 'NACIONALIDAD_PRINCIPAL',
      esPrincipal: data.esPrincipal !== undefined ? data.esPrincipal : true,
      created_by: userId,
    };
  }

  /**
   * Mapea datos de actualización
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.paisId !== undefined) {
      updateData.paisId = data.paisId;
    }
    if (data.municipioNacimientoId !== undefined) {
      updateData.municipioNacimientoId = data.municipioNacimientoId;
    }
    if (data.ciudadNacimiento !== undefined) {
      updateData.ciudadNacimiento = data.ciudadNacimiento;
    }
    if (data.idiomaMaternoId !== undefined) {
      updateData.idiomaMaternoId = data.idiomaMaternoId;
    }
    if (data.idiomaSecundarioId !== undefined) {
      updateData.idiomaSecundarioId = data.idiomaSecundarioId;
    }
    if (data.tipoOrigen !== undefined) {
      updateData.tipoOrigen = data.tipoOrigen;
    }
    if (data.esPrincipal !== undefined) {
      updateData.esPrincipal = data.esPrincipal;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }
    if (userId) {
      updateData.updated_by = userId;
    }

    return updateData;
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
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: this.getDefaultSort(),
    });

    return models.map((model) => this.toEntity(model));
  }

  /**
   * Crear múltiples orígenes para un estudiante
   * @param {number} estudianteId
   * @param {Array<{paisId?: number, municipioNacimientoId?: number, ciudadNacimiento?: string, idiomaMaternoId?: number, idiomaSecundarioId?: number, tipoOrigen?: string, esPrincipal?: boolean}>} origenes
   * @param {number} userId
   * @returns {Promise<Object[]>}
   */
  async createMultiple(estudianteId, origenes, userId = null) {
    const created = [];
    
    for (const origen of origenes) {
      const data = {
        estudianteId,
        paisId: origen.paisId || null,
        municipioNacimientoId: origen.municipioNacimientoId || null,
        ciudadNacimiento: origen.ciudadNacimiento || null,
        idiomaMaternoId: origen.idiomaMaternoId || null,
        idiomaSecundarioId: origen.idiomaSecundarioId || null,
        tipoOrigen: origen.tipoOrigen || 'NACIONALIDAD_PRINCIPAL',
        esPrincipal: origen.esPrincipal !== undefined ? origen.esPrincipal : true,
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
   * - Si tiene municipio_nacimiento_id → Es Bolivia (los municipios son solo de Bolivia)
   * - Si tiene pais_id y NO tiene municipio_nacimiento_id → Es extranjero
   * - Si ambos son NULL → No está definido
   * 
   * @param {Object} origen - Objeto de origen (puede ser entidad o modelo)
   * @returns {string|null} 'BOLIVIANA', 'EXTRANJERA', o null si no está definido
   */
  static determinarTipoNacionalidad(origen) {
    if (!origen) return null;
    
    // Si tiene municipio_nacimiento_id, es Bolivia
    if (origen.municipioNacimientoId || origen.municipio_nacimiento_id) {
      return 'BOLIVIANA';
    }
    
    // Si tiene pais_id y NO tiene municipio_nacimiento_id, es extranjero
    if (origen.paisId || origen.pais_id) {
      return 'EXTRANJERA';
    }
    
    // Si ambos son NULL, no está definido
    return null;
  }

  /**
   * Determina el tipo de nacionalidad del estudiante basándose en sus orígenes
   * Retorna: 'BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD', o null
   * 
   * @param {number} estudianteId
   * @returns {Promise<{tipo: string, origenes: Object[]}>}
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
    const tipo = StudentOriginRepository.determinarTipoNacionalidad(origen);
    
    return { tipo, origenes };
  }

  /**
   * Convierte orígenes a formato de presentación con información de tipo de nacionalidad
   * @param {Object[]} origenes
   * @returns {Object[]}
   */
  static origenesToPresentation(origenes) {
    if (!Array.isArray(origenes)) return [];
    
    return origenes.map(origen => {
      const tipoNacionalidad = StudentOriginRepository.determinarTipoNacionalidad(origen);
      
      return {
        id: origen.id,
        estudianteId: origen.estudianteId,
        paisId: origen.paisId,
        municipioNacimientoId: origen.municipioNacimientoId,
        ciudadNacimiento: origen.ciudadNacimiento,
        idiomaMaternoId: origen.idiomaMaternoId,
        idiomaSecundarioId: origen.idiomaSecundarioId,
        tipoOrigen: origen.tipoOrigen,
        esPrincipal: origen.esPrincipal,
        tipoNacionalidad, // Agregado: 'BOLIVIANA', 'EXTRANJERA', o null
        activo: origen.activo,
        createdAt: origen.createdAt,
        updatedAt: origen.updatedAt,
      };
    });
  }
}

