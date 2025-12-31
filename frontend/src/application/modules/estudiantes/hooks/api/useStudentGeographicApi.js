/**
 * Hook: useStudentGeographicApi
 * 
 * Single Responsibility: Gestionar datos geográficos condicionales (carga bajo demanda)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta Use Cases para obtener datos geográficos filtrados
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Este hook:
 * - Maneja la carga bajo demanda de departamentos, provincias y municipios
 * - Gestiona estados locales de datos geográficos
 * - Proporciona funciones para cargar datos en cascada (departamento → provincia → municipio)
 */

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';

export const useStudentGeographicApi = () => {
  // Estados para datos geográficos (cargados bajo demanda)
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  /**
   * Carga departamentos filtrados por país (solo si es boliviano)
   * @param {number} paisId - ID del país (ej: 1 para Bolivia)
   */
  const loadDepartamentos = useCallback(async (paisId) => {
    if (!paisId) {
      setDepartamentos([]);
      setProvincias([]); // Limpiar provincias también
      setMunicipios([]); // Limpiar municipios también
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('departamentos', null, {
        params: { paisId },
      });

      if (result.success) {
        setDepartamentos(result.data || []);
      } else {
        console.error('[useStudentGeographicData] Error al cargar departamentos:', result.error);
        setDepartamentos([]);
      }
    } catch (err) {
      console.error('[useStudentGeographicData] Error inesperado al cargar departamentos:', err);
      setDepartamentos([]);
    }
  }, []);

  /**
   * Carga provincias filtradas por departamento
   * @param {number} departamentoId - ID del departamento
   */
  const loadProvincias = useCallback(async (departamentoId) => {
    if (!departamentoId) {
      setProvincias([]);
      setMunicipios([]); // Limpiar municipios también
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('provincias', departamentoId);

      if (result.success) {
        setProvincias(result.data || []);
      } else {
        console.error('[useStudentGeographicData] Error al cargar provincias:', result.error);
        setProvincias([]);
      }
    } catch (err) {
      console.error('[useStudentGeographicData] Error inesperado al cargar provincias:', err);
      setProvincias([]);
    }
  }, []);

  /**
   * Carga municipios filtrados por provincia
   * @param {number} provinciaId - ID de la provincia
   */
  const loadMunicipios = useCallback(async (provinciaId) => {
    if (!provinciaId) {
      setMunicipios([]);
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('municipios', provinciaId);

      if (result.success) {
        setMunicipios(result.data || []);
      } else {
        console.error('[useStudentGeographicData] Error al cargar municipios:', result.error);
        setMunicipios([]);
      }
    } catch (err) {
      console.error('[useStudentGeographicData] Error inesperado al cargar municipios:', err);
      setMunicipios([]);
    }
  }, []);

  return {
    // Datos geográficos (cargados bajo demanda)
    departamentos,
    provincias,
    municipios,
    
    // Funciones para cargar datos bajo demanda
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  };
};

