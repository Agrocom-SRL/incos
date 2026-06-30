/**
 * Hook: useDashboardData
 * Carga el resumen del dashboard (catálogo referencia — permiso 105).
 * Carreras, docentes y estudiantes son solo lectura en panel; el detalle exige permisos de módulo.
 */

import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { useCasesFactory } from '@container';
import { useAuth } from '@application-auth';

/** Permiso seed 54 id 78 — ABM / listado administrativo de carreras. */
export const PERMISO_CARRERAS_DETALLE = 'configuracion.carrera';
export const PERMISO_DOCENTES_DETALLE = 'docentes.ver';
export const PERMISO_ESTUDIANTES_DETALLE = 'matricula.admision.ver';

dayjs.extend(relativeTime);
dayjs.locale('es');

export const buildImageUrl = (imagenRuta) => {
  if (!imagenRuta) {
    return null;
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${serverBaseUrl}${imagenRuta}`;
};

export const mapCarreraToDashboard = (carreraBackend) => {
  if (!carreraBackend) {
    return null;
  }
  const imagenRuta =
    carreraBackend.imagenRuta ??
    carreraBackend.imagen_ruta ??
    null;
  const imageUrl =
    carreraBackend.imagenUrl ||
    carreraBackend.imageUrl ||
    (imagenRuta ? buildImageUrl(imagenRuta) : null);

  return {
    id: carreraBackend.id,
    image: imageUrl,
    label: carreraBackend.nombre || carreraBackend.name || null,
    codigo: carreraBackend.codigo || null,
    colorHex:
      carreraBackend.colorHex || carreraBackend.color_hex || '#1890ff',
  };
};

export const mapActividad = (row) => {
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

export const mapDocente = (row) => {
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
  const { hasPermiso } = useAuth();
  const puedeVerDetalleCarreras = hasPermiso(PERMISO_CARRERAS_DETALLE, 'LISTAR');
  const puedeVerDetalleDocentes = hasPermiso(PERMISO_DOCENTES_DETALLE, 'LISTAR');
  const puedeVerDetalleEstudiantes = hasPermiso(PERMISO_ESTUDIANTES_DETALLE, 'LISTAR');

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
      const obtenerDashboardResumen = useCasesFactory.obtenerDashboardResumen();
      const resumenResult = await obtenerDashboardResumen.ejecutar({
        limite_actividades: 12,
        limite_ultimos_docentes: 10,
        limite_ultimos_estudiantes: 10,
        limite_carreras: 10,
      });

      if (resumenResult.success && resumenResult.data) {
        const d = resumenResult.data;
        const acts = Array.isArray(d.actividades)
          ? d.actividades.map(mapActividad).filter(Boolean)
          : [];
        setActividades(acts);
        setCarreras(
          Array.isArray(d.carreras)
            ? d.carreras.map(mapCarreraToDashboard).filter(Boolean)
            : [],
        );
        setUltimosDocentes(
          Array.isArray(d.ultimosDocentes)
            ? d.ultimosDocentes.map(mapDocente).filter(Boolean)
            : [],
        );
        setUltimosEstudiantes(
          Array.isArray(d.ultimosEstudiantes)
            ? d.ultimosEstudiantes.map(mapEstudiante).filter(Boolean)
            : [],
        );
        const s = d.stats || {};
        setStats({
          todayOrders: Number(s.estudiantesRegistradosHoy ?? 0),
          monthOrders: Number(s.estudiantesRegistradosMes ?? 0),
        });
      } else {
        setActividades([]);
        setCarreras([]);
        setUltimosDocentes([]);
        setUltimosEstudiantes([]);
        setStats({ todayOrders: 0, monthOrders: 0 });
        if (resumenResult.error) {
          setError(
            typeof resumenResult.error === 'string'
              ? resumenResult.error
              : resumenResult.error?.message,
          );
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
    puedeVerDetalleCarreras,
    puedeVerDetalleDocentes,
    puedeVerDetalleEstudiantes,
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
