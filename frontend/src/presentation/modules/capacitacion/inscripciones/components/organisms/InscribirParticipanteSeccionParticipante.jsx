/**
 * Organismo: contenido del paso "Participante" de Inscribir participante
 * (CAP). Alterna entre el buscador de participantes existentes y el
 * formulario de datos mínimos de un participante nuevo, según
 * `modoParticipante` (`MODO_PARTICIPANTE` de `useInscribirParticipantePage`).
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { MODO_PARTICIPANTE } from '@application-capacitacion/inscripciones/hooks/state/useInscribirParticipantePage';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';
import ParticipanteSelector from './ParticipanteSelector';

const InscribirParticipanteSeccionParticipante = ({
  modoParticipante,
  participantes,
  loadingBusqueda,
  errorBusqueda,
  searchAttempted,
  onBuscarParticipantes,
  participanteSeleccionado,
  onSeleccionarParticipante,
  onCambiarParticipante,
  disabled = false,
}) => {
  if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE) {
    return (
      <ParticipanteSelector
        participantes={participantes}
        loading={loadingBusqueda}
        error={errorBusqueda}
        onBuscar={onBuscarParticipantes}
        searchAttempted={searchAttempted}
        participanteSeleccionado={participanteSeleccionado}
        onSeleccionar={onSeleccionarParticipante}
        onCambiar={onCambiarParticipante}
      />
    );
  }

  return <ParticipanteFormFields disabled={disabled} />;
};

export default InscribirParticipanteSeccionParticipante;
