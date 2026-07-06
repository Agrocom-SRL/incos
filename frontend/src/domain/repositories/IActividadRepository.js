/**
 * Interfaz del Repositorio de Actividades
 * Tabla: actividades (catálogo maestro reutilizable entre gestiones)
 *
 * Extiende IBaseRepository con métodos específicos de actividades
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 *
 * Ubicación: domain/repositories
 * - Parte del módulo de Configuración
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IActividadRepository extends IBaseRepository {
  // Métodos específicos de actividades se agregarán aquí cuando se necesiten
}
