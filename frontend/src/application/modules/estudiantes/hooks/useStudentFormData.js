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
      const totalRequests = 3; // Carreras, gestiones e idiomas (modo debug)
      const catalogErrors = [];

      try {
        console.log('[useStudentFormData] 🔍 MODO DEBUG: Probando carreras, gestiones e idiomas');
        
        // ============================================
        // DEBUG: Habilitar CARRERAS, GESTIONES e IDIOMAS
        // ============================================
        
        // Cargar carreras, gestiones e idiomas
        const catalogResults = await Promise.allSettled([
          apiClient.get('/v1/catalogs/carreras'),
          apiClient.get('/v1/catalogs/gestiones'),
          apiClient.get('/v1/catalogs/idiomas'),
        ]);

        // Procesar resultados
        const catalogNames = ['carreras', 'gestiones', 'idiomas'];
        const [carrerasRes, gestionesRes, idiomasRes] = catalogResults.map((result, index) => {
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

        // Establecer carreras, gestiones e idiomas, el resto vacío
        setCarreras(carrerasRes.data?.data || []);
        setGestiones(gestionesRes.data?.data || []);
        setPaises([]);
        setIdiomas(idiomasRes.data?.data || []);
        setTiposDiscapacidad([]);
        setDocumentacionInscripcion([]);
        setDepartamentos([]);
        setProvincias([]);
        setMunicipios([]);

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
          console.log('[useStudentFormData] ✓ Todos los catálogos (carreras, gestiones, idiomas) cargados correctamente');
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
    const totalRequests = 3; // Carreras, gestiones e idiomas (modo debug)
    const catalogErrors = [];

    try {
      console.log('[useStudentFormData] 🔍 Refetch: Recargando carreras, gestiones e idiomas...');
      
      // Cargar carreras, gestiones e idiomas
      const catalogResults = await Promise.allSettled([
        apiClient.get('/v1/catalogs/carreras'),
        apiClient.get('/v1/catalogs/gestiones'),
        apiClient.get('/v1/catalogs/idiomas'),
      ]);

      const catalogNames = ['carreras', 'gestiones', 'idiomas'];
      const [carrerasRes, gestionesRes, idiomasRes] = catalogResults.map((result, index) => {
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
      setPaises([]);
      setIdiomas(idiomasRes.data?.data || []);
      setTiposDiscapacidad([]);
      setDocumentacionInscripcion([]);
      setDepartamentos([]);
      setProvincias([]);
      setMunicipios([]);

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
        console.log('[useStudentFormData] ✓ Todos los catálogos (carreras, gestiones, idiomas) recargados correctamente');
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

