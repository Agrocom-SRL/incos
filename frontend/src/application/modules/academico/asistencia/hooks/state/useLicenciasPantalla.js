/**
 * Estado de pantalla del listado/bandeja de licencias: filtrado en cliente + drawer único
 * de detalle/decisión. La acción "ver" (y los accesos rápidos aprobar/rechazar) abren el
 * LicenciaDecisionDrawer en la misma pantalla; ya NO se navega a una ficha aparte.
 * La carga/persistencia vive en LicenciasProvider (contexto); aquí solo orquesta la
 * interacción de la página (incos-frontend-module §3).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLicenciasContext } from '@application-academico/asistencia/hooks/context/useLicenciasContext.js';

const coincideBusqueda = (licencia, q) => {
  if (!q) return true;
  const term = q.trim().toLowerCase();
  if (!term) return true;
  return (licencia.estudianteNombre ?? '').toLowerCase().includes(term);
};

export const useLicenciasPantalla = () => {
  const {
    licencias,
    loading,
    error,
    estado,
    setEstado,
    estadoBloqueado,
    refetch,
    decidir,
    decidiendo,
  } = useLicenciasContext();

  const [searchText, setSearchText] = useState('');

  // Drawer de detalle/decisión: { licencia, decisionInicial: 'APROBAR' | 'RECHAZAR' | null }.
  const [drawer, setDrawer] = useState(null);

  const licenciasFiltradas = useMemo(
    () => (licencias ?? []).filter((l) => coincideBusqueda(l, searchText)),
    [licencias, searchText],
  );

  // decisionInicial posiciona el drawer directo en modo aprobar/rechazar (accesos rápidos de fila).
  const verLicencia = useCallback(
    (licencia, decisionInicial = null) => setDrawer({ licencia, decisionInicial }),
    [],
  );
  const cerrarDrawer = useCallback(() => setDrawer(null), []);

  const confirmarDecision = useCallback(
    async (payload) => {
      if (!drawer?.licencia?.id) return { success: false };
      const result = await decidir(drawer.licencia.id, payload);
      if (result.success) setDrawer(null);
      return result;
    },
    [decidir, drawer],
  );

  return {
    // datos
    licencias: licenciasFiltradas,
    loading,
    error,
    refetch,
    // filtros
    estado,
    setEstado,
    estadoBloqueado,
    searchText,
    setSearchText,
    // drawer detalle/decisión
    drawerAbierto: Boolean(drawer),
    licenciaActiva: drawer?.licencia ?? null,
    decisionInicial: drawer?.decisionInicial ?? null,
    verLicencia,
    cerrarDrawer,
    confirmarDecision,
    decidiendo,
  };
};

export default useLicenciasPantalla;
