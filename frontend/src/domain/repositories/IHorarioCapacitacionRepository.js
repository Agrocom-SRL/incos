/**
 * Interfaz del Repositorio de Horarios de capacitación (módulo CAP)
 * Tabla: horarios (tipo_horario='CAPACITACION')
 *
 * Extiende IBaseRepository: LISTAR (con búsqueda y `cursosEnUso`), DETALLE,
 * CREAR (find-or-create), EDITAR y ELIMINAR (409 si algún curso lo usa).
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IHorarioCapacitacionRepository extends IBaseRepository {
  // Sin métodos específicos: el CRUD base cubre el contrato.
}
