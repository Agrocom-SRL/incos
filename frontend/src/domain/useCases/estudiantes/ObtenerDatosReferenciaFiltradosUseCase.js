/**
 * Use Case: Obtener Datos de Referencia Filtrados
 * 
 * Single Responsibility: Orquestar la obtención de catálogos de referencia bajo demanda
 * Dependency Inversion: Depende de abstracciones de repositorios de referencia
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta los repositorios de referencia)
 * 
 * Este Use Case maneja la obtención de catálogos de referencia que se cargan condicionalmente:
 * - Tipos de discapacidad: Solo si tiene discapacidad = true
 * - Tipos de parentesco: Solo si hay contacto de emergencia = true
 * 
 * Extensible: Para agregar nuevos tipos de referencia, solo agregar un caso en ejecutar()
 */

import { IDiscapacidadRepository } from '@repositories/IDiscapacidadRepository';
import { ITipoParentescoRepository } from '@repositories/ITipoParentescoRepository';

export class ObtenerDatosReferenciaFiltradosUseCase {
  /**
   * @param {Object} repositories - Repositorios de referencia
   * @param {IDiscapacidadRepository} repositories.discapacidadRepository
   * @param {ITipoParentescoRepository} repositories.tipoParentescoRepository
   */
  constructor(repositories) {
    this.discapacidadRepository = repositories.discapacidadRepository;
    this.tipoParentescoRepository = repositories.tipoParentescoRepository;
  }

  /**
   * Ejecuta el caso de uso para obtener datos de referencia filtrados
   * 
   * @param {string} tipo - Tipo de dato de referencia: 'discapacidades' | 'tiposParentesco'
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros HTTP para el repositorio (filtros, paginación, etc.)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(tipo, options = {}) {
    try {
      const { params = {} } = options;

      // Obtener tipos de discapacidad
      if (tipo === 'discapacidades') {
        const result = await this.discapacidadRepository.obtenerTodos({ params });

        if (!result.success) {
          return result;
        }

        return {
          success: true,
          data: result.data || [],
        };
      }

      // Obtener tipos de parentesco
      if (tipo === 'tiposParentesco') {
        const result = await this.tipoParentescoRepository.obtenerTodos({ params });

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
        error: `Tipo de referencia no válido: ${tipo}. Tipos válidos: 'discapacidades', 'tiposParentesco'`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener datos de referencia filtrados',
      };
    }
  }
}

