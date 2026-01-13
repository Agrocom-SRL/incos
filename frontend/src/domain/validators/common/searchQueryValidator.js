/**
 * Validador común para búsqueda por query (texto libre)
 * 
 * Single Responsibility: Validar término de búsqueda y límite antes de enviar al backend
 * 
 * Clean Architecture:
 * - Domain Layer: Validación de datos de entrada para Use Cases
 * - Se ejecuta en Use Cases para validar parámetros antes de llamar al repositorio
 * 
 * Este validador es genérico y puede ser usado en cualquier Use Case que necesite
 * búsqueda por texto libre (estudiantes, carreras, materias, etc.)
 * 
 * NOTA: Las reglas de negocio complejas están en el backend.
 * Este validador solo verifica que el término de búsqueda esté presente y tenga formato básico.
 * 
 * Ubicación: Domain Layer porque:
 * - Es usado por Use Cases (Domain Layer)
 * - Application Layer puede depender de Domain Layer (regla de dependencias)
 * - Es parte de la lógica de validación de entrada de los casos de uso
 * 
 * Organización:
 * - common/: Validators comunes para todos los módulos
 * - [modulo]/: Validators específicos por módulo (estudiantes, carreras, etc.)
 */

/**
 * Valida el término de búsqueda
 * 
 * @param {string} query - Término de búsqueda (texto libre)
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateSearchQuery(query) {
  // Validar que el término de búsqueda sea válido
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      isValid: false,
      error: 'El término de búsqueda es requerido y no puede estar vacío',
    };
  }

  const trimmedQuery = query.trim();

  // Validar longitud mínima (evitar búsquedas muy amplias)
  if (trimmedQuery.length < 2) {
    return {
      isValid: false,
      error: 'El término de búsqueda debe tener entre 2 y 255 caracteres',
    };
  }

  // Validar longitud máxima
  if (trimmedQuery.length > 255) {
    return {
      isValid: false,
      error: 'El término de búsqueda debe tener entre 2 y 255 caracteres',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Valida el límite de resultados
 * 
 * @param {number} limit - Límite de resultados (opcional)
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateSearchLimit(limit) {
  // Si no se proporciona, es válido (opcional)
  if (limit === undefined || limit === null) {
    return {
      isValid: true,
    };
  }

  // Validar que sea un número entero
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  
  if (isNaN(limitNum) || !Number.isInteger(limitNum)) {
    return {
      isValid: false,
      error: 'El límite debe ser un número entero entre 1 y 50',
    };
  }

  // Validar rango
  if (limitNum < 1 || limitNum > 50) {
    return {
      isValid: false,
      error: 'El límite debe ser un número entero entre 1 y 50',
    };
  }

  return {
    isValid: true,
  };
}
