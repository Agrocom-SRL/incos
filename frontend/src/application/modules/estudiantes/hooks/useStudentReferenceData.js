/**
 * Hook: useStudentReferenceData
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

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';

export const useStudentReferenceData = () => {
  // Estados para datos de referencia (cargados bajo demanda)
  const [discapacidades, setDiscapacidades] = useState([]);
  const [tiposParentesco, setTiposParentesco] = useState([]);

  /**
   * Carga tipos de discapacidad (solo si tiene discapacidad)
   */
  const loadDiscapacidades = useCallback(async () => {
    try {
      const obtenerReferenciaUseCase = useCasesFactory.obtenerDatosReferenciaFiltrados();
      const result = await obtenerReferenciaUseCase.ejecutar('discapacidades');

      if (result.success) {
        setDiscapacidades(result.data || []);
      } else {
        console.error('[useStudentReferenceData] Error al cargar discapacidades:', result.error);
        setDiscapacidades([]);
      }
    } catch (err) {
      console.error('[useStudentReferenceData] Error inesperado al cargar discapacidades:', err);
      setDiscapacidades([]);
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
        setTiposParentesco(result.data || []);
      } else {
        console.error('[useStudentReferenceData] Error al cargar tipos de parentesco:', result.error);
        setTiposParentesco([]);
      }
    } catch (err) {
      console.error('[useStudentReferenceData] Error inesperado al cargar tipos de parentesco:', err);
      setTiposParentesco([]);
    }
  }, []);

  return {
    // Datos de referencia (cargados bajo demanda)
    discapacidades,
    tiposParentesco,
    
    // Funciones para cargar datos bajo demanda
    loadDiscapacidades,
    loadTiposParentesco,
  };
};

