/**
 * Hook de pantalla: listado de participantes (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage`: columnas, breadcrumb, búsqueda y el modal de
 * alta/edición (el recurso no tiene página de detalle propia — LISTAR/CREAR/
 * EDITAR viven en esta pantalla; sin ELIMINAR por seed 65).
 */

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useParticipantesListContext } from '@application-capacitacion/participantes/hooks/context/useParticipantesListContext';
import { mapFormValuesToParticipantePayload } from '@application-capacitacion/participantes/mappers/participanteMapper';
import { createParticipantesTableColumns } from '@capacitacion/participantes/config/participantesTableColumns';

const DURACION_MENSAJE_ERROR = 8;

export const useParticipantesListPage = () => {
  const { message } = App.useApp();

  const {
    participantes = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    saving,
    guardarParticipante,
  } = useParticipantesListContext();

  /** Participante en edición (objeto) | null (modal cerrado) | 'nuevo' (alta). */
  const [participanteEnEdicion, setParticipanteEnEdicion] = useState(null);

  const abrirNuevo = useCallback(() => setParticipanteEnEdicion('nuevo'), []);
  const abrirEditar = useCallback((record) => setParticipanteEnEdicion(record), []);
  const cerrarModal = useCallback(() => setParticipanteEnEdicion(null), []);

  const isEditando = participanteEnEdicion !== null && participanteEnEdicion !== 'nuevo';

  /** Submit del modal: UPSERT (POST/PUT) + feedback + recarga del listado. */
  const guardarDesdeModal = useCallback(
    async (values) => {
      const payload = mapFormValuesToParticipantePayload(values);
      const id = isEditando ? participanteEnEdicion.id : null;
      const result = await guardarParticipante({ id, payload });
      if (!result?.success) {
        message.error(
          result?.error || 'No se pudo guardar el participante',
          DURACION_MENSAJE_ERROR,
        );
        return;
      }
      message.success(id != null ? 'Participante actualizado' : 'Participante registrado');
      setParticipanteEnEdicion(null);
      await refetch();
    },
    [isEditando, participanteEnEdicion, guardarParticipante, message, refetch],
  );

  const tableColumns = useMemo(
    () => createParticipantesTableColumns({ onEditar: abrirEditar }),
    [abrirEditar],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Capacitación' }, { title: 'Participantes' }],
    [],
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    participantes,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleSearchChange,
    tablePagination,
    // Modal de alta/edición
    participanteEnEdicion,
    isEditando,
    abrirNuevo,
    cerrarModal,
    guardarDesdeModal,
    saving,
  };
};
