/**
 * Exportación centralizada de interfaces de repositorios
 * 
 * Principio YAGNI (You Aren't Gonna Need It):
 * - Solo exportamos repositorios que están en uso actualmente
 * - Se agregarán nuevos repositorios según se necesiten
 * 
 * NOTA: Empezamos desde cero. Solo mantenemos la interfaz base.
 * Los repositorios específicos se crearán cuando se necesiten.
 */

// ============================================
// INTERFAZ BASE
// ============================================
export { IBaseRepository } from './IBaseRepository';
