/**
 * Hook personalizado: useDashboardData
 * 
 * Single Responsibility: Solo obtiene datos del dashboard
 * Propósito: Obtener datos necesarios para renderizar el dashboard
 * 
 * Este hook:
 * - Obtiene carreras desde el endpoint /api/v1/carreras usando GetTodasCarrerasUseCase
 * - Usa datos estáticos para docentes, actividades y stats (temporales)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository)
 */

import { useState, useEffect, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { STATIC_DASHBOARD_DATA } from '@api/services/staticData';

/**
 * Construye la URL completa de una imagen desde la ruta relativa del backend
 * 
 * @param {string} imagenRuta - Ruta relativa de la imagen (ej: "/uploads/carreras/imagenes/2/2_ADM-EMP.webp")
 * @returns {string|null} - URL completa de la imagen o null si no hay ruta
 */
const buildImageUrl = (imagenRuta) => {
  if (!imagenRuta) {
    return null;
  }

  // Obtener la URL base del API (ej: "http://localhost:3000/api")
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  // Extraer la URL base del servidor (sin /api)
  // Si apiBaseUrl es "http://localhost:3000/api", el servidor base es "http://localhost:3000"
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  
  // Construir la URL completa: servidor base + ruta de imagen
  // La ruta ya incluye el "/" inicial, así que solo concatenamos
  return `${serverBaseUrl}${imagenRuta}`;
};

/**
 * Mapea una carrera del backend al formato esperado por el dashboard
 * 
 * El backend devuelve datos con propiedades en español:
 * - nombre, imagenRuta, imagenUrl (puede ser null)
 * 
 * @param {Object} carreraBackend - Carrera desde el backend
 * @returns {Object} - Carrera mapeada para el dashboard { id, image, label }
 */
const mapCarreraToDashboard = (carreraBackend) => {
  if (!carreraBackend) {
    return null;
  }

  // El backend devuelve: { id, nombre, imagenRuta, imagenUrl, ... }
  // Priorizamos imagenUrl si existe, sino usamos imagenRuta para construir la URL
  const imageUrl = carreraBackend.imagenUrl 
    || carreraBackend.imageUrl 
    || (carreraBackend.imagenRuta ? buildImageUrl(carreraBackend.imagenRuta) : null);

  // Mapeamos a: { id, image, label, codigo, colorHex } para tarjetas con imagen y fallback
  return {
    id: carreraBackend.id,
    image: imageUrl,
    label: carreraBackend.nombre || carreraBackend.name || null,
    codigo: carreraBackend.codigo || null,
    colorHex: carreraBackend.colorHex || carreraBackend.color_hex || '#1890ff',
  };
};

/**
 * Mapea un array de carreras del backend al formato del dashboard
 * 
 * @param {Array|Object} carrerasBackend - Array de carreras o objeto con datos desde el backend
 * @returns {Array} - Array de carreras mapeadas para el dashboard
 */
const mapCarrerasToDashboard = (carrerasBackend) => {
  // Si es null o undefined, retornar array vacío
  if (!carrerasBackend) {
    return [];
  }

  // Si es un objeto con una propiedad que contiene el array (paginación)
  if (typeof carrerasBackend === 'object' && !Array.isArray(carrerasBackend)) {
    // Intentar encontrar el array en propiedades comunes
    if (carrerasBackend.carreras && Array.isArray(carrerasBackend.carreras)) {
      return carrerasBackend.carreras.map(mapCarreraToDashboard).filter(Boolean);
    }
    if (carrerasBackend.data && Array.isArray(carrerasBackend.data)) {
      return carrerasBackend.data.map(mapCarreraToDashboard).filter(Boolean);
    }
    if (carrerasBackend.items && Array.isArray(carrerasBackend.items)) {
      return carrerasBackend.items.map(mapCarreraToDashboard).filter(Boolean);
    }
    // Si no es un array, retornar vacío
    return [];
  }

  // Si es un array, mapear directamente
  if (Array.isArray(carrerasBackend)) {
    return carrerasBackend.map(mapCarreraToDashboard).filter(Boolean);
  }

  return [];
};

export const useDashboardData = () => {
  const [carreras, setCarreras] = useState([]);
  const [docentesDestacados, setDocentesDestacados] = useState([]);
  const [docentesPrincipales, setDocentesPrincipales] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    monthOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Función centralizada para cargar datos del dashboard
   * Se reutiliza tanto en el efecto inicial como en refetch
   * 
   * @param {boolean} setLoadingState - Si es true, actualiza el estado de loading
   */
  const fetchDashboardData = useCallback(async (setLoadingState = true) => {
    if (setLoadingState) {
      setLoading(true);
      setError(null);
    }

    try {
      // Obtener carreras desde el endpoint usando el Use Case
      // El backend filtra automáticamente por activo = true por defecto
      const obtenerTodasCarrerasUseCase = useCasesFactory.obtenerTodasCarreras();
      const carrerasResult = await obtenerTodasCarrerasUseCase.ejecutar({
        params: {
          limite: 10, // Limitar a 10 carreras para el dashboard
        },
      });

      // Si hay error al obtener carreras, manejarlo pero no bloquear el resto de datos
      if (carrerasResult.success) {
        // Debug: Log para ver qué estructura tiene la respuesta
        console.log('[useDashboardData] Carreras recibidas:', carrerasResult.data);
        
        const carrerasMapeadas = mapCarrerasToDashboard(carrerasResult.data);
        
        // Debug: Log para ver qué se mapeó
        console.log('[useDashboardData] Carreras mapeadas:', carrerasMapeadas);
        
        setCarreras(carrerasMapeadas);
      } else {
        // Si falla, dejar carreras vacío pero continuar con el resto
        console.warn('[useDashboardData] Error al cargar carreras:', carrerasResult.error);
        setCarreras([]);
      }

      // Datos estáticos (temporales hasta que se implementen endpoints)
      // Estos no requieren await, se asignan directamente
      setDocentesDestacados(STATIC_DASHBOARD_DATA.docentesDestacados);
      setDocentesPrincipales(STATIC_DASHBOARD_DATA.docentesPrincipales);
      setActividades(STATIC_DASHBOARD_DATA.actividades);
      setStats(STATIC_DASHBOARD_DATA.stats);

    } catch (error) {
      console.error('[useDashboardData] Error general:', error);
      setError(error.message || 'Error al cargar datos del dashboard');
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  // Efecto que se ejecuta solo una vez al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Función para recargar los datos del dashboard manualmente
   * 
   * Casos de uso:
   * - Cuando el usuario realiza una acción que requiere actualizar datos
   * - Cuando se necesita refrescar datos sin recargar la página completa
   * 
   * Reutiliza la misma lógica de carga inicial
   */
  const refetch = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    carreras,
    docentesDestacados,
    docentesPrincipales,
    actividades,
    stats,
    loading,
    error,
    refetch,
  };
};

