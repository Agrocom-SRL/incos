/**
 * Hook: useCarrerasApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con carreras
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de carreras usando GetTodasCarrerasUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useCarrerasList
 * 
 * Ubicación: application/modules/configuracion/academico/carreras/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { mapCarrerasList } from '@application-configuracion/academico/carreras/mappers';

export const useCarrerasApi = () => {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Función centralizada para cargar carreras desde la API
     * Se reutiliza tanto en el efecto inicial como en refetch
     * 
     * @param {Object} options - Opciones para obtener carreras
     * @param {Object} options.params - Parámetros de consulta (pagina, limite, busqueda, etc.)
     */
    const fetchCarreras = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Obtener el Use Case desde el container
            const obtenerTodasCarrerasUseCase = useCasesFactory.obtenerTodasCarreras();

            // Ejecutar el Use Case
            const result = await obtenerTodasCarrerasUseCase.ejecutar(options);

            // Si hay error, manejarlo
            if (!result.success) {
                // Extraer el mensaje del error si es un objeto
                const errorMessage = typeof result.error === 'object' && result.error?.message
                    ? result.error.message
                    : result.error || 'Error al cargar las carreras';
                setError(errorMessage);
                setCarreras([]);
                return;
            }

            // Si hay éxito, mapear y actualizar el estado con las carreras
            const carrerasMapeadas = mapCarrerasList(result.data);
            setCarreras(carrerasMapeadas);
        } catch (err) {
            // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
            const errorMessage = typeof err === 'object' && err?.message
                ? err.message
                : err || 'Error al cargar las carreras';
            setError(errorMessage);
            setCarreras([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto que se ejecuta solo una vez al montar
    useEffect(() => {
        fetchCarreras();
    }, [fetchCarreras]);

    /**
     * Función para recargar las carreras manualmente
     * 
     * @param {Object} options - Opciones para obtener carreras (filtros, paginación, etc.)
     */
    const refetch = useCallback(async (options = {}) => {
        await fetchCarreras(options);
    }, [fetchCarreras]);

    return {
        carreras,
        loading,
        error,
        refetch,
    };
};

