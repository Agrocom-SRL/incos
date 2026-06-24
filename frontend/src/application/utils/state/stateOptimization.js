/**
 * Helpers para optimización de estado en React
 * 
 * Estos helpers permiten crear setters optimizados que solo actualizan el estado
 * cuando los datos realmente cambian, evitando renders innecesarios.
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas reutilizables
 * 
 * Uso:
 * ```javascript
 * const [students, setStudents] = useState([]);
 * const optimizedSetStudents = createOptimizedArraySetter(setStudents);
 * 
 * // En lugar de: setStudents(newStudents)
 * optimizedSetStudents(newStudents); // Solo actualiza si realmente cambió
 * ```
 */


/**
 * Crea un setter optimizado para arrays de objetos con IDs
 * Solo actualiza el estado si los IDs realmente cambiaron
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por IDs
 * 
 * @example
 * const [carreras, setCarreras] = useState([]);
 * const optimizedSetCarreras = createOptimizedArraySetter(setCarreras);
 * optimizedSetCarreras(newCarreras); // Solo actualiza si los IDs cambiaron
 */
export const createOptimizedArraySetter = (setState) => {
  return (newData) => {
    setState(prevData => {
      // Si no es un array, actualizar directamente
      if (!Array.isArray(newData)) {
        return newData;
      }

      // Si las referencias son iguales (mismo array), mantener
      if (prevData === newData) {
        return prevData;
      }

      // Si no es array el anterior, actualizar
      if (!Array.isArray(prevData)) {
        return newData;
      }

      // Si la longitud es diferente, definitivamente cambió
      if (prevData.length !== newData.length) {
        return newData;
      }

      // Si ambos arrays están vacíos, mantener referencia
      if (prevData.length === 0) {
        return prevData;
      }

      // Comparar por CONTENIDO (no solo por IDs): si una recarga trae las mismas filas
      // con un campo cambiado (mismo conjunto de IDs, p. ej. el `estado` de una licencia
      // tras aprobar/rechazar), el cambio también debe re-renderizar. Comparar solo IDs
      // descartaba esas actualizaciones in-place. Mantiene el short-circuit cuando el
      // contenido es idéntico (evita el re-render innecesario que motivó esta utilidad).
      // Los datos de lista son JSON plano del backend, así que `JSON.stringify` es estable
      // y barato (corre solo en cada fetch, no por render).
      try {
        if (JSON.stringify(prevData) === JSON.stringify(newData)) {
          return prevData;
        }
      } catch {
        // Datos no serializables (caso muy raro): actualizar por seguridad.
        return newData;
      }

      // El contenido cambió: actualizar con los nuevos datos.
      return newData;
    });
  };
};

/**
 * Crea un setter optimizado para valores primitivos (string, boolean, number, null)
 * Solo actualiza el estado si el valor realmente cambió
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por valor
 * 
 * @example
 * const [loading, setLoading] = useState(false);
 * const optimizedSetLoading = createOptimizedPrimitiveSetter(setLoading);
 * optimizedSetLoading(true); // Solo actualiza si realmente cambió
 */
export const createOptimizedPrimitiveSetter = (setState) => {
  return (newValue) => {
    setState(prevValue => {
      // Si el valor es el mismo, mantener la referencia (evita re-renders)
      if (prevValue === newValue) {
        return prevValue;
      }
      return newValue;
    });
  };
};

/**
 * Crea un setter optimizado para objetos
 * Solo actualiza el estado si la referencia cambió
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por referencia
 * 
 * @example
 * const [selectedStudent, setSelectedStudent] = useState(null);
 * const optimizedSetSelectedStudent = createOptimizedObjectSetter(setSelectedStudent);
 * optimizedSetSelectedStudent(newStudent); // Solo actualiza si la referencia cambió
 */
export const createOptimizedObjectSetter = (setState) => {
  return (newData) => {
    setState(prevData => {
      // Si la referencia es la misma, mantener (evita re-renders)
      if (prevData === newData) {
        return prevData;
      }
      return newData;
    });
  };
};

