import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IProyectoGradoRepository
 *
 * Proyectos de grado (tabla raíz `proyectos_grado`, módulo TUT · titulación).
 * Las lecturas ricas del listado/ficha viven en
 * IProyectoGradoListadoViewRepository (vistas 159/160/163); aquí solo CRUD.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IProyectoGradoRepository extends IRepository {}
