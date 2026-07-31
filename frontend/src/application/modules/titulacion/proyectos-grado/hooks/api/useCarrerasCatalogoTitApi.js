/**
 * Hook de API: catálogo de carreras para el formulario de proyecto (módulo TIT).
 *
 * REUTILIZA el listado existente `GET /carreras` (no se crean catálogos
 * nuevos). Degrada con gracia si el rol no tiene el permiso del catálogo
 * (mismo criterio que `useAulasCatalogoCapApi`).
 */

import { useEffect, useMemo, useState } from 'react';
import carreraRepository from '@implementations/CarreraRepository';

const mapCarreraOption = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const codigo = raw.codigo ?? null;
  const nombre = raw.nombre ?? null;
  return {
    value: raw.id,
    label: [codigo, nombre].filter(Boolean).join(' · ') || `Carrera ${raw.id}`,
  };
};

export const useCarrerasCatalogoTitApi = () => {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      const result = await carreraRepository.obtenerTodos();
      if (!activo) return;
      const raw = result?.success ? (result.data?.carreras ?? result.data) : null;
      if (result?.success && Array.isArray(raw)) {
        setCarreras(raw.map(mapCarreraOption).filter(Boolean));
        setDisponible(true);
      } else {
        setCarreras([]);
        setDisponible(false);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  return useMemo(
    () => ({ carreras, loading, disponible }),
    [carreras, loading, disponible],
  );
};
