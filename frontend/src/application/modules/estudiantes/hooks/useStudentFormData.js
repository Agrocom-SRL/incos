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

      try {
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

        // Procesar resultados de catálogos
        const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = catalogResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            const catalogNames = ['carreras', 'gestiones', 'paises', 'idiomas', 'tipos-discapacidad', 'documentacion-inscripcion'];
            console.error(`Error al cargar catálogo ${catalogNames[index]}:`, result.reason);
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
        const geoResults = await Promise.allSettled([
          apiClient.get('/v1/catalogs/departamentos'),
          apiClient.get('/v1/catalogs/provincias'),
          apiClient.get('/v1/catalogs/municipios'),
        ]);

        const [departamentosRes, provinciasRes, municipiosRes] = geoResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            const geoNames = ['departamentos', 'provincias', 'municipios'];
            console.error(`Error al cargar datos geográficos ${geoNames[index]}:`, result.reason);
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
      } catch (err) {
        // Solo establecer error si TODAS las peticiones fallaron
        // Si algunas fallaron pero otras funcionaron, solo loguear el error
        const errorMessage = err.response?.data?.error?.message || 
                            err.response?.data?.message ||
                            err.message || 
                            'Error al cargar datos del formulario';
        
        // Si es un error de red o de servidor, intentar mostrar un mensaje más útil
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
          console.error('Error de conexión al cargar datos del formulario:', err);
          setError('Error de conexión con el servidor. Por favor, verifica tu conexión a internet.');
        } else if (err.response?.status >= 500) {
          console.error('Error del servidor al cargar datos del formulario:', err);
          setError('Error del servidor. Por favor, intenta recargar la página.');
        } else {
          console.error('Error al cargar datos del formulario:', err);
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar Promise.allSettled para que si una falla, las demás continúen
      const catalogResults = await Promise.allSettled([
        apiClient.get('/v1/catalogs/carreras'),
        apiClient.get('/v1/catalogs/gestiones'),
        apiClient.get('/v1/catalogs/paises'),
        apiClient.get('/v1/catalogs/idiomas'),
        apiClient.get('/v1/catalogs/tipos-discapacidad'),
        apiClient.get('/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION'),
      ]);

      const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = catalogResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const catalogNames = ['carreras', 'gestiones', 'paises', 'idiomas', 'tipos-discapacidad', 'documentacion-inscripcion'];
          console.error(`Error al recargar catálogo ${catalogNames[index]}:`, result.reason);
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

      const [departamentosRes, provinciasRes, municipiosRes] = geoResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const geoNames = ['departamentos', 'provincias', 'municipios'];
          console.error(`Error al recargar datos geográficos ${geoNames[index]}:`, result.reason);
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
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message ||
                          err.message || 
                          'Error al recargar datos del formulario';
      setError(errorMessage);
      console.error('Error al recargar datos del formulario:', err);
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

