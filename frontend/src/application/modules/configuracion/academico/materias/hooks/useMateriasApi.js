/**
 * Hook: useMateriasApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con materias
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de materias usando GetTodasMateriasUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useMateriasList
 * 
 * Ubicación: application/modules/configuracion/academico/materias/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { mapMateriasList } from '../mappers';

export const useMateriasApi = () => {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Función centralizada para cargar materias desde la API
     * Se reutiliza tanto en el efecto inicial como en refetch
     * 
     * @param {Object} options - Opciones para obtener materias
     * @param {Object} options.params - Parámetros de consulta (pagina, limite, busqueda, etc.)
     */
    const fetchMaterias = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Obtener el Use Case desde el container
            const obtenerTodasMateriasUseCase = useCasesFactory.obtenerTodasMaterias();

            // Ejecutar el Use Case
            const result = await obtenerTodasMateriasUseCase.ejecutar(options);

            // Si hay error, manejarlo
            if (!result.success) {
                // Extraer el mensaje del error si es un objeto
                const errorMessage = typeof result.error === 'object' && result.error?.message
                    ? result.error.message
                    : result.error || 'Error al cargar las materias';
                setError(errorMessage);
                setMaterias([]);
                return;
            }

            // Si hay éxito, mapear y actualizar el estado con las materias
            const materiasMapeadas = mapMateriasList(result.data);
            setMaterias(materiasMapeadas);
        } catch (err) {
            // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
            const errorMessage = typeof err === 'object' && err?.message
                ? err.message
                : err || 'Error al cargar las materias';
            setError(errorMessage);
            setMaterias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto que se ejecuta solo una vez al montar
    useEffect(() => {
        fetchMaterias();
    }, [fetchMaterias]);

    /**
     * Función para recargar las materias manualmente
     * 
     * @param {Object} options - Opciones para obtener materias (filtros, paginación, etc.)
     */
    const refetch = useCallback(async (options = {}) => {
        await fetchMaterias(options);
    }, [fetchMaterias]);

    return {
        materias,
        loading,
        error,
        refetch,
    };
};

