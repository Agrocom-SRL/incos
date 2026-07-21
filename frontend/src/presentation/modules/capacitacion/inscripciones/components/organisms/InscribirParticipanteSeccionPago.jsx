/**
 * Organismo: contenido del paso "Pago inicial" de Inscribir participante
 * (CAP). Si `conPagoInicial` está activo muestra los campos del pago
 * (monto, fecha, método, cuenta); si no, informa que la inscripción
 * quedará sin pagos. Recibe props ya mapeadas del hook; no llama hooks
 * de fetch.
 */

import { Alert, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from './PagoCapacitacionFormFields';

const { Paragraph } = Typography;

const InscribirParticipanteSeccionPago = ({
  conPagoInicial,
  errorCatalogos,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  metodoPagoId,
  reglasMetodo,
  saldo,
  onMetodoPagoChange,
  disabled = false,
}) => {
  if (!conPagoInicial) {
    return (
      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
        La inscripción quedará con estado de pago «Sin pagos».
      </Paragraph>
    );
  }

  return (
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
        saldo={saldo}
        onMetodoPagoChange={onMetodoPagoChange}
        disabled={disabled}
      />
    </>
  );
};

export default InscribirParticipanteSeccionPago;
