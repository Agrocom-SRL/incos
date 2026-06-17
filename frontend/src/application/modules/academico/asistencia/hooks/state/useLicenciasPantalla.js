/**
 * Estado de pantalla del listado/bandeja de licencias: filtrado en cliente + Modal de decisión.
 * El detalle ya NO es un drawer: la acción "ver" navega a la ficha (ACA-ASI-LIC-DET). La
 * carga/persistencia vive en LicenciasProvider (contexto); aquí solo orquesta la interacción
 * de la página (incos-frontend-module §3).
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

  // Modal de decisión: { licencia, decision: 'APROBAR' | 'RECHAZAR' }.
  const [decisionContext, setDecisionContext] = useState(null);

  const licenciasFiltradas = useMemo(
    () => (licencias ?? []).filter((l) => coincideBusqueda(l, searchText)),
    [licencias, searchText],
  );

  const abrirDecision = useCallback(
    (licencia, decision) => setDecisionContext({ licencia, decision }),
    [],
  );
  const cerrarDecision = useCallback(() => setDecisionContext(null), []);

  const confirmarDecision = useCallback(
    async (payload) => {
      if (!decisionContext?.licencia?.id) return { success: false };
      const result = await decidir(decisionContext.licencia.id, payload);
      if (result.success) setDecisionContext(null);
      return result;
    },
    [decidir, decisionContext],
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
    // decisión
    decisionContext,
    abrirDecision,
    cerrarDecision,
    confirmarDecision,
    decidiendo,
  };
};

export default useLicenciasPantalla;
