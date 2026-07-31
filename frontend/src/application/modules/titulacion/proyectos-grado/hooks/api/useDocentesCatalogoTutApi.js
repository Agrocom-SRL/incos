/**
 * Hook de API: catálogo de docentes para el select de tutor (módulo TUT).
 *
 * REUTILIZA el listado existente `GET /docentes` (catálogo del plan: no se
 * crean catálogos nuevos). Ese endpoint está protegido por permisos del
 * dominio DOC que no todos los roles TUT tienen: la carga DEGRADA con gracia
 * (`disponible=false`) sin bloquear la pantalla — mismo criterio que
 * `useAulasCatalogoCapApi` (CAP).
 *
 * Etiquetas en orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
 * (buildFullName).
 */

import { useEffect, useMemo, useState } from 'react';
import docenteRepository from '@implementations/DocenteRepository';
import { buildFullName } from '@application/utils/formatters';

const mapDocenteOption = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const nombre =
    raw.nombreCompleto ||
    buildFullName(raw.nombres, raw.apellidoPaterno, raw.apellidoMaterno) ||
    `Docente ${raw.id}`;
  return { value: raw.id, label: nombre };
};

export const useDocentesCatalogoTutApi = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      const result = await docenteRepository.obtenerTodos({ params: { limit: 500 } });
      if (!activo) return;
      const raw = result?.success ? (result.data?.docentes ?? result.data) : null;
      if (result?.success && Array.isArray(raw)) {
        setDocentes(raw.map(mapDocenteOption).filter(Boolean));
        setDisponible(true);
      } else {
        // Sin permiso DOC (403) u otro error: select deshabilitado, sin bloquear.
        setDocentes([]);
        setDisponible(false);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  return useMemo(
    () => ({ docentes, loading, disponible }),
    [docentes, loading, disponible],
  );
};
