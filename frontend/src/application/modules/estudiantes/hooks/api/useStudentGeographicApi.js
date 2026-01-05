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
import { TIPO_ORIGEN } from '@infrastructure/config/constants';

export const useStudentGeographicApi = () => {
  // Estados para datos geográficos (cargados bajo demanda)
  const [departamentos, setDepartamentos] = useState([]);
  
  // Estados separados para provincias según contexto (origen, residencia, segunda nacionalidad)
  const [provincias, setProvincias] = useState([]); // Para origen (primera nacionalidad)
  const [provinciasResidencia, setProvinciasResidencia] = useState([]); // Para residencia
  const [segundaProvincias, setSegundaProvincias] = useState([]); // Para segunda nacionalidad
  
  // Estados separados para municipios según contexto (origen, residencia, segunda nacionalidad)
  const [municipios, setMunicipios] = useState([]); // Para origen (primera nacionalidad)
  const [municipiosResidencia, setMunicipiosResidencia] = useState([]); // Para residencia
  const [segundaMunicipios, setSegundaMunicipios] = useState([]); // Para segunda nacionalidad

  /**
   * Carga todos los departamentos (sin filtros)
   */
  const loadDepartamentos = useCallback(async () => {
    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('departamentos', null, {
        params: {},
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
   * Carga provincias filtradas por departamento según contexto
   * @param {number} departamentoId - ID del departamento
   * @param {string} contexto - Contexto de la provincia: 'origen' (default), 'residencia', 'segunda'
   */
  const loadProvincias = useCallback(async (departamentoId, contexto = 'origen') => {
    // Determinar qué estado actualizar según el contexto
    let setProvinciasState;
    switch (contexto) {
      case 'residencia':
        setProvinciasState = setProvinciasResidencia;
        break;
      case 'segunda':
        setProvinciasState = setSegundaProvincias;
        break;
      case 'origen':
      default:
        setProvinciasState = setProvincias;
        break;
    }

    if (!departamentoId) {
      setProvinciasState([]);
      // No limpiar municipios aquí, se limpian por contexto en loadMunicipios
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('provincias', departamentoId);

      if (result.success) {
        setProvinciasState(result.data || []);
      } else {
        console.error(`[useStudentGeographicData] Error al cargar provincias (${contexto}):`, result.error);
        setProvinciasState([]);
      }
    } catch (err) {
      console.error(`[useStudentGeographicData] Error inesperado al cargar provincias (${contexto}):`, err);
      setProvinciasState([]);
    }
  }, []);

  /**
   * Carga municipios filtrados por provincia según contexto
   * @param {number} provinciaId - ID de la provincia
   * @param {string} contexto - Contexto del municipio: 'origen' (default), 'residencia', 'segunda'
   */
  const loadMunicipios = useCallback(async (provinciaId, contexto = 'origen') => {
    // Determinar qué estado actualizar según el contexto
    let setMunicipiosState;
    switch (contexto) {
      case 'residencia':
        setMunicipiosState = setMunicipiosResidencia;
        break;
      case 'segunda':
        setMunicipiosState = setSegundaMunicipios;
        break;
      case 'origen':
      default:
        setMunicipiosState = setMunicipios;
        break;
    }

    if (!provinciaId) {
      setMunicipiosState([]);
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('municipios', provinciaId);

      if (result.success) {
        setMunicipiosState(result.data || []);
      } else {
        console.error(`[useStudentGeographicData] Error al cargar municipios (${contexto}):`, result.error);
        setMunicipiosState([]);
      }
    } catch (err) {
      console.error(`[useStudentGeographicData] Error inesperado al cargar municipios (${contexto}):`, err);
      setMunicipiosState([]);
    }
  }, []);

  return {
    // Datos geográficos (cargados bajo demanda)
    departamentos,
    provincias, // Para origen (primera nacionalidad)
    provinciasResidencia, // Para residencia
    segundaProvincias, // Para segunda nacionalidad
    municipios, // Para origen (primera nacionalidad)
    municipiosResidencia, // Para residencia
    segundaMunicipios, // Para segunda nacionalidad
    
    // Opciones estáticas
    tiposOrigen: TIPO_ORIGEN,
    
    // Funciones para cargar datos bajo demanda
    loadDepartamentos,
    loadProvincias, // Acepta contexto: 'origen' (default), 'residencia', 'segunda'
    loadMunicipios, // Acepta contexto: 'origen' (default), 'residencia', 'segunda'
  };
};

