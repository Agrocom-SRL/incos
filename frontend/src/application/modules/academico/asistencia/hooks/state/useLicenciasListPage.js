/**
 * Hook de página del listado de licencias estudiantiles (espejo de useDocentesListPage):
 * consume el contexto (carga + decisión), arma columnas, filtra por búsqueda en cliente y
 * orquesta el drawer único de detalle/decisión. La página solo renderiza (incos-frontend-module §3).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePermiso } from '@application-auth';
import { useLicenciasContext } from '@application-academico/asistencia/hooks/context/useLicenciasContext.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { LICENCIA_SOLICITAR_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { createLicenciasTableColumns } from '@academico/asistencia/config/licenciasTableColumns.jsx';

const coincideBusqueda = (licencia, q) => {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  return (licencia.estudianteNombre ?? '').toLowerCase().includes(term);
};

export const useLicenciasListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const puedeDecidir = usePermiso(ASISTENCIA_PERMISOS.licenciaAprobar, 'APROBAR');

  const {
    licencias = [],
    loading = false,
    error = null,
    estado,
    setEstado,
    estadoBloqueado = false,
    refetch,
    decidir,
    decidiendo = false,
    cancelar,
  } = useLicenciasContext();

  const [searchText, setSearchText] = useState('');

  // Drawer de detalle/decisión: { licencia, decisionInicial: 'APROBAR' | 'RECHAZAR' | null }.
  const [drawer, setDrawer] = useState(null);

  const licenciasFiltradas = useMemo(
    () => (licencias ?? []).filter((l) => coincideBusqueda(l, searchText)),
    [licencias, searchText],
  );

  const verLicencia = useCallback(
    (licencia, decisionInicial = null) => setDrawer({ licencia, decisionInicial }),
    [],
  );
  const cerrarDrawer = useCallback(() => setDrawer(null), []);

  // Editar: navega al formulario en modo edición (precarga la licencia PENDIENTE).
  const onEditar = useCallback(
    (licencia) =>
      navigate(LICENCIA_SOLICITAR_PATH, { state: { licenciaId: licencia.id, modo: 'editar' } }),
    [navigate],
  );

  // Cancelar: cambia el estado a CANCELADA (provider recarga). TableActions ya confirma.
  const onCancelar = useCallback(
    async (licencia) => {
      const result = await cancelar?.(licencia.id);
      if (result?.success) message.success('Licencia cancelada');
      else message.error(result?.error || 'No se pudo cancelar la licencia');
      return result;
    },
    [cancelar, message],
  );

  const confirmarDecision = useCallback(
    async (payload) => {
      if (!drawer?.licencia?.id) return { success: false };
      const result = await decidir(drawer.licencia.id, payload);
      if (result.success) setDrawer(null);
      return result;
    },
    [decidir, drawer],
  );

  const tableColumns = useMemo(
    () =>
      createLicenciasTableColumns({
        onVer: (licencia) => verLicencia(licencia),
        onEditar,
        onCancelar,
      }),
    [verLicencia, onEditar, onCancelar],
  );

  const handleSearchChange = useCallback((event) => setSearchText(event.target.value), []);

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
    handleSearchChange,
    // tabla
    tableColumns,
    // permiso de decisión (drawer)
    puedeDecidir,
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

export default useLicenciasListPage;
