/**
 * Organismo: contenido del paso "Pago inicial" de Inscribir participante
 * (CAP). Este paso SOLO existe en el wizard cuando el curso elegido tiene
 * costo (`InscribirParticipantePage` omite el paso completo para cursos
 * gratuitos, ver `useInscribirParticipantePage`): el pago inicial es siempre
 * OBLIGATORIO aquí, ya no existe la opción de omitirlo. Recibe props ya
 * mapeadas del hook; no llama hooks de fetch.
 */

import { Alert } from 'antd';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from './PagoCapacitacionFormFields';

const InscribirParticipanteSeccionPago = ({
  errorCatalogos,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  metodoPagoId,
  reglasMetodo,
  costoCurso,
  onMetodoPagoChange,
  disabled = false,
}) => (
  <>
    {errorCatalogos ? (
      <Alert
        type="error"
        showIcon
        title="No se pudieron cargar los catálogos de pago"
        description={errorCatalogos}
        style={{ marginBottom: allSpacing.marginSM }}
      />
    ) : null}
    <PagoCapacitacionFormFields
      metodosPago={metodosPago}
      cuentasPago={cuentasPago}
      loadingCatalogos={loadingCatalogos}
      metodoPagoId={metodoPagoId}
      reglasMetodo={reglasMetodo}
      saldo={costoCurso}
      costoCurso={costoCurso}
      permiteCompromiso
      onMetodoPagoChange={onMetodoPagoChange}
      disabled={disabled}
    />
  </>
);

export default InscribirParticipanteSeccionPago;
