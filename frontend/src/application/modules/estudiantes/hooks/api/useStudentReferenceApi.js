/**
 * Hook: useStudentReferenceApi
 * 
 * Single Responsibility: Gestionar datos de referencia condicionales (carga bajo demanda)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta Use Cases para obtener datos de referencia filtrados
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Este hook:
 * - Maneja la carga bajo demanda de discapacidades y tipos de parentesco
 * - Gestiona estados locales de datos de referencia
 * - Proporciona funciones para cargar datos cuando se necesitan
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { GRADO_DISCAPACIDAD } from '@infrastructure/config/constants';
import { createOptimizedArraySetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && false; // Cambiar a true para activar logs

export const useStudentReferenceApi = () => {
  // Estados para datos de referencia (cargados bajo demanda)
  const [discapacidades, setDiscapacidades] = useState([]);
  const [tiposParentesco, setTiposParentesco] = useState([]);

  // Setters optimizados para evitar actualizaciones innecesarias
  // Usar useRef para mantener referencias estables (setState de React ya es estable)
  const optimizedSetDiscapacidadesRef = useRef(null);
  const optimizedSetTiposParentescoRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetDiscapacidadesRef.current) {
    optimizedSetDiscapacidadesRef.current = createOptimizedArraySetter(setDiscapacidades);
    optimizedSetTiposParentescoRef.current = createOptimizedArraySetter(setTiposParentesco);
  }

  /**
   * Carga tipos de discapacidad (solo si tiene discapacidad)
   */
  const loadDiscapacidades = useCallback(async () => {
    try {
      const obtenerReferenciaUseCase = useCasesFactory.obtenerDatosReferenciaFiltrados();
      const result = await obtenerReferenciaUseCase.ejecutar('discapacidades');

      if (result.success) {
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetDiscapacidadesRef.current(result.data || []);
      } else {
        console.error('[useStudentReferenceData] Error al cargar discapacidades:', result.error);
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetDiscapacidadesRef.current([]);
      }
    } catch (err) {
      console.error('[useStudentReferenceData] Error inesperado al cargar discapacidades:', err);
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetDiscapacidadesRef.current([]);
    }
  }, []);

  /**
   * Carga tipos de parentesco (solo si hay contacto de emergencia)
   */
  const loadTiposParentesco = useCallback(async () => {
    try {
      const obtenerReferenciaUseCase = useCasesFactory.obtenerDatosReferenciaFiltrados();
      const result = await obtenerReferenciaUseCase.ejecutar('tiposParentesco');

      if (result.success) {
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetTiposParentescoRef.current(result.data || []);
      } else {
        console.error('[useStudentReferenceData] Error al cargar tipos de parentesco:', result.error);
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetTiposParentescoRef.current([]);
      }
    } catch (err) {
      console.error('[useStudentReferenceData] Error inesperado al cargar tipos de parentesco:', err);
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetTiposParentescoRef.current([]);
    }
  }, []);

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
      // Datos de referencia (cargados bajo demanda)
      discapacidades,
      tiposParentesco,
      
      // Opciones estáticas
      gradosDiscapacidad: GRADO_DISCAPACIDAD,
      
      // Funciones para cargar datos bajo demanda
      loadDiscapacidades,
      loadTiposParentesco,
    },
    ENABLE_RENDER_LOGS,
    'useStudentReferenceApi'
  );
};

