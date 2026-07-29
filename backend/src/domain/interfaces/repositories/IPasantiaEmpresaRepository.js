import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IPasantiaEmpresaRepository
 *
 * Catálogo de empresas/instituciones para práctica laboral (tabla
 * `pasantias_empresas`, módulo TUT · pasantías). ABM propio, patrón
 * catálogo (incluirInactivos + PATCH /:id/estado).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IPasantiaEmpresaRepository extends IRepository {}
