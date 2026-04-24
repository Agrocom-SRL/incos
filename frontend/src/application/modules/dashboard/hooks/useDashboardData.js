/**
 * Hook: useDashboardData
 * Carga carreras (catálogo) y resumen del dashboard desde el API.
 */

import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { useCasesFactory } from '@container';

dayjs.extend(relativeTime);
dayjs.locale('es');

const buildImageUrl = (imagenRuta) => {
  if (!imagenRuta) {
    return null;
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${serverBaseUrl}${imagenRuta}`;
};

const mapCarreraToDashboard = (carreraBackend) => {
  if (!carreraBackend) {
    return null;
  }
  const imageUrl =
    carreraBackend.imagenUrl ||
    carreraBackend.imageUrl ||
    (carreraBackend.imagenRuta ? buildImageUrl(carreraBackend.imagenRuta) : null);

  return {
    id: carreraBackend.id,
    image: imageUrl,
    label: carreraBackend.nombre || carreraBackend.name || null,
    codigo: carreraBackend.codigo || null,
    colorHex: carreraBackend.colorHex || carreraBackend.color_hex || '#1890ff',
  };
};

const mapCarrerasToDashboard = (carrerasBackend) => {
  if (!carrerasBackend) {
    return [];
  }
  if (typeof carrerasBackend === 'object' && !Array.isArray(carrerasBackend)) {
    if (carrerasBackend.carreras && Array.isArray(carrerasBackend.carreras)) {
      return carrerasBackend.carreras.map(mapCarreraToDashboard).filter(Boolean);
    }
    if (carrerasBackend.data && Array.isArray(carrerasBackend.data)) {
      return carrerasBackend.data.map(mapCarreraToDashboard).filter(Boolean);
    }
    if (carrerasBackend.items && Array.isArray(carrerasBackend.items)) {
      return carrerasBackend.items.map(mapCarreraToDashboard).filter(Boolean);
    }
    return [];
  }
  if (Array.isArray(carrerasBackend)) {
    return carrerasBackend.map(mapCarreraToDashboard).filter(Boolean);
  }
  return [];
};

const mapActividad = (row) => {
  if (!row) return null;
  const ocurrido = row.ocurrido_en;
  return {
    linkPath: row.link_path || null,
    name: row.titulo || '—',
    action: row.detalle || '',
    timeAgo: ocurrido ? dayjs(ocurrido).fromNow() : null,
    avatarSeed: row.avatar_seed || `ACT-${row.artefacto_tipo}-${row.artefacto_id}`,
    artefactoTipo: row.artefacto_tipo || null,
  };
};

const mapDocente = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nombre_completo || '—',
    description: row.titulo_profesional || '',
    avatarSeed: row.avatar_seed || `DOCENTE-${row.id}`,
  };
};

const mapEstudiante = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nombre_completo || '—',
    description: row.codigo_estudiante ? `Código ${row.codigo_estudiante}` : '',
    avatarSeed: row.avatar_seed || `ESTUDIANTE-${row.id}`,
  };
};

export const useDashboardData = () => {
  const [carreras, setCarreras] = useState([]);
  const [ultimosDocentes, setUltimosDocentes] = useState([]);
  const [ultimosEstudiantes, setUltimosEstudiantes] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    monthOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (setLoadingState = true) => {
    if (setLoadingState) {
      setLoading(true);
      setError(null);
    }

    try {
      const obtenerTodasCarrerasUseCase = useCasesFactory.obtenerTodasCarreras();
      const obtenerDashboardResumen = useCasesFactory.obtenerDashboardResumen();

      const [carrerasResult, resumenResult] = await Promise.all([
        obtenerTodasCarrerasUseCase.ejecutar({
          params: { pagina: 1, limite: 10 },
        }),
        obtenerDashboardResumen.ejecutar({
          limite_actividades: 12,
          limite_ultimos_docentes: 10,
          limite_ultimos_estudiantes: 10,
        }),
      ]);

      if (carrerasResult.success) {
        setCarreras(mapCarrerasToDashboard(carrerasResult.data));
      } else {
        setCarreras([]);
      }

      if (resumenResult.success && resumenResult.data) {
        const d = resumenResult.data;
        const acts = Array.isArray(d.actividades) ? d.actividades.map(mapActividad).filter(Boolean) : [];
        setActividades(acts);
        setUltimosDocentes(
          Array.isArray(d.ultimosDocentes) ? d.ultimosDocentes.map(mapDocente).filter(Boolean) : []
        );
        setUltimosEstudiantes(
          Array.isArray(d.ultimosEstudiantes) ? d.ultimosEstudiantes.map(mapEstudiante).filter(Boolean) : []
        );
        const s = d.stats || {};
        setStats({
          todayOrders: Number(s.estudiantesRegistradosHoy ?? 0),
          monthOrders: Number(s.estudiantesRegistradosMes ?? 0),
        });
      } else {
        setActividades([]);
        setUltimosDocentes([]);
        setUltimosEstudiantes([]);
        setStats({ todayOrders: 0, monthOrders: 0 });
        if (resumenResult.error) {
          setError(typeof resumenResult.error === 'string' ? resumenResult.error : resumenResult.error?.message);
        }
      }
    } catch (err) {
      console.error('[useDashboardData]', err);
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    carreras,
    ultimosDocentes,
    ultimosEstudiantes,
    actividades,
    stats,
    loading,
    error,
    refetch,
  };
};
