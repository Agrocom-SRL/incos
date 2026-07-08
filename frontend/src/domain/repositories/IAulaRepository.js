/**
 * Interfaz del Repositorio de Aulas
 * Tabla: aulas
 *
 * Extiende IBaseRepository con métodos específicos de aulas
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 *
 * NOTA: distinto del picker de solo lectura `AULAS_CATALOGO_ENDPOINT`
 * (Institucional/Oferta académica, `GET /aulas/catalogo`, no se toca aquí).
 * Este repositorio es el CRUD completo de administración (CFG → Recursos académicos).
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IAulaRepository extends IBaseRepository {
  // Métodos específicos de aulas se agregarán aquí cuando se necesiten
}
