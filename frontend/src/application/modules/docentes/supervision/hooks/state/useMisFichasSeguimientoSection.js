/**
 * Hook de pantalla: tab "Supervisión" del portal del docente (DOC · ficha
 * propia, sin permiso nuevo — wrapper self sobre S5 `GET /mis-fichas`).
 *
 * Carga LAZY: solo dispara la petición la primera vez que `enabled` es true
 * (la tab pasa a activa), no en cada render de la ficha del docente. Expone
 * además la ficha seleccionada para el panel de lectura
 * (`FichaSeguimientoFichaView`, reutilizado del módulo DOC-SUPERVISION).
 */

import { useEffect, useMemo, useState } from 'react';
import { useMisFichasSeguimientoApi } from '@application-docentes/supervision/hooks/api/useMisFichasSeguimientoApi';

export const useMisFichasSeguimientoSection = ({ enabled = false } = {}) => {
  const { fichas, loading, error, cargado, cargar } = useMisFichasSeguimientoApi({
    autoFetch: false,
  });
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);

  useEffect(() => {
    if (enabled && !cargado && !loading) {
      cargar();
    }
  }, [enabled, cargado, loading, cargar]);

  const verFicha = (ficha) => setFichaSeleccionada(ficha);
  const cerrarFicha = () => setFichaSeleccionada(null);

  return useMemo(
    () => ({ fichas, loading, error, fichaSeleccionada, verFicha, cerrarFicha }),
    [fichas, loading, error, fichaSeleccionada],
  );
};
