/**
 * Contenedor de Inyección de Dependencias (DI Container)
 * Punto de entrada único para resolver todas las dependencias de la aplicación
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la inyección de dependencias
 * 
 * Patrón: Factory + Singleton + Dependency Inversion
 * Similar al backend, pero adaptado para frontend (React hooks)
 */

import { registerAllModules } from '@container/modules';

/**
 * Factory de Use Cases centralizado
 * Se registran todos los módulos al importar este archivo
 */
const useCasesFactory = {};

/**
 * Registra todos los módulos en el factory
 */
registerAllModules(useCasesFactory);

/**
 * Obtiene un Use Case por nombre (alternativa más dinámica)
 * @param {string} useCaseName - Nombre del use case (ej: 'getStudents')
 * @returns {Object|null}
 */
export const getUseCase = (useCaseName) => {
  const factoryMethod = useCasesFactory[useCaseName];
  if (!factoryMethod) {
    console.warn(`[container] Use Case "${useCaseName}" no encontrado`);
    return null;
  }
  return factoryMethod();
};

/**
 * Exporta el factory completo para acceso directo
 * Uso: import { useCasesFactory } from '@container';
 */
export { useCasesFactory };

export default useCasesFactory;

