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
      const totalRequests = 9; // 6 catálogos + 3 geográficos
      const catalogErrors = [];

      try {
        console.log('[useStudentFormData] Iniciando carga de catálogos...');
        
        // Cargar catálogos en paralelo
        // Usar Promise.allSettled para que si una falla, las demás continúen
        const catalogResults = await Promise.allSettled([
          apiClient.get('/v1/catalogs/carreras'),
          apiClient.get('/v1/catalogs/gestiones'),
          apiClient.get('/v1/catalogs/paises'),
          apiClient.get('/v1/catalogs/idiomas'),
          apiClient.get('/v1/catalogs/tipos-discapacidad'),
          apiClient.get('/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION'),
        ]);

        // Procesar resultados de catálogos con logging detallado
        const catalogNames = ['carreras', 'gestiones', 'paises', 'idiomas', 'tipos-discapacidad', 'documentacion-inscripcion'];
        const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = catalogResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`[useStudentFormData] ✓ Catálogo "${catalogNames[index]}" cargado correctamente`);
            return result.value;
          } else {
            failedRequests++;
            const error = result.reason;
            const errorDetails = {
              catalog: catalogNames[index],
              message: error.message,
              status: error.response?.status,
              statusText: error.response?.statusText,
              url: error.config?.url,
              data: error.response?.data,
            };
            catalogErrors.push(errorDetails);
            console.error(`[useStudentFormData] ✗ Error al cargar catálogo "${catalogNames[index]}":`, errorDetails);
            // Retornar respuesta vacía para que no rompa el código
            return { data: { data: [] } };
          }
        });

        setCarreras(carrerasRes.data?.data || []);
        setGestiones(gestionesRes.data?.data || []);
        setPaises(paisesRes.data?.data || []);
        setIdiomas(idiomasRes.data?.data || []);
        setTiposDiscapacidad(tiposDiscRes.data?.data || []);
        
        const documentacionData = documentacionRes.data?.data || [];
        console.log('[useStudentFormData] Documentos de inscripción recibidos del backend:', {
          total: documentacionData.length,
          documentos: documentacionData,
        });
        setDocumentacionInscripcion(documentacionData);
        
        // Cargar todos los datos geográficos al inicio (se filtrarán en el frontend)
        console.log('[useStudentFormData] Cargando datos geográficos...');
        const geoResults = await Promise.allSettled([
          apiClient.get('/v1/catalogs/departamentos'),
          apiClient.get('/v1/catalogs/provincias'),
          apiClient.get('/v1/catalogs/municipios'),
        ]);

        const geoNames = ['departamentos', 'provincias', 'municipios'];
        const [departamentosRes, provinciasRes, municipiosRes] = geoResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`[useStudentFormData] ✓ Datos geográficos "${geoNames[index]}" cargados correctamente`);
            return result.value;
          } else {
            failedRequests++;
            const error = result.reason;
            const errorDetails = {
              catalog: geoNames[index],
              message: error.message,
              status: error.response?.status,
              statusText: error.response?.statusText,
              url: error.config?.url,
              data: error.response?.data,
            };
            catalogErrors.push(errorDetails);
            console.error(`[useStudentFormData] ✗ Error al cargar datos geográficos "${geoNames[index]}":`, errorDetails);
            return { data: { data: [] } };
          }
        });
        
        setDepartamentos(departamentosRes.data?.data || []);
        setProvincias(provinciasRes.data?.data || []);
        setMunicipios(municipiosRes.data?.data || []);

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });

        // Mostrar resumen de errores si los hay
        if (catalogErrors.length > 0) {
          console.warn(`[useStudentFormData] ⚠️ ${catalogErrors.length} de ${totalRequests} catálogos fallaron:`, catalogErrors);
          // Solo mostrar error si TODAS las peticiones fallaron
          if (failedRequests === totalRequests) {
            setError('No se pudieron cargar los datos del formulario. Por favor, intenta recargar la página.');
          } else {
            console.warn(`[useStudentFormData] La página continuará funcionando con ${totalRequests - failedRequests} catálogos cargados correctamente.`);
          }
        } else {
          console.log('[useStudentFormData] ✓ Todos los catálogos cargados correctamente');
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
    const totalRequests = 9;
    const catalogErrors = [];

    try {
      console.log('[useStudentFormData] Refetch: Recargando catálogos...');
      
      // Usar Promise.allSettled para que si una falla, las demás continúen
      const catalogResults = await Promise.allSettled([
        apiClient.get('/v1/catalogs/carreras'),
        apiClient.get('/v1/catalogs/gestiones'),
        apiClient.get('/v1/catalogs/paises'),
        apiClient.get('/v1/catalogs/idiomas'),
        apiClient.get('/v1/catalogs/tipos-discapacidad'),
        apiClient.get('/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION'),
      ]);

      const catalogNames = ['carreras', 'gestiones', 'paises', 'idiomas', 'tipos-discapacidad', 'documentacion-inscripcion'];
      const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = catalogResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          failedRequests++;
          const error = result.reason;
          catalogErrors.push({
            catalog: catalogNames[index],
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
          });
          console.error(`[useStudentFormData] ✗ Error al recargar catálogo "${catalogNames[index]}":`, error);
          return { data: { data: [] } };
        }
      });

      setCarreras(carrerasRes.data?.data || []);
      setGestiones(gestionesRes.data?.data || []);
      setPaises(paisesRes.data?.data || []);
      setIdiomas(idiomasRes.data?.data || []);
      setTiposDiscapacidad(tiposDiscRes.data?.data || []);
      setDocumentacionInscripcion(documentacionRes.data?.data || []);
      
      // Cargar todos los datos geográficos
      const geoResults = await Promise.allSettled([
        apiClient.get('/v1/catalogs/departamentos'),
        apiClient.get('/v1/catalogs/provincias'),
        apiClient.get('/v1/catalogs/municipios'),
      ]);

      const geoNames = ['departamentos', 'provincias', 'municipios'];
      const [departamentosRes, provinciasRes, municipiosRes] = geoResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          failedRequests++;
          const error = result.reason;
          catalogErrors.push({
            catalog: geoNames[index],
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
          });
          console.error(`[useStudentFormData] ✗ Error al recargar datos geográficos "${geoNames[index]}":`, error);
          return { data: { data: [] } };
        }
      });
      
      setDepartamentos(departamentosRes.data?.data || []);
      setProvincias(provinciasRes.data?.data || []);
      setMunicipios(municipiosRes.data?.data || []);

      setStats({
        todayStudents: 5,
        monthStudents: 127,
        totalStudents: 1543,
      });

      // Solo mostrar error si TODAS las peticiones fallaron
      if (failedRequests === totalRequests) {
        setError('No se pudieron recargar los datos. Por favor, intenta nuevamente.');
      } else if (failedRequests > 0) {
        console.warn(`[useStudentFormData] ⚠️ ${failedRequests} de ${totalRequests} peticiones fallaron al recargar:`, catalogErrors);
      } else {
        console.log('[useStudentFormData] ✓ Todos los catálogos recargados correctamente');
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

