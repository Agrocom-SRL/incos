/**
 * Exportación centralizada de interfaces de repositorios
 * 
 * Principio YAGNI (You Aren't Gonna Need It):
 * - Solo exportamos repositorios que están en uso actualmente
 * - Se agregarán nuevos repositorios según se necesiten
 */

// ============================================
// INTERFAZ BASE
// ============================================
export { IBaseRepository } from './IBaseRepository';

// ============================================
// REPOSITORIOS EN USO
// ============================================
export { IEstudianteRepository } from './IEstudianteRepository';
