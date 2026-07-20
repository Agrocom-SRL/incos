/**
 * Organismo: buscador/selector de participante para inscribir (CAP).
 *
 * Lenguaje visual "config" de la landing de Historial académico
 * (`HistorialSelectorPage`/`historialSelectorColumns`): tabla `TableListView`
 * con su buscador nativo (`searchColSpan`, alineado a la derecha), sin tabs
 * por carrera. Siempre muestra la tabla (nunca una tarjeta de resumen
 * aparte): elegir una fila selecciona y avanza el wizard de inmediato (ver
 * `InscribirParticipantePage.handleSeleccionarYAvanzar`), y si el usuario
 * vuelve al paso 1 la fila ya elegida queda resaltada (`rowClassName`) para
 * que pueda confirmar o cambiarla con un clic, sin un botón "Cambiar" aparte.
 *
 * Dos fuentes de datos según haya búsqueda activa (`searchAttempted`):
 * - Sin búsqueda → landing con hasta 10 sugeridos sin inscripción vigente.
 * - Con búsqueda (≥2 caracteres) → resultados de `GET /participantes?search=`.
 *
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { useMemo } from 'react';
import { Alert } from 'antd';
import { TableListView } from '@organisms';
import { createParticipanteSelectorColumns } from '@capacitacion/inscripciones/config/participanteSelectorColumns.jsx';

const ParticipanteSelector = ({
  participantes = [],
  loading = false,
  error = null,
  onBuscar,
  searchText = '',
  searchAttempted = false,
  sugeridos = [],
  loadingSugeridos = false,
  participanteSeleccionado,
  onSeleccionar,
}) => {
  const columns = useMemo(
    () => createParticipanteSelectorColumns({ onSeleccionar }),
    [onSeleccionar],
  );

  const data = searchAttempted ? participantes : sugeridos;
  const tableLoading = searchAttempted ? loading : loadingSugeridos;
  const emptyText = searchAttempted
    ? 'No se encontraron participantes con esos datos. Use «Crear nuevo participante» arriba para registrarlo.'
    : 'No hay participantes sin inscripción activa para sugerir — use el buscador.';

  return (
    <>
      {error ? (
        <Alert
          type="error"
          showIcon
          title="No se pudieron buscar los participantes"
          description={error}
          style={{ marginBottom: 12 }}
        />
      ) : null}

      <TableListView
        embedded
        data={data}
        loading={tableLoading}
        columns={columns}
        rowKey={(record) => record.id}
        rowClassName={(record) =>
          record.id === participanteSeleccionado?.id
            ? 'participante-selector__row--selected'
            : ''
        }
        searchText={searchText}
        onSearchChange={(event) => onBuscar?.(event.target.value)}
        searchPlaceholder="Buscar por CI, nombre o celular (mín. 2 caracteres)…"
        searchColSpan={12}
        loadingTip={searchAttempted ? 'Buscando participantes...' : 'Cargando sugerencias...'}
        emptyText={emptyText}
      />
    </>
  );
};

export default ParticipanteSelector;
