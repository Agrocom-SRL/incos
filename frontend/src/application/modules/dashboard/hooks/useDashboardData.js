/**
 * Hook personalizado: useDashboardData
 * 
 * Single Responsibility: Solo obtiene datos del dashboard
 * Propósito: Obtener datos necesarios para renderizar el dashboard
 * 
 * Este hook:
 * - Obtiene carreras del backend usando GetCarrerasUseCase (Domain Layer)
 * - Usa datos estáticos para docentes, actividades y stats (temporales)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository)
 * - El Use Case decide si usar entidad completa o datos simples según el caso
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository)
 */

import { useState, useEffect } from 'react';
import { useCasesFactory } from '@container';
import { STATIC_DASHBOARD_DATA } from '@api/services/staticData';

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
  const fetchDashboardData = async (setLoadingState = true) => {
    if (setLoadingState) {
      setLoading(true);
      setError(null);
    }

    try {
      // Preparar todas las peticiones asíncronas en paralelo
      // Usamos Promise.allSettled() para que si una falla, las otras continúen
      const getCarrerasUseCase = useCasesFactory.getCarreras();

      // Crear promesas para todas las peticiones asíncronas
      const promises = [
        // Petición de carreras
        getCarrerasUseCase.execute({
          onlyActive: true,
          simple: true
        }),
        // Aquí se pueden agregar más peticiones en el futuro:
        // getDocentesUseCase.execute({ destacados: true }),
        // getActividadesUseCase.execute({ limit: 10 }),
        // getStatsUseCase.execute(),
      ];

      // Ejecutar todas las peticiones en paralelo
      const results = await Promise.allSettled(promises);

      // Procesar resultados de carreras (índice 0)
      const carrerasResult = results[0];
      if (carrerasResult.status === 'fulfilled') {
        if (carrerasResult.value.success) {
          setCarreras(carrerasResult.value.data || []);
        } else {
          console.error('[useDashboardData] Error al cargar carreras:', carrerasResult.value.error);
          setCarreras([]);
        }
      } else {
        console.error('[useDashboardData] Error en promesa de carreras:', carrerasResult.reason);
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
  };

  // Efecto que se ejecuta solo una vez al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Función para recargar los datos del dashboard manualmente
   * 
   * Casos de uso:
   * - Cuando el usuario realiza una acción que requiere actualizar datos
   * - Después de crear/editar/eliminar una carrera (cuando se implemente)
   * - Cuando se necesita refrescar datos sin recargar la página completa
   * 
   * Reutiliza la misma lógica de carga inicial
   */
  const refetch = async () => {
    await fetchDashboardData(true);
  };

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

