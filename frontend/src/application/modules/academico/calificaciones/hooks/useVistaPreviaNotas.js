/**
 * Vista previa de notas — cuota y nota mínima desde política institucional (API).
 */

import { useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { calcularVistaPrevia } from '../utils/calcularVistaPrevia.js';
import { resolverNotaMinimaAprobacion } from '../utils/notaMinimaAprobacion.js';

export const useVistaPreviaNotas = ({
  cursoId,
  abierto,
  estudiantes,
  evaluaciones,
}) => {
  const [cuota, setCuota] = useState({ teorico: 30, practico: 70, esOverride: false });
  const [notaMinimaAprobacion, setNotaMinimaAprobacion] = useState(61);
  const [isLoadingCuota, setIsLoadingCuota] = useState(false);
  const [errorCuota, setErrorCuota] = useState(null);

  useEffect(() => {
    if (!abierto) return;

    let cancelled = false;

    const cargar = async () => {
      setIsLoadingCuota(true);
      setErrorCuota(null);
      try {
        const uc = useCasesFactory.obtenerPoliticaInstitucional();
        const result = await uc.ejecutar();
        if (cancelled) return;

        if (!result?.success) {
          setErrorCuota(new Error(result?.error || 'No se cargó la política'));
          setNotaMinimaAprobacion(resolverNotaMinimaAprobacion(null));
          return;
        }

        const politica = result.data?.politica ?? result.data;
        setNotaMinimaAprobacion(resolverNotaMinimaAprobacion(politica));
        setCuota({
          teorico: politica?.cuotaTeorico ?? 30,
          practico: politica?.cuotaPractico ?? 70,
          esOverride: false,
        });
      } catch (err) {
        if (!cancelled) {
          setErrorCuota(err);
          setNotaMinimaAprobacion(resolverNotaMinimaAprobacion(null));
        }
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
    notaMinimaAprobacion,
    isLoading: isLoadingCuota,
    error: errorCuota,
  };
};
