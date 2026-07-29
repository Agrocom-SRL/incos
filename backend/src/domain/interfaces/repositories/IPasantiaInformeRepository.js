import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IPasantiaInformeRepository
 *
 * Informes formales de pasantía (tabla `pasantias_informes`, módulo TUT ·
 * pasantías): VERIFICACION_EMPRESA y CONVALIDACION_TRABAJO, patrón
 * dictamenes_proyecto (PDF en uploads + fila con ruta_archivo).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class IPasantiaInformeRepository extends IRepository {}
