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
        const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = await Promise.all([
          apiClient.get('/v1/catalogs/carreras'),
          apiClient.get('/v1/catalogs/gestiones'),
          apiClient.get('/v1/catalogs/paises'),
          apiClient.get('/v1/catalogs/idiomas'),
          apiClient.get('/v1/catalogs/tipos-discapacidad'),
          apiClient.get('/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION'),
        ]);

        setCarreras(carrerasRes.data?.data || []);
        setGestiones(gestionesRes.data?.data || []);
        setPaises(paisesRes.data?.data || []);
        
        // Cargar todos los datos geográficos al inicio (se filtrarán en el frontend)
        const [departamentosRes, provinciasRes, municipiosRes] = await Promise.all([
          apiClient.get('/v1/catalogs/departamentos'),
          apiClient.get('/v1/catalogs/provincias'),
          apiClient.get('/v1/catalogs/municipios'),
        ]);
        
        setDepartamentos(departamentosRes.data?.data || []);
        setProvincias(provinciasRes.data?.data || []);
        setMunicipios(municipiosRes.data?.data || []);
        setIdiomas(idiomasRes.data?.data || []);
        setTiposDiscapacidad(tiposDiscRes.data?.data || []);
        const documentacionData = documentacionRes.data?.data || [];
        console.log('[useStudentFormData] Documentos de inscripción recibidos del backend:', {
          total: documentacionData.length,
          documentos: documentacionData,
        });
        setDocumentacionInscripcion(documentacionData);

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.error?.message || 
                            err.message || 
                            'Error al cargar datos del formulario';
        setError(errorMessage);
        console.error('Error al cargar datos del formulario:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const [carrerasRes, gestionesRes, paisesRes, idiomasRes, tiposDiscRes, documentacionRes] = await Promise.all([
        apiClient.get('/v1/catalogs/carreras'),
        apiClient.get('/v1/catalogs/gestiones'),
        apiClient.get('/v1/catalogs/paises'),
        apiClient.get('/v1/catalogs/idiomas'),
        apiClient.get('/v1/catalogs/tipos-discapacidad'),
        apiClient.get('/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION'),
      ]);

      setCarreras(carrerasRes.data?.data || []);
      setGestiones(gestionesRes.data?.data || []);
      setPaises(paisesRes.data?.data || []);
      
      // Cargar todos los datos geográficos
      const [departamentosRes, provinciasRes, municipiosRes] = await Promise.all([
        apiClient.get('/v1/catalogs/departamentos'),
        apiClient.get('/v1/catalogs/provincias'),
        apiClient.get('/v1/catalogs/municipios'),
      ]);
      
      setDepartamentos(departamentosRes.data?.data || []);
      setProvincias(provinciasRes.data?.data || []);
      setMunicipios(municipiosRes.data?.data || []);
      setIdiomas(idiomasRes.data?.data || []);
      setTiposDiscapacidad(tiposDiscRes.data?.data || []);
      setDocumentacionInscripcion(documentacionRes.data?.data || []);

      setStats({
        todayStudents: 5,
        monthStudents: 127,
        totalStudents: 1543,
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
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

