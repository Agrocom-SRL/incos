import { ActionButton } from '@atoms';
import OfertaParalelosCardsGrid from './OfertaParalelosCardsGrid';

/**
 * Vista operativa completa de paralelos (legacy / redirect).
 * Reutiliza la misma grilla de tarjetas que el tab de planes vigentes.
 */
const OfertaStepParalelosSection = ({
  loading,
  paralelosGestion,
  planSeleccionado,
  coberturaByParaleloId = {},
  onGenerarParalelos,
  onPasarTodosOfertado,
  onNavigateDetalle,
}) => (
  <OfertaParalelosCardsGrid
    loading={loading}
    paralelos={paralelosGestion}
    coberturaByParaleloId={coberturaByParaleloId}
    onNavigateDetalle={onNavigateDetalle}
    emptyDescription={
      planSeleccionado
        ? 'No hay paralelos de gestión. Genere paralelos desde plantillas del catálogo.'
        : 'Seleccione un plan habilitado en el paso anterior.'
    }
    toolbar={
      <>
        <ActionButton
          permiso="institucional.oferta.paralelo-gestion"
          accion="CREAR"
          onClick={onGenerarParalelos}
          disabled={!planSeleccionado}
        >
          Generar paralelos de gestión
        </ActionButton>
        <ActionButton
          permiso="institucional.oferta.paralelo-gestion"
          accion="EDITAR"
          onClick={onPasarTodosOfertado}
          disabled={!paralelosGestion.length}
        >
          Cambiar todos a OFERTADO
        </ActionButton>
      </>
    }
  />
);

export default OfertaStepParalelosSection;
