/**
 * Organismo: contenido del paso "Pago inicial" de Inscribir participante
 * (CAP). El paso solo existe cuando el curso cobra algo (curso o matrícula,
 * ver `useInscribirParticipantePage`) y el pago es siempre OPCIONAL: un
 * interruptor lo activa; apagado, la inscripción queda pendiente de pago.
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Flex, Switch, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from './PagoCapacitacionFormFields';

const InscribirParticipanteSeccionPago = ({
  registrarPagoInicial,
  onTogglePagoInicial,
  errorCatalogos,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  reglasMetodo,
  saldosPorConcepto,
  conceptoOptions,
  onMetodoPagoChange,
  disabled = false,
}) => (
  <Flex vertical gap={allSpacing.marginSM}>
    <Flex align="center" gap={allSpacing.marginSM}>
      <Switch
        checked={registrarPagoInicial}
        onChange={onTogglePagoInicial}
        disabled={disabled}
        aria-label="Registrar un pago inicial"
      />
      <Typography.Text>Registrar un pago inicial ahora</Typography.Text>
    </Flex>

    {registrarPagoInicial ? (
      <>
        {errorCatalogos ? (
          <Alert
            type="error"
            showIcon
            title="No se pudieron cargar los catálogos de pago"
            description={errorCatalogos}
          />
        ) : null}
        <PagoCapacitacionFormFields
          metodosPago={metodosPago}
          cuentasPago={cuentasPago}
          loadingCatalogos={loadingCatalogos}
          reglasMetodo={reglasMetodo}
          saldosPorConcepto={saldosPorConcepto}
          conceptoOptions={conceptoOptions}
          onMetodoPagoChange={onMetodoPagoChange}
          disabled={disabled}
        />
      </>
    ) : (
      <Alert
        type="info"
        showIcon
        title="Sin pago inicial"
        description="La inscripción quedará pendiente: podrá registrar los pagos después desde la ficha."
      />
    )}
  </Flex>
);

export default InscribirParticipanteSeccionPago;
