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
import {
  STATIC_DOCENTES_DESTACADOS,
  STATIC_DOCENTES_PRINCIPALES,
  STATIC_ACTIVIDADES,
  STATIC_STATS,
} from '@api/services/dashboardStaticData';

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

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar carreras del backend usando Use Case (Domain Layer)
        // El Use Case maneja el mapeo y retorna datos simples para UI
        // Usamos el factory para obtener el Use Case con dependencias inyectadas
        const getCarrerasUseCase = useCasesFactory.getCarreras();
        const carrerasResult = await getCarrerasUseCase.execute({ 
          onlyActive: true, 
          simple: true // Retornar datos simples (sin entidad completa)
        });
        
        if (carrerasResult.success) {
          setCarreras(carrerasResult.data || []);
        } else {
          console.error('[useDashboardData] Error al cargar carreras:', carrerasResult.error);
          setCarreras([]);
        }

        // Datos estáticos (temporales hasta que se implementen endpoints)
        setDocentesDestacados(STATIC_DOCENTES_DESTACADOS);
        setDocentesPrincipales(STATIC_DOCENTES_PRINCIPALES);
        setActividades(STATIC_ACTIVIDADES);
        setStats(STATIC_STATS);

      } catch (error) {
        console.error('[useDashboardData] Error general:', error);
        setError(error.message || 'Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /**
   * Función para recargar los datos del dashboard
   */
  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Recargar carreras del backend usando Use Case (Domain Layer)
      const getCarrerasUseCase = useCasesFactory.getCarreras();
      const carrerasResult = await getCarrerasUseCase.execute({ 
        onlyActive: true, 
        simple: true 
      });
      
      if (carrerasResult.success) {
        setCarreras(carrerasResult.data || []);
      }

      // Datos estáticos (no necesitan recarga)
      // Se mantienen igual
    } catch (error) {
      console.error('[useDashboardData] Error en refetch:', error);
      setError(error.message || 'Error al recargar datos del dashboard');
    } finally {
      setLoading(false);
    }
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

