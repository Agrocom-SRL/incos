import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IModalidadGradoRepository
 *
 * Catálogo de modalidades de grado (tabla `modalidades_grado`, módulo TUT).
 * La grupalidad no es columna: criterio por codigo = MODALIDAD_GRUPAL_CODIGO.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. Sin métodos adicionales; el
 * catálogo se consume con findAll/findById.
 */
export class IModalidadGradoRepository extends IRepository {}
