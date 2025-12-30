/**
 * Interfaz del Repositorio de Estudiantes
 * Tabla: estudiantes
 * 
 * Extiende IBaseRepository con métodos específicos de estudiantes
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IEstudianteRepository extends IBaseRepository {

  // Métodos específicos de estudiantes se agregarán aquí cuando se necesiten
}

