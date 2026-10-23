/**
 * Interfaz del Repositorio de Participantes de capacitación (módulo CAP)
 * Tabla: participantes (personas externas, sin usuario/rol del sistema)
 *
 * Extiende IBaseRepository — el recurso expone LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR
 * (el borrado es lógico y el backend lo rechaza con 409 si hay inscripciones).
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IParticipanteCapacitacionRepository extends IBaseRepository {
  // Métodos específicos de participantes se agregarán aquí cuando se necesiten
}
