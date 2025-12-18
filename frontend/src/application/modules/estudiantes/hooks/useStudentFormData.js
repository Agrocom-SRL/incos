/**
 * Hook personalizado: useStudentFormData
 * 
 * Single Responsibility: Solo obtiene datos iniciales para mostrar la página
 * Propósito: Obtener datos necesarios para renderizar el formulario (estadísticas, opciones, etc.)
 * 
 * Este hook se usa cuando la página se carga (GET requests)
 */

import { useState, useEffect } from 'react';
import apiClient from '@infrastructure/api/client.js';

export const useStudentFormData = () => {
  const [stats, setStats] = useState({
    todayStudents: 0,
    monthStudents: 0,
    totalStudents: 0,
  });
  const [carreras, setCarreras] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [tiposDiscapacidad, setTiposDiscapacidad] = useState([]);
  const [documentacionInscripcion, setDocumentacionInscripcion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Opciones estáticas para los select
  const expediciones = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];
  const generos = ['MASCULINO', 'FEMENINO', 'OTRO'];
  const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      setError(null);

      // Contador para rastrear cuántas peticiones fallaron
      let failedRequests = 0;
      const totalRequests = 5; // Paises, departamentos, provincias, municipios, documentacion-inscripcion
      const catalogErrors = [];

      try {
        console.log('[useStudentFormData] 🔍🔍🔍 MODO DEBUG: Probando datos geográficos y documentación (paises, departamentos, provincias, municipios, documentacion-inscripcion)');
        console.log('[useStudentFormData] 📍 Paso 1: Iniciando carga de catálogos...');
        console.log('[useStudentFormData] 📍 Paso 2: Preparando llamadas a API...');
        console.log('[useStudentFormData] 📍 Paso 3: URLs objetivo: /v1/catalogs/paises, /v1/catalogs/departamentos, /v1/catalogs/provincias, /v1/catalogs/municipios, /v1/catalogs/documentacion-inscripcion');
        
        // ============================================
        // Habilitar datos geográficos y documentación
        // Paises, departamentos, provincias, municipios, documentacion-inscripcion
        // Carga SECUENCIAL para evitar problemas de concurrencia
        // ============================================
        
        const startTime = performance.now();
        console.log('[useStudentFormData] 📍 Paso 4: Iniciando carga SECUENCIAL (no paralela) para evitar problemas de concurrencia...', { timestamp: new Date().toISOString() });
        
        // Cargar catálogos de forma SECUENCIAL para evitar problemas de concurrencia
        const catalogNames = ['paises', 'departamentos', 'provincias', 'municipios', 'documentacion-inscripcion'];
        const catalogUrls = [
          '/v1/catalogs/paises',
          '/v1/catalogs/departamentos',
          '/v1/catalogs/provincias',
          '/v1/catalogs/municipios',
          '/v1/catalogs/documentacion-inscripcion',
        ];
        
        const catalogResults = [];
        
        for (let i = 0; i < catalogUrls.length; i++) {
          const catalogName = catalogNames[i];
          const catalogUrl = catalogUrls[i];
          
          console.log(`[useStudentFormData] 📍 Paso 4.${i + 1}: Cargando ${catalogName}...`, {
            url: catalogUrl,
            timestamp: new Date().toISOString(),
          });
          
          const requestStartTime = performance.now();
          
          try {
            const result = await apiClient.get(catalogUrl);
            const requestEndTime = performance.now();
            
            console.log(`[useStudentFormData] ✓ ${catalogName} cargado correctamente`, {
              duration: `${(requestEndTime - requestStartTime).toFixed(2)}ms`,
              hasData: !!result?.data,
              hasDataData: !!result?.data?.data,
              dataLength: result?.data?.data?.length || 0,
            });
            
            catalogResults.push({ status: 'fulfilled', value: result });
          } catch (error) {
            const requestEndTime = performance.now();
            failedRequests++;
            
            console.error(`[useStudentFormData] ✗ Error al cargar ${catalogName}`, {
              duration: `${(requestEndTime - requestStartTime).toFixed(2)}ms`,
              message: error.message,
              status: error.response?.status,
              responseData: error.response?.data,
            });
            
            const errorDetails = {
              catalog: catalogName,
              message: error.message,
              status: error.response?.status,
              statusText: error.response?.statusText,
              url: error.config?.url,
              data: error.response?.data,
              fullError: error,
            };
            catalogErrors.push(errorDetails);
            
            catalogResults.push({ status: 'rejected', reason: error });
          }
          
          // Pequeño delay entre peticiones para evitar saturar el servidor
          if (i < catalogUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms de delay
          }
        }

        const endTime = performance.now();
        console.log('[useStudentFormData] 📍 Paso 5: Carga secuencial completada', { 
          duration: `${(endTime - startTime).toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
          resultsCount: catalogResults.length,
        });

        // Procesar resultados
        console.log('[useStudentFormData] 📍 Paso 6: Procesando resultados...', { 
          resultsLength: catalogResults.length,
          catalogNames,
        });
        
        const [paisesRes, departamentosRes, provinciasRes, municipiosRes, documentacionRes] = catalogResults.map((result, index) => {
          console.log(`[useStudentFormData] 📍 Paso 6.${index + 1}: Procesando resultado ${index} (${catalogNames[index]})...`, {
            status: result.status,
            hasValue: !!result.value,
            hasReason: !!result.reason,
          });
          
          if (result.status === 'fulfilled') {
            console.log(`[useStudentFormData] ✓ Catálogo "${catalogNames[index]}" procesado correctamente`);
            return result.value;
          } else {
            console.error(`[useStudentFormData] ✗ Error procesando catálogo "${catalogNames[index]}"`);
            // Retornar respuesta vacía para que no rompa el código
            return { data: { data: [] } };
          }
        });

        console.log('[useStudentFormData] 📍 Paso 7: Estableciendo estados...', {
          hasPaisesRes: !!paisesRes,
          paisesCount: paisesRes?.data?.data?.length || 0,
          hasDepartamentosRes: !!departamentosRes,
          departamentosCount: departamentosRes?.data?.data?.length || 0,
          hasProvinciasRes: !!provinciasRes,
          provinciasCount: provinciasRes?.data?.data?.length || 0,
          hasMunicipiosRes: !!municipiosRes,
          municipiosCount: municipiosRes?.data?.data?.length || 0,
          hasDocumentacionRes: !!documentacionRes,
          documentacionCount: documentacionRes?.data?.data?.length || 0,
        });

        // Establecer datos geográficos y documentación, el resto vacío
        setCarreras([]); // Deshabilitado temporalmente
        setGestiones([]); // Deshabilitado temporalmente
        setPaises(paisesRes.data?.data || []);
        setIdiomas([]); // Deshabilitado temporalmente
        setTiposDiscapacidad([]);
        setDocumentacionInscripcion(documentacionRes.data?.data || []);
        setDepartamentos(departamentosRes.data?.data || []);
        setProvincias(provinciasRes.data?.data || []);
        setMunicipios(municipiosRes.data?.data || []);
        
        console.log('[useStudentFormData] 📍 Paso 8: Estados establecidos correctamente');

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });

        // Mostrar resumen de errores si los hay
        if (catalogErrors.length > 0) {
          console.warn(`[useStudentFormData] ⚠️ ${catalogErrors.length} de ${totalRequests} catálogos fallaron:`, catalogErrors);
          if (failedRequests === totalRequests) {
            setError('No se pudieron cargar los catálogos. Por favor, intenta recargar la página.');
          } else {
            console.warn(`[useStudentFormData] La página continuará funcionando con ${totalRequests - failedRequests} catálogos cargados correctamente.`);
          }
        } else {
          console.log('[useStudentFormData] ✓ Todos los catálogos (geográficos y documentación) cargados correctamente');
          console.log('[useStudentFormData] 📍 Paso 9: Carga completada sin errores');
        }
      } catch (err) {
        // Error inesperado (no debería llegar aquí con Promise.allSettled, pero por si acaso)
        console.error('[useStudentFormData] ✗ Error inesperado al cargar datos del formulario:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError('Error al inicializar el formulario');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    let failedRequests = 0;
    const totalRequests = 5; // Paises, departamentos, provincias, municipios, documentacion-inscripcion
      const catalogErrors = [];

    try {
      console.log('[useStudentFormData] 🔍🔍🔍 Refetch: Recargando catálogos SECUENCIALMENTE...');
      console.log('[useStudentFormData] 📍 Refetch Paso 1: Iniciando recarga secuencial...');
      
      // Cargar catálogos de forma SECUENCIAL
      const catalogNames = ['paises', 'departamentos', 'provincias', 'municipios', 'documentacion-inscripcion'];
      const catalogUrls = [
        '/v1/catalogs/paises',
        '/v1/catalogs/departamentos',
        '/v1/catalogs/provincias',
        '/v1/catalogs/municipios',
        '/v1/catalogs/documentacion-inscripcion',
      ];
      
      const startTime = performance.now();
      const catalogResults = [];
      
      for (let i = 0; i < catalogUrls.length; i++) {
        const catalogName = catalogNames[i];
        const catalogUrl = catalogUrls[i];
        
        try {
          const result = await apiClient.get(catalogUrl);
          catalogResults.push({ status: 'fulfilled', value: result });
          console.log(`[useStudentFormData] ✓ ${catalogName} recargado correctamente`);
        } catch (error) {
          failedRequests++;
          catalogErrors.push({
            catalog: catalogName,
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
          });
          catalogResults.push({ status: 'rejected', reason: error });
          console.error(`[useStudentFormData] ✗ Error al recargar ${catalogName}:`, error.message);
        }
        
        // Pequeño delay entre peticiones
        if (i < catalogUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      const endTime = performance.now();
      console.log('[useStudentFormData] 📍 Refetch Paso 2: Recarga secuencial completada', {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
      });

      const [paisesRes, departamentosRes, provinciasRes, municipiosRes, documentacionRes] = catalogResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return { data: { data: [] } };
        }
      });

      setCarreras([]); // Deshabilitado temporalmente
      setGestiones([]); // Deshabilitado temporalmente
      setPaises(paisesRes.data?.data || []);
      setIdiomas([]); // Deshabilitado temporalmente
      setTiposDiscapacidad([]);
      setDocumentacionInscripcion(documentacionRes.data?.data || []);
      setDepartamentos(departamentosRes.data?.data || []);
      setProvincias(provinciasRes.data?.data || []);
      setMunicipios(municipiosRes.data?.data || []);
      
      console.log('[useStudentFormData] 📍 Refetch Paso 4: Estados actualizados');

      setStats({
        todayStudents: 5,
        monthStudents: 127,
        totalStudents: 1543,
      });

      // Mostrar resultado del refetch
      if (failedRequests > 0) {
        console.warn(`[useStudentFormData] ⚠️ ${failedRequests} de ${totalRequests} catálogos fallaron al recargar:`, catalogErrors);
        if (failedRequests === totalRequests) {
          setError('No se pudieron recargar los catálogos. Por favor, intenta nuevamente.');
        }
      } else {
        console.log('[useStudentFormData] ✓ Todos los catálogos (geográficos y documentación) recargados correctamente');
        console.log('[useStudentFormData] 📍 Refetch Paso 5: Recarga completada sin errores');
      }
    } catch (err) {
      console.error('[useStudentFormData] ✗ Error inesperado al recargar datos del formulario:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      // No establecer error fatal, permitir que la página siga funcionando
    } finally {
      setLoading(false);
    }
  };

  // Funciones para cargar datos geográficos (mantenidas para compatibilidad, pero ya no son necesarias)
  // Los datos se cargan todos al inicio y se filtran en el frontend
  const loadDepartamentos = async (paisId) => {
    // No hacer nada, los datos ya están cargados y se filtran en FormField
  };

  const loadProvincias = async (departamentoId) => {
    // No hacer nada, los datos ya están cargados y se filtran en FormField
  };

  const loadMunicipios = async (provinciaId) => {
    // No hacer nada, los datos ya están cargados y se filtran en FormField
  };

  return {
    // Datos para mostrar
    stats,
    expediciones,
    generos,
    tiposSangre,
    carreras,
    gestiones,
    paises,
    departamentos,
    provincias,
    municipios,
    idiomas,
    tiposDiscapacidad,
    documentacionInscripcion,
    
    // Estados
    loading,
    error,
    
    // Funciones para refrescar datos
    refetch,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  };
};

