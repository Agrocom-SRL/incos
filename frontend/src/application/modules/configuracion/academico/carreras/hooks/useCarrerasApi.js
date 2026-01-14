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

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCasesFactory } from '@container';
import { mapCarrerasList } from '@application-configuracion/academico/carreras/mappers';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

export const useCarrerasApi = () => {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Función centralizada para cargar carreras desde la API
     * Se reutiliza tanto en el efecto inicial como en refetch
     * 
     * @param {Object} options - Opciones para obtener carreras
     * @param {Object} options.params - Parámetros de consulta (pagina, limite, busqueda, etc.)
     */
    const fetchCarreras = useCallback(async (options = {}) => {
        // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
        setLoading(prevLoading => prevLoading === true ? prevLoading : true);
        setError(prevError => prevError === null ? prevError : null);

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
                // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
                setError(prevError => prevError === errorMessage ? prevError : errorMessage);
                setCarreras([]);
                return;
            }

            // Si hay éxito, mapear y actualizar el estado con las carreras
            const carrerasMapeadas = mapCarrerasList(result.data);
            
            // OPTIMIZACIÓN: Solo actualizar el estado si los datos realmente cambiaron
            // Comparar por longitud y IDs para evitar actualizaciones innecesarias
            setCarreras(prevCarreras => {
                // Si la longitud es diferente, definitivamente cambió
                if (prevCarreras.length !== carrerasMapeadas.length) {
                    return carrerasMapeadas;
                }
                
                // Comparar IDs para verificar si realmente cambió
                const prevIds = prevCarreras.map(c => c.id).sort().join(',');
                const newIds = carrerasMapeadas.map(c => c.id).sort().join(',');
                
                // Si los IDs son iguales, mantener la referencia anterior (evita re-renders)
                if (prevIds === newIds) {
                    return prevCarreras;
                }
                
                // Si los IDs cambiaron, actualizar con los nuevos datos
                return carrerasMapeadas;
            });
        } catch (err) {
            // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
            const errorMessage = typeof err === 'object' && err?.message
                ? err.message
                : err || 'Error al cargar las carreras';
            // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
            setError(prevError => prevError === errorMessage ? prevError : errorMessage);
            setCarreras([]);
        } finally {
            // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
            setLoading(prevLoading => prevLoading === false ? prevLoading : false);
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

    // MANTENER REFERENCIA ESTABLE (como en tu Provider)
    // Comparar valores, no solo referencias, para evitar recálculos innecesarios
    const prevResultRef = useRef(null);
    
    return useMemo(() => {
        const current = {
            carreras,
            loading,
            error,
            refetch,
        };

        const prev = prevResultRef.current;
        
        // Comparar valores, no referencias
        // carreras ya se compara por contenido en setCarreras, así que aquí comparamos por referencia
        if (prev &&
            prev.loading === current.loading &&
            prev.error === current.error &&
            prev.refetch === current.refetch &&
            prev.carreras === current.carreras) {
            
            if (ENABLE_RENDER_LOGS) {
                console.log('✅ [Hook] useCarrerasApi - MANTENIENDO referencia');
            }
            return prev;
        }

        if (ENABLE_RENDER_LOGS) {
            console.log('✅ [Hook] useCarrerasApi - RECREANDO objeto retornado', {
                carrerasCount: carreras?.length || 0,
                loading,
                error: error ? 'exists' : 'null',
                refetchRef: refetch ? 'exists' : 'null',
            });
        }
        prevResultRef.current = current;
        return current;
    }, [carreras, loading, error, refetch]);
};

