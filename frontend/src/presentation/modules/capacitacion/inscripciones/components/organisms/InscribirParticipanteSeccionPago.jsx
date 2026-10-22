/**
 * Organismo: contenido del paso "Pago inicial" de Inscribir participante
 * (CAP). El paso solo existe cuando el curso cobra algo (curso o matrícula,
 * ver `useInscribirParticipantePage`) y el pago es siempre OPCIONAL: un
 * interruptor lo activa; apagado, la inscripción queda pendiente de pago.
 *
 * El interruptor se presenta como un campo etiquetado más del formulario
 * (`Form.Item` + texto secundario debajo): lo informativo NO usa Alert; los
 * Alerts quedan solo para errores (catálogos de pago). Va envuelto en
 * `FormWorkspaceSection`. Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Flex, Form, Switch, Typography } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from './PagoCapacitacionFormFields';

const AYUDA_SIN_PAGO =
  'Sin pago inicial: la inscripción quedará pendiente y podrá registrar los pagos después desde la ficha.';
const AYUDA_CON_PAGO =
  'Complete los datos del pago. El comprobante de depósito se adjunta después desde la ficha.';

const InscribirParticipanteSeccionPago = ({
  section = null,
  form,
  registrarPagoInicial,
  onTogglePagoInicial,
  errorCatalogos,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  reglasMetodo,
  saldosPorConcepto,
  conceptoOptions,
  cursoExterno = false,
  onMetodoPagoChange,
  disabled = false,
}) => (
  <FormWorkspaceSection title={section?.title} description={section?.description} form={form}>
    <Form.Item label="Registrar un pago inicial ahora">
      <Flex vertical align="flex-start" gap={allSpacing.marginXS}>
        <Switch
          checked={registrarPagoInicial}
          onChange={onTogglePagoInicial}
          disabled={disabled}
          aria-label="Registrar un pago inicial"
        />
        <Typography.Text type="secondary">
          {registrarPagoInicial ? AYUDA_CON_PAGO : AYUDA_SIN_PAGO}
        </Typography.Text>
      </Flex>
    </Form.Item>

    {registrarPagoInicial ? (
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
          reglasMetodo={reglasMetodo}
          saldosPorConcepto={saldosPorConcepto}
          conceptoOptions={conceptoOptions}
          cursoExterno={cursoExterno}
          onMetodoPagoChange={onMetodoPagoChange}
          disabled={disabled}
        />
      </>
    ) : null}
  </FormWorkspaceSection>
);

export default InscribirParticipanteSeccionPago;
