/**
 * Hook personalizado: useStudentFormData
 * 
 * Single Responsibility: Solo obtiene datos iniciales para mostrar la página
 * Propósito: Obtener datos necesarios para renderizar el formulario (estadísticas, opciones, etc.)
 * 
 * Este hook se usa cuando la página se carga (GET requests)
 */

import { useState, useEffect } from 'react';
import apiClient from '@api-client';

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
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [tiposParentesco, setTiposParentesco] = useState([]);
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
      const totalRequests = 11; // Todos los catálogos
      const catalogErrors = [];

      try {
        // Cargar todos los catálogos de forma SECUENCIAL para evitar problemas de concurrencia
        const catalogNames = [
          'carreras',
          'gestiones',
          'paises',
          'departamentos',
          'provincias',
          'municipios',
          'idiomas',
          'tipos-discapacidad',
          'estados-civiles',
          'tipos-parentesco',
          'documentacion-inscripcion',
        ];
        const catalogUrls = [
          '/v1/catalogs/carreras',
          '/v1/catalogs/gestiones',
          '/v1/catalogs/paises',
          '/v1/catalogs/departamentos',
          '/v1/catalogs/provincias',
          '/v1/catalogs/municipios',
          '/v1/catalogs/idiomas',
          '/v1/catalogs/tipos-discapacidad',
          '/v1/catalogs/estados-civiles',
          '/v1/catalogs/tipos-parentesco',
          '/v1/catalogs/documentacion-inscripcion',
        ];
        
        const catalogResults = [];
        
        for (let i = 0; i < catalogUrls.length; i++) {
          const catalogName = catalogNames[i];
          const catalogUrl = catalogUrls[i];
          
          try {
            const result = await apiClient.get(catalogUrl);
            catalogResults.push({ status: 'fulfilled', value: result });
          } catch (error) {
            failedRequests++;
            catalogErrors.push({
              catalog: catalogName,
              message: error.message,
              status: error.response?.status,
            });
            catalogResults.push({ status: 'rejected', reason: error });
            console.error(`[useStudentFormData] Error al cargar ${catalogName}:`, error.message);
          }
          
          // Delay entre peticiones para evitar saturar el servidor
          // Aumentado a 100ms para dar más tiempo al servidor entre peticiones
          if (i < catalogUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay (aumentado de 50ms)
          }
        }

        // Procesar resultados
        const [
          carrerasRes,
          gestionesRes,
          paisesRes,
          departamentosRes,
          provinciasRes,
          municipiosRes,
          idiomasRes,
          tiposDiscapacidadRes,
          estadosCivilesRes,
          tiposParentescoRes,
          documentacionRes,
        ] = catalogResults.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return { data: { data: [] } };
          }
        });

        // Establecer todos los catálogos
        setCarreras(carrerasRes.data?.data || []);
        setGestiones(gestionesRes.data?.data || []);
        setPaises(paisesRes.data?.data || []);
        setDepartamentos(departamentosRes.data?.data || []);
        setProvincias(provinciasRes.data?.data || []);
        setMunicipios(municipiosRes.data?.data || []);
        setIdiomas(idiomasRes.data?.data || []);
        setTiposDiscapacidad(tiposDiscapacidadRes.data?.data || []);
        setEstadosCiviles(estadosCivilesRes.data?.data || []);
        setTiposParentesco(tiposParentescoRes.data?.data || []);
        setDocumentacionInscripcion(documentacionRes.data?.data || []);

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });

        // Mostrar resumen de errores si los hay
        if (catalogErrors.length > 0) {
          console.warn(`[useStudentFormData] ${catalogErrors.length} de ${totalRequests} catálogos fallaron:`, catalogErrors);
          if (failedRequests === totalRequests) {
            setError('No se pudieron cargar los catálogos. Por favor, intenta recargar la página.');
          }
        }
      } catch (err) {
        console.error('[useStudentFormData] Error inesperado al cargar datos del formulario:', err.message);
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
    const totalRequests = 11; // Todos los catálogos
      const catalogErrors = [];

    try {
      // IMPORTANTE: Esperar un momento antes de empezar a cargar catálogos
      // Esto es especialmente importante después de operaciones pesadas (subida de documentos, etc.)
      // para dar tiempo al servidor de procesar las operaciones anteriores
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms de delay inicial
      
      // Cargar todos los catálogos de forma SECUENCIAL
      const catalogNames = [
        'carreras',
        'gestiones',
        'paises',
        'departamentos',
        'provincias',
        'municipios',
        'idiomas',
        'tipos-discapacidad',
        'estados-civiles',
        'tipos-parentesco',
        'documentacion-inscripcion',
      ];
      const catalogUrls = [
        '/v1/catalogs/carreras',
        '/v1/catalogs/gestiones',
        '/v1/catalogs/paises',
        '/v1/catalogs/departamentos',
        '/v1/catalogs/provincias',
        '/v1/catalogs/municipios',
        '/v1/catalogs/idiomas',
        '/v1/catalogs/tipos-discapacidad',
        '/v1/catalogs/estados-civiles',
        '/v1/catalogs/tipos-parentesco',
        '/v1/catalogs/documentacion-inscripcion',
      ];
      
      const catalogResults = [];
      
      for (let i = 0; i < catalogUrls.length; i++) {
        const catalogName = catalogNames[i];
        const catalogUrl = catalogUrls[i];
        
        try {
          const result = await apiClient.get(catalogUrl);
          catalogResults.push({ status: 'fulfilled', value: result });
        } catch (error) {
          failedRequests++;
          catalogErrors.push({
            catalog: catalogName,
            message: error.message,
            status: error.response?.status,
          });
          catalogResults.push({ status: 'rejected', reason: error });
          console.error(`[useStudentFormData] Error al recargar ${catalogName}:`, error.message);
        }
        
        // Aumentar delay entre peticiones para evitar saturar el servidor
        // especialmente después de operaciones pesadas
        if (i < catalogUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de delay (aumentado de 50ms)
        }
      }

      const [
        carrerasRes,
        gestionesRes,
        paisesRes,
        departamentosRes,
        provinciasRes,
        municipiosRes,
        idiomasRes,
        tiposDiscapacidadRes,
        estadosCivilesRes,
        tiposParentescoRes,
        documentacionRes,
      ] = catalogResults.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return { data: { data: [] } };
        }
      });

      setCarreras(carrerasRes.data?.data || []);
      setGestiones(gestionesRes.data?.data || []);
      setPaises(paisesRes.data?.data || []);
      setDepartamentos(departamentosRes.data?.data || []);
      setProvincias(provinciasRes.data?.data || []);
      setMunicipios(municipiosRes.data?.data || []);
      setIdiomas(idiomasRes.data?.data || []);
      setTiposDiscapacidad(tiposDiscapacidadRes.data?.data || []);
      setEstadosCiviles(estadosCivilesRes.data?.data || []);
      setTiposParentesco(tiposParentescoRes.data?.data || []);
      setDocumentacionInscripcion(documentacionRes.data?.data || []);

      setStats({
        todayStudents: 5,
        monthStudents: 127,
        totalStudents: 1543,
      });

      // Mostrar resultado del refetch
      if (failedRequests > 0) {
        console.warn(`[useStudentFormData] ${failedRequests} de ${totalRequests} catálogos fallaron al recargar:`, catalogErrors);
        if (failedRequests === totalRequests) {
          setError('No se pudieron recargar los catálogos. Por favor, intenta nuevamente.');
        }
      }
    } catch (err) {
      console.error('[useStudentFormData] Error inesperado al recargar datos del formulario:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para cargar datos geográficos en cascada
  // Cuando se selecciona un departamento, cargar provincias de ese departamento
  // Cuando se selecciona una provincia, cargar municipios de esa provincia
  const loadProvincias = async (departamentoId) => {
    if (!departamentoId) {
      setProvincias([]);
      return;
    }
    
    try {
      const result = await apiClient.get(`/v1/catalogs/provincias?departamentoId=${departamentoId}`);
      const provinciasData = result.data?.data || [];
      setProvincias(provinciasData);
    } catch (error) {
      console.error('[useStudentFormData] Error al cargar provincias:', error);
      setProvincias([]);
    }
  };

  const loadMunicipios = async (provinciaId) => {
    if (!provinciaId) {
      setMunicipios([]);
      return;
    }
    
    try {
      const result = await apiClient.get(`/v1/catalogs/municipios?provinciaId=${provinciaId}`);
      const municipiosData = result.data?.data || [];
      setMunicipios(municipiosData);
    } catch (error) {
      console.error('[useStudentFormData] Error al cargar municipios:', error);
      setMunicipios([]);
    }
  };

  // loadDepartamentos se mantiene vacío porque los departamentos ya están cargados
  // y se filtran automáticamente por país (Bolivia) en FormField
  const loadDepartamentos = async (paisId) => {
    // No hacer nada, los departamentos ya están cargados y se filtran en FormField
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
    estadosCiviles,
    tiposParentesco,
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

