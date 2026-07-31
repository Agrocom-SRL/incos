/**
 * Hook de API: catálogo de modalidades de grado (módulo TIT · T2).
 *
 * Carga una sola vez al montar (catálogo pequeño y estable). `dataKey`
 * ('modalidadesGrado') coincide con el `dataFieldName` del backend
 * (ListModalidadesGradoUseCase). Expone además las opciones del select del
 * formulario y un índice por id para resolver el código (grupalidad PSP).
 */

import { useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapModalidadesGradoList } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato T2). */
export const MODALIDADES_GRADO_DATA_KEY = 'modalidadesGrado';

export const useModalidadesGradoApi = () => {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const result = await proyectoGradoRepository.obtenerModalidades();
      if (!activo) return;
      if (result?.success) {
        const raw = result.data?.[MODALIDADES_GRADO_DATA_KEY] ?? result.data;
        setModalidades(mapModalidadesGradoList(raw));
        setError(null);
      } else {
        setModalidades([]);
        setError(result?.error || 'No se pudo cargar el catálogo de modalidades');
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  const options = useMemo(
    () =>
      modalidades.map((m) => ({
        value: m.id,
        label: m.codigo ? `${m.codigo} · ${m.nombre}` : m.nombre,
      })),
    [modalidades],
  );

  const modalidadById = useMemo(() => {
    const map = {};
    for (const m of modalidades) map[m.id] = m;
    return map;
  }, [modalidades]);

  return useMemo(
    () => ({ modalidades, options, modalidadById, loading, error }),
    [modalidades, options, modalidadById, loading, error],
  );
};
