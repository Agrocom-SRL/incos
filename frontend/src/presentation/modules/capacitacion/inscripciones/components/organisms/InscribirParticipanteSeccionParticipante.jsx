/**
 * Organismo: contenido del paso "Participante" de Inscribir participante
 * (CAP). Alterna, según `modoParticipante` (`MODO_PARTICIPANTE` de
 * `useInscribirParticipantePage`), entre:
 * - EXISTENTE: buscador a ancho completo + lista de filas (campos declarativos
 *   de `stepBuscarParticipante`, enriquecidos con los datos del hook), igual
 *   que el paso «Buscar estudiante» de Matrícula.
 * - NUEVO: formulario de datos mínimos del participante.
 * Ambos van en `FormWorkspaceSection` (título/descripción de la `section`).
 *
 * La búsqueda es en vivo (con debounce en el hook de API): el término vive en
 * el campo `buscarParticipante` del `Form` y se sincroniza con el hook; así el
 * texto sobrevive a cambiar de paso. Recibe props ya mapeadas del hook; no
 * llama hooks de fetch.
 */

import { useEffect, useMemo } from 'react';
import { Form } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import { MODO_PARTICIPANTE } from '@application-capacitacion/inscripciones/hooks/state/useInscribirParticipantePage';
import {
  CAMPO_BUSCAR_PARTICIPANTE,
  enrichBuscarParticipanteFields,
} from '@application-capacitacion/inscripciones/utils/enrichBuscarParticipanteFields';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';

const InscribirParticipanteSeccionParticipante = ({
  section = null,
  form,
  modoParticipante,
  participantes,
  loadingBusqueda,
  errorBusqueda,
  searchText,
  searchAttempted,
  onBuscarParticipantes,
  sugeridos,
  loadingSugeridos,
  participanteSeleccionado,
  onSeleccionarParticipante,
  disabled = false,
}) => {
  const esExistente = modoParticipante === MODO_PARTICIPANTE.EXISTENTE;
  const terminoTipeado = Form.useWatch(CAMPO_BUSCAR_PARTICIPANTE, form);

  // Búsqueda en vivo: cada cambio del campo dispara la búsqueda (debounce en el hook de API).
  useEffect(() => {
    if (!esExistente) return;
    const termino = String(terminoTipeado ?? '').trim();
    if (termino !== searchText) onBuscarParticipantes?.(termino);
  }, [esExistente, terminoTipeado, searchText, onBuscarParticipantes]);

  const fields = useMemo(
    () =>
      enrichBuscarParticipanteFields(section?.fields ?? [], {
        searchAttempted,
        searchText,
        participantes,
        loadingBusqueda,
        errorBusqueda,
        sugeridos,
        loadingSugeridos,
        participanteSeleccionado,
        onBuscar: onBuscarParticipantes,
        onSeleccionar: onSeleccionarParticipante,
      }),
    [
      section?.fields,
      searchAttempted,
      searchText,
      participantes,
      loadingBusqueda,
      errorBusqueda,
      sugeridos,
      loadingSugeridos,
      participanteSeleccionado,
      onBuscarParticipantes,
      onSeleccionarParticipante,
    ],
  );

  if (esExistente) {
    return (
      <FormWorkspaceSection
        title={section?.title}
        description={section?.description}
        fields={fields}
        form={form}
        resolveOptions={() => []}
        readOnly={false}
      />
    );
  }

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} form={form}>
      <ParticipanteFormFields disabled={disabled} />
    </FormWorkspaceSection>
  );
};

export default InscribirParticipanteSeccionParticipante;
