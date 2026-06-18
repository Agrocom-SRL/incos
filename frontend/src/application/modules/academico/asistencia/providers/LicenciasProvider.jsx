/**
 * Provider: listado de licencias estudiantiles + decisión (aprobar/rechazar).
 * Delgado — ensambla los hooks de API (listar/decidir) y publica el contexto.
 *
 * `estadoFijo` bloquea el filtro a un estado (la bandeja de pendientes lo fija a PENDIENTE);
 * sin él, el listado general permite filtrar por estado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLicenciasListApi } from '@application-academico/asistencia/hooks/api/useLicenciasListApi.js';
import { useLicenciaDecidirApi } from '@application-academico/asistencia/hooks/api/useLicenciaDecidirApi.js';
import { useLicenciaEditarApi } from '@application-academico/asistencia/hooks/api/useLicenciaEditarApi.js';
import { useLicenciaCancelarApi } from '@application-academico/asistencia/hooks/api/useLicenciaCancelarApi.js';
import { LicenciasContext } from '@application-academico/asistencia/context/LicenciasContext.js';

export const LicenciasProvider = ({ estadoFijo, children }) => {
  const { licencias = [], loading, error, fetch: fetchLicencias } = useLicenciasListApi();
  const { decidirLicencia: decidirApi, loading: decidiendo } = useLicenciaDecidirApi();
  const { editarLicencia: editarApi, loading: editando } = useLicenciaEditarApi();
  const { cancelarLicencia: cancelarApi, loading: cancelando } = useLicenciaCancelarApi();

  const [estado, setEstado] = useState(estadoFijo ?? undefined);

  // Recarga ante cambio de filtro de estado (el backend filtra por query `estado`).
  useEffect(() => {
    fetchLicencias({ estado });
  }, [estado, fetchLicencias]);

  const refetch = useCallback(() => fetchLicencias({ estado }), [fetchLicencias, estado]);

  const decidir = useCallback(
    async (id, payload) => {
      const result = await decidirApi(id, payload);
      if (result.success) await refetch();
      return result;
    },
    [decidirApi, refetch],
  );

  const editar = useCallback(
    async (id, payload) => {
      const result = await editarApi(id, payload);
      if (result.success) await refetch();
      return result;
    },
    [editarApi, refetch],
  );

  const cancelar = useCallback(
    async (id, payload) => {
      const result = await cancelarApi(id, payload);
      if (result.success) await refetch();
      return result;
    },
    [cancelarApi, refetch],
  );

  const value = useMemo(
    () => ({
      licencias,
      loading,
      error,
      estado,
      setEstado,
      estadoBloqueado: estadoFijo != null,
      refetch,
      decidir,
      decidiendo,
      editar,
      editando,
      cancelar,
      cancelando,
    }),
    [
      licencias,
      loading,
      error,
      estado,
      estadoFijo,
      refetch,
      decidir,
      decidiendo,
      editar,
      editando,
      cancelar,
      cancelando,
    ],
  );

  return <LicenciasContext.Provider value={value}>{children}</LicenciasContext.Provider>;
};

export default LicenciasProvider;
