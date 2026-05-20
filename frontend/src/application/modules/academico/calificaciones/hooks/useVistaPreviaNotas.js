/**
 * Vista previa de notas — cuota desde ajustes + cálculo en cliente.
 */

import { useEffect, useMemo, useState } from 'react';
import { calificacionesFakeApi } from '../fake-api/index.js';
import { calcularVistaPrevia } from '../utils/calcularVistaPrevia.js';

export const useVistaPreviaNotas = ({
  cursoId,
  abierto,
  estudiantes,
  evaluaciones,
}) => {
  const [cuota, setCuota] = useState({ teorico: 30, practico: 70, esOverride: false });
  const [isLoadingCuota, setIsLoadingCuota] = useState(false);
  const [errorCuota, setErrorCuota] = useState(null);

  useEffect(() => {
    if (!abierto || !cursoId) return;

    let cancelled = false;

    const cargar = async () => {
      setIsLoadingCuota(true);
      setErrorCuota(null);
      try {
        const data = await calificacionesFakeApi.obtenerAjustesCurso({ cursoId });
        if (!cancelled) setCuota(data.cuotaEfectiva);
      } catch (err) {
        if (!cancelled) setErrorCuota(err);
      } finally {
        if (!cancelled) setIsLoadingCuota(false);
      }
    };

    cargar();
    return () => {
      cancelled = true;
    };
  }, [abierto, cursoId]);

  const vistaPrevia = useMemo(
    () =>
      calcularVistaPrevia({
        estudiantes,
        evaluaciones,
        cuota,
      }),
    [estudiantes, evaluaciones, cuota],
  );

  return {
    ...vistaPrevia,
    isLoading: isLoadingCuota,
    error: errorCuota,
  };
};
