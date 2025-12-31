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

import { useState, useEffect, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { EXPEDICIONES, GENEROS, TIPOS_SANGRE } from '@infrastructure/config/constants';

export const useStudentCatalogApi = () => {
  // Estados para datos esenciales (siempre necesarios)
  const [paises, setPaises] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [documentacion, setDocumentacion] = useState([]);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga datos esenciales del formulario
   */
  const loadFormData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos esenciales usando el Use Case
      const obtenerDatosRegistroUseCase = useCasesFactory.obtenerDatosRegistroEstudiante();
      const result = await obtenerDatosRegistroUseCase.ejecutar();

      if (!result.success) {
        setError(result.error || 'Error al cargar datos del formulario');
        return;
      }

      // Actualizar estados con datos esenciales
      setPaises(result.data.paises || []);
      setIdiomas(result.data.idiomas || []);
      setEstadosCiviles(result.data.estadosCiviles || []);
      setDocumentacion(result.data.documentacion || []);
    } catch (err) {
      setError(err.message || 'Error inesperado al cargar datos del formulario');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos esenciales al montar
  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  /**
   * Recarga todos los datos esenciales
   */
  const refetch = useCallback(async () => {
    await loadFormData();
  }, [loadFormData]);

  return {
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
  };
};

