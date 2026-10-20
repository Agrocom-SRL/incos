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

import { useState, useCallback, useMemo } from 'react';
import { useCasesFactory } from '@container';
import { TIPO_ORIGEN } from '@infrastructure/config/constants';
import { createOptimizedArraySetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && false; // Cambiar a true para activar logs

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

  // Setters optimizados creados una sola vez (memoizados, referencia estable)
  const optimizedSetDepartamentos = useMemo(() => createOptimizedArraySetter(setDepartamentos), []);
  const optimizedSetProvincias = useMemo(() => createOptimizedArraySetter(setProvincias), []);
  const optimizedSetProvinciasResidencia = useMemo(() => createOptimizedArraySetter(setProvinciasResidencia), []);
  const optimizedSetSegundaProvincias = useMemo(() => createOptimizedArraySetter(setSegundaProvincias), []);
  const optimizedSetMunicipios = useMemo(() => createOptimizedArraySetter(setMunicipios), []);
  const optimizedSetMunicipiosResidencia = useMemo(() => createOptimizedArraySetter(setMunicipiosResidencia), []);
  const optimizedSetSegundaMunicipios = useMemo(() => createOptimizedArraySetter(setSegundaMunicipios), []);


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
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetDepartamentos(result.data || []);
      } else {
        console.error('[useStudentGeographicData] Error al cargar departamentos:', result.error);
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetDepartamentos([]);
      }
    } catch (err) {
      console.error('[useStudentGeographicData] Error inesperado al cargar departamentos:', err);
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetDepartamentos([]);
    }
  }, [optimizedSetDepartamentos]);

  /**
   * Carga provincias filtradas por departamento según contexto
   * @param {number} departamentoId - ID del departamento
   * @param {string} contexto - Contexto de la provincia: 'origen' (default), 'residencia', 'segunda'
   */
  const loadProvincias = useCallback(async (departamentoId, contexto = 'origen') => {
    // Determinar qué setter optimizado usar según el contexto
    let optimizedSetProvinciasState;
    switch (contexto) {
      case 'residencia':
        optimizedSetProvinciasState = optimizedSetProvinciasResidencia;
        break;
      case 'segunda':
        optimizedSetProvinciasState = optimizedSetSegundaProvincias;
        break;
      case 'origen':
      default:
        optimizedSetProvinciasState = optimizedSetProvincias;
        break;
    }

    if (!departamentoId) {
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetProvinciasState([]);
      // No limpiar municipios aquí, se limpian por contexto en loadMunicipios
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('provincias', departamentoId);

      if (result.success) {
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetProvinciasState(result.data || []);
      } else {
        console.error(`[useStudentGeographicData] Error al cargar provincias (${contexto}):`, result.error);
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetProvinciasState([]);
      }
    } catch (err) {
      console.error(`[useStudentGeographicData] Error inesperado al cargar provincias (${contexto}):`, err);
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetProvinciasState([]);
    }
  }, [optimizedSetProvincias, optimizedSetProvinciasResidencia, optimizedSetSegundaProvincias]);

  /**
   * Carga municipios filtrados por provincia según contexto
   * @param {number} provinciaId - ID de la provincia
   * @param {string} contexto - Contexto del municipio: 'origen' (default), 'residencia', 'segunda'
   */
  const loadMunicipios = useCallback(async (provinciaId, contexto = 'origen') => {
    // Determinar qué setter optimizado usar según el contexto
    let optimizedSetMunicipiosState;
    switch (contexto) {
      case 'residencia':
        optimizedSetMunicipiosState = optimizedSetMunicipiosResidencia;
        break;
      case 'segunda':
        optimizedSetMunicipiosState = optimizedSetSegundaMunicipios;
        break;
      case 'origen':
      default:
        optimizedSetMunicipiosState = optimizedSetMunicipios;
        break;
    }

    if (!provinciaId) {
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetMunicipiosState([]);
      return;
    }

    try {
      const obtenerGeograficosUseCase = useCasesFactory.obtenerDatosGeograficosFiltrados();
      const result = await obtenerGeograficosUseCase.ejecutar('municipios', provinciaId);

      if (result.success) {
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetMunicipiosState(result.data || []);
      } else {
        console.error(`[useStudentGeographicData] Error al cargar municipios (${contexto}):`, result.error);
        // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
        optimizedSetMunicipiosState([]);
      }
    } catch (err) {
      console.error(`[useStudentGeographicData] Error inesperado al cargar municipios (${contexto}):`, err);
      // OPTIMIZACIÓN: Solo actualizar si los datos realmente cambiaron
      optimizedSetMunicipiosState([]);
    }
  }, [optimizedSetMunicipios, optimizedSetMunicipiosResidencia, optimizedSetSegundaMunicipios]);

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
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
    },
    ENABLE_RENDER_LOGS,
    'useStudentGeographicApi'
  );
};

