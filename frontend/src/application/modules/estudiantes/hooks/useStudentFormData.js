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
        // TEMPORALMENTE DESHABILITADO: Carga de catálogos
        // Esto permite diagnosticar si el problema es solo con los catálogos
        // o si también afecta a la carga de datos del estudiante
        console.warn('[useStudentFormData] ⚠️ Carga de catálogos DESHABILITADA temporalmente para diagnóstico');
        console.warn('[useStudentFormData] Los catálogos se establecerán como arrays vacíos');
        
        // Establecer todos los catálogos como vacíos temporalmente
        setCarreras([]);
        setGestiones([]);
        setPaises([]);
        setDepartamentos([]);
        setProvincias([]);
        setMunicipios([]);
        setIdiomas([]);
        setTiposDiscapacidad([]);
        setDocumentacionInscripcion([]);

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });

        console.log('[useStudentFormData] ✓ Datos inicializados (catálogos deshabilitados para diagnóstico)');
      } catch (err) {
        console.error('Error inesperado al inicializar datos del formulario:', err);
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

    try {
      // TEMPORALMENTE DESHABILITADO: Carga de catálogos
      console.warn('[useStudentFormData] ⚠️ Refetch: Catálogos deshabilitados para diagnóstico');
      
      // Establecer todos los catálogos como vacíos
      setCarreras([]);
      setGestiones([]);
      setPaises([]);
      setDepartamentos([]);
      setProvincias([]);
      setMunicipios([]);
      setIdiomas([]);
      setTiposDiscapacidad([]);
      setDocumentacionInscripcion([]);

      setStats({
        todayStudents: 5,
        monthStudents: 127,
        totalStudents: 1543,
      });
    } catch (err) {
      console.error('Error inesperado al recargar datos del formulario:', err);
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

