/**
 * Hook: useEstudiantesApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de estudiantes usando ObtenerTodosEstudiantesUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar StudentListProvider
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { mapEstudiantesList } from '@application-estudiantes/mappers';
import { createOptimizedArraySetter, createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

export const useEstudiantesApi = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Setters optimizados para evitar actualizaciones innecesarias
    // Usar useRef para mantener referencias estables (setState de React ya es estable)
    const optimizedSetEstudiantesRef = useRef(null);
    const optimizedSetLoadingRef = useRef(null);
    const optimizedSetErrorRef = useRef(null);

    // Inicializar los setters optimizados una sola vez
    if (!optimizedSetEstudiantesRef.current) {
        optimizedSetEstudiantesRef.current = createOptimizedArraySetter(setEstudiantes);
        optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
        optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
    }

    /**
     * Función centralizada para cargar estudiantes desde la API
     * Se reutiliza tanto en el efecto inicial como en refetch
     * 
     * @param {Object} options - Opciones para obtener estudiantes
     * @param {Object} options.params - Parámetros de consulta (pagina, limite, busqueda, etc.)
     */
    const fetchStudents = useCallback(async (options = {}) => {
        // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
        optimizedSetLoadingRef.current(true);
        optimizedSetErrorRef.current(null);

        try {
            // Obtener el Use Case desde el container
            const obtenerTodosEstudiantesUseCase = useCasesFactory.obtenerTodosEstudiantes();

            // Ejecutar el Use Case
            const result = await obtenerTodosEstudiantesUseCase.ejecutar(options);

            // Si hay error, manejarlo
            if (!result.success) {
                // Extraer el mensaje del error si es un objeto
                const errorMessage = typeof result.error === 'object' && result.error?.message
                    ? result.error.message
                    : result.error || 'Error al cargar los estudiantes';
                // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
                optimizedSetErrorRef.current(errorMessage);
                optimizedSetEstudiantesRef.current([]);
                return;
            }

            // Si hay éxito, mapear y actualizar el estado con los estudiantes
            const estudiantesMapeados = mapEstudiantesList(result.data);
            // OPTIMIZACIÓN: Solo actualizar el estado si los datos realmente cambiaron
            // El helper createOptimizedArraySetter compara por longitud y IDs automáticamente
            optimizedSetEstudiantesRef.current(estudiantesMapeados);
        } catch (err) {
            // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
            const errorMessage = typeof err === 'object' && err?.message
                ? err.message
                : err || 'Error al cargar los estudiantes';
            // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
            optimizedSetErrorRef.current(errorMessage);
            optimizedSetEstudiantesRef.current([]);
        } finally {
            // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
            optimizedSetLoadingRef.current(false);
        }
    }, []); // Sin dependencias porque los setters están en refs estables

    // Efecto que se ejecuta solo una vez al montar
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    /**
     * Función para recargar los estudiantes manualmente
     * 
     * @param {Object} options - Opciones para obtener estudiantes (filtros, paginación, etc.)
     */
    const refetch = useCallback(async (options = {}) => {
        await fetchStudents(options);
    }, [fetchStudents]);

    // Usar helper para mantener referencia estable del resultado
    return useStableApiResult(
        {
            estudiantes,
            loading,
            error,
            refetch,
        },
        ENABLE_RENDER_LOGS,
        'useEstudiantesApi'
    );
};

