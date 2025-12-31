/**
 * Constantes de configuración del sistema
 * 
 * Single Responsibility: Exportar todas las constantes estáticas reutilizables
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuraciones estáticas del sistema
 * - Estas constantes no son lógica de negocio, son configuraciones técnicas/estáticas
 * 
 * Organización:
 * - Agrupar constantes por dominio/funcionalidad en archivos separados
 * - Exportar todo desde este index para facilitar el import
 */

// Constantes de estudiantes
export {
  EXPEDICIONES,
  GENEROS,
  TIPOS_SANGRE,
} from './studentConstants';

// Futuras constantes:
// export { ... } from './otrasConstants';

