/**
 * Interfaz del Repositorio de administración del catálogo Tipos de evaluación
 * Tabla: tipos_evaluacion
 *
 * Extiende IBaseRepository con métodos específicos del catálogo.
 *
 * NOTA: distinta de `ITipoEvaluacionRepository` (combo de solo lectura del
 * cuaderno de calificaciones, `GET /calificaciones/tipos-evaluacion`, permiso
 * `sistema.catalogo.referencia`, no se toca). Esta interfaz es el CRUD completo
 * de administración (CFG → Recursos académicos, permiso `configuracion.tipo-evaluacion`).
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ITipoEvaluacionAdminRepository extends IBaseRepository {
  // Métodos específicos del catálogo se agregarán aquí cuando se necesiten
}
