/**
 * Use Case: Obtener Datos Geográficos Filtrados
 * 
 * Single Responsibility: Orquestar la obtención de datos geográficos de la estructura política/geográfica
 * Dependency Inversion: Depende de abstracciones de repositorios geográficos
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta los repositorios geográficos)
 * 
 * Este Use Case maneja la obtención de datos geográficos de la estructura política:
 * - Departamentos: Filtrados por paisId (ej: solo si nacionalidad = "Boliviana")
 * - Provincias: Filtradas por departamentoId
 * - Municipios: Filtradas por provinciaId
 * 
 * Jerarquía geográfica: País → Departamento → Provincia → Municipio
 * 
 * Retorna lista vacía si no hay parentId (para provincias/municipios), o los datos filtrados.
 * 
 * Extensible: Para agregar nuevos tipos geográficos, solo agregar un caso en ejecutar()
 */

import { IDepartamentoRepository } from '@repositories/IDepartamentoRepository';
import { IProvinciaRepository } from '@repositories/IProvinciaRepository';
import { IMunicipioRepository } from '@repositories/IMunicipioRepository';

export class ObtenerDatosGeograficosFiltradosUseCase {
  /**
   * @param {Object} repositories - Repositorios geográficos
   * @param {IDepartamentoRepository} repositories.departamentoRepository
   * @param {IProvinciaRepository} repositories.provinciaRepository
   * @param {IMunicipioRepository} repositories.municipioRepository
   */
  constructor(repositories) {
    this.departamentoRepository = repositories.departamentoRepository;
    this.provinciaRepository = repositories.provinciaRepository;
    this.municipioRepository = repositories.municipioRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener datos geográficos filtrados
   * 
   * @param {string} tipo - Tipo de dato geográfico: 'departamentos' | 'provincias' | 'municipios'
   * @param {number|null|undefined} parentId - ID del padre (opcional para departamentos, requerido para provincias/municipios)
   *   - departamentos: no requiere parentId, se filtra por paisId en params
   *   - provincias: requiere departamentoId
   *   - municipios: requiere provinciaId
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   *   - Para departamentos: { paisId: 1 } (ej: 1 para Bolivia)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(tipo, parentId = null, options = {}) {
    try {
      const { params = {} } = options;

      // Obtener departamentos filtrados por país
      if (tipo === 'departamentos') {
        const result = await this.departamentoRepository.obtenerTodos({ params });

        if (!result.success) {
          return result;
        }

        return {
          success: true,
          data: result.data || [],
        };
      }

      // Para provincias y municipios, validar que haya parentId
      if (!parentId || parentId === null || parentId === undefined) {
        return {
          success: true,
          data: [],
        };
      }

      // Obtener provincias filtradas por departamento
      if (tipo === 'provincias') {
        const result = await this.provinciaRepository.obtenerTodos({
          params: {
            departamentoId: Number(parentId),
            ...params,
          },
        });

        if (!result.success) {
          return result;
        }

        return {
          success: true,
          data: result.data || [],
        };
      }

      // Obtener municipios filtrados por provincia
      if (tipo === 'municipios') {
        const result = await this.municipioRepository.obtenerTodos({
          params: {
            provinciaId: Number(parentId),
            ...params,
          },
        });

        if (!result.success) {
          return result;
        }

        return {
          success: true,
          data: result.data || [],
        };
      }

      // Tipo no válido
      return {
        success: false,
        error: `Tipo geográfico no válido: ${tipo}. Tipos válidos: 'departamentos', 'provincias', 'municipios'`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener datos geográficos filtrados',
      };
    }
  }
}

