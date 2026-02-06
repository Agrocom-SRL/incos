/**
 * Hook: useStudentCatalogApi
 * 
 * Single Responsibility: Obtener y gestionar catálogos esenciales iniciales para el formulario de registro
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta Use Cases para obtener catálogos esenciales del formulario
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Este hook:
 * - Carga SOLO catálogos esenciales al inicio usando ObtenerDatosRegistroEstudianteUseCase
 * - Proporciona opciones estáticas (expediciones, géneros, tipos de sangre)
 * - Maneja estados de loading y error
 * 
 * NOTA: Los datos condicionales (geográficos, referencia) se manejan en hooks separados:
 * - useStudentGeographicApi: departamentos, provincias, municipios
 * - useStudentReferenceApi: discapacidades, tipos de parentesco
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { EXPEDICIONES, GENEROS, TIPOS_SANGRE } from '@infrastructure/config/constants';
import { createOptimizedArraySetter, createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && false; // Cambiar a true para activar logs

export const useStudentCatalogApi = (initialDelay = 0) => {
  // Estados para datos esenciales (siempre necesarios)
  const [paises, setPaises] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [documentacion, setDocumentacion] = useState([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setters optimizados para evitar actualizaciones innecesarias
  // Usar useRef para mantener referencias estables (setState de React ya es estable)
  const optimizedSetPaisesRef = useRef(null);
  const optimizedSetIdiomasRef = useRef(null);
  const optimizedSetEstadosCivilesRef = useRef(null);
  const optimizedSetDocumentacionRef = useRef(null);
  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetPaisesRef.current) {
    optimizedSetPaisesRef.current = createOptimizedArraySetter(setPaises);
    optimizedSetIdiomasRef.current = createOptimizedArraySetter(setIdiomas);
    optimizedSetEstadosCivilesRef.current = createOptimizedArraySetter(setEstadosCiviles);
    optimizedSetDocumentacionRef.current = createOptimizedArraySetter(setDocumentacion);
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  /**
   * Carga datos esenciales del formulario
   */
  const loadFormData = useCallback(async () => {
    // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      // Obtener datos esenciales usando el Use Case
      // Si hay delay inicial, usar modo secuencial para evitar problemas de concurrencia
      const obtenerDatosRegistroUseCase = useCasesFactory.obtenerDatosRegistroEstudiante();
      const result = await obtenerDatosRegistroUseCase.ejecutar({
        sequential: initialDelay > 0 // Usar secuencial si hay delay (modo edición)
      });

      if (!result.success) {
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(result.error || 'Error al cargar datos del formulario');
        return;
      }

      // Actualizar estados con datos esenciales
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetPaisesRef.current(result.data.paises || []);
      optimizedSetIdiomasRef.current(result.data.idiomas || []);
      optimizedSetEstadosCivilesRef.current(result.data.estadosCiviles || []);
      optimizedSetDocumentacionRef.current(result.data.documentacion || []);
    } catch (err) {
      // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
      optimizedSetErrorRef.current(err.message || 'Error inesperado al cargar datos del formulario');
    } finally {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      optimizedSetLoadingRef.current(false);
    }
  }, []); // Sin dependencias porque los setters están en refs estables

  // Cargar datos esenciales al montar (con delay opcional para evitar llamadas paralelas)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFormData();
    }, initialDelay);
    
    return () => clearTimeout(timeoutId);
  }, [loadFormData, initialDelay]);

  /**
   * Recarga todos los datos esenciales
   */
  const refetch = useCallback(async () => {
    await loadFormData();
  }, [loadFormData]);

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
      // Datos esenciales (siempre disponibles)
      paises,
      idiomas,
      estadosCiviles,
      documentacion,

      // Opciones estáticas
      expediciones: EXPEDICIONES,
      generos: GENEROS,
      tiposSangre: TIPOS_SANGRE,

      // Estados
      loading,
      error,

      // Función para recargar datos esenciales
      refetch,
    },
    ENABLE_RENDER_LOGS,
    'useStudentCatalogApi'
  );
};

