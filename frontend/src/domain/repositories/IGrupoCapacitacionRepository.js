/**
 * Interfaz del Repositorio de Grupos de capacitación (módulo CAP)
 * Recurso: grupos de todos los cursos (tipo «paralelo»: nombre, horarios, aula, cupo)
 *
 * Solo lectura: los grupos se editan desde el formulario de su curso. Extiende
 * IBaseRepository; únicamente se implementa `obtenerTodos` (con filtros).
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IGrupoCapacitacionRepository extends IBaseRepository {
  // Sin métodos específicos: el listado de solo lectura cubre el contrato.
}
