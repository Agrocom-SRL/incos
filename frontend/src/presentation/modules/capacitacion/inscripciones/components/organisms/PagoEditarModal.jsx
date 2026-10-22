/**
 * Organismo: modal «Editar pago» (CAP · capacitacion.inscripcion EDITAR).
 *
 * Reutiliza `PagoCapacitacionFormFields` (concepto, monto, fecha, método, cuenta,
 * observaciones): el saldo mostrado por concepto ya descuenta el propio pago
 * (lo calcula el hook) y en curso externo solo se ofrece matrícula. No cambia el
 * número de recibo ni el comprobante. Errores del servidor dentro del modal.
 * Presentacional: `open` lo da `pago != null`.
 */

import { Alert, Form, Modal } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from './PagoCapacitacionFormFields';

const PagoEditarModal = ({
  pago = null,
  form,
  initialValues,
  guardando = false,
  error = null,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  errorCatalogos,
  reglasMetodo,
  saldosPorConcepto,
  conceptoOptions,
  cursoExterno = false,
  onMetodoPagoChange,
  onGuardar,
  onCancel,
}) => (
  <Modal
    open={Boolean(pago)}
    title={pago?.numeroRecibo ? `Editar pago · ${pago.numeroRecibo}` : 'Editar pago'}
    okText="Guardar cambios"
    cancelText="Cancelar"
    onOk={onGuardar}
    onCancel={onCancel}
    confirmLoading={guardando}
    maskClosable={!guardando}
    destroyOnHidden
    width={modalWidths.modalWidthLG}
  >
    <Form form={form} layout="vertical" initialValues={initialValues} disabled={guardando}>
      {error ? (
        <Alert
          type="error"
          showIcon
          title="No se pudo corregir el pago"
          description={error}
          style={{ marginBottom: allSpacing.marginSM }}
        />
      ) : null}
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
        fechaPorDefecto={false}
        onMetodoPagoChange={onMetodoPagoChange}
        disabled={guardando}
      />
    </Form>
  </Modal>
);

export default PagoEditarModal;
