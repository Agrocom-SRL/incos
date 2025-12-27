/**
 * Implementación del Repositorio de Carreras
 * Implementa ICarreraRepository usando API client
 * 
 * Single Responsibility: Solo maneja operaciones HTTP de carreras
 * Liskov Substitution Principle: Puede reemplazar ICarreraRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend (formato API)
 * 
 * NOTA: Este repositorio consume el endpoint de catálogos: /v1/catalogs/carreras
 * El mapeo de datos se hace en el Use Case usando CarreraMapper
 */

import apiClient from '@api-client';
import { ICarreraRepository } from '@/domain/repositories/ICarreraRepository.js';
import { CATALOGS_ENDPOINTS } from '@config/api';

export class CarreraRepository extends ICarreraRepository {
  /**
   * Obtiene todas las carreras del sistema (solo HTTP call)
   * @param {Object} options - Opciones (ignoradas aquí, se usan en Use Case)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getAll(options = {}) {
    try {
      const response = await apiClient.get(CATALOGS_ENDPOINTS.CARRERAS);
      const data = response.data?.data || response.data || [];
      
      // Retornar datos crudos del backend (sin validación/normalización)
      // La validación y creación de entidades se hace en el Use Case
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
      };
    } catch (error) {
      console.warn('[CarreraRepository] Error al cargar carreras:', error);
      
      return {
        success: false,
        error: error.message || 'Error al obtener carreras',
      };
    }
  }

  /**
   * Obtiene una carrera por ID (solo HTTP call)
   * @param {string|number} id - ID de la carrera
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getById(id) {
    try {
      // Por ahora, obtener todas y filtrar (hasta que haya endpoint específico)
      const result = await this.getAll();
      if (!result.success) {
        return result;
      }
      
      const carrera = result.data.find(c => c.id === id || c.id === parseInt(id));
      return {
        success: !!carrera,
        data: carrera || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener carrera por ID',
      };
    }
  }

  // Métodos no implementados aún (CRUD completo)
  async create(carreraData) {
    throw new Error('Method create() not implemented yet');
  }

  async update(id, carreraData) {
    throw new Error('Method update() not implemented yet');
  }

  async delete(id) {
    throw new Error('Method delete() not implemented yet');
  }
}

export default new CarreraRepository();

