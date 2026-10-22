/**
 * Organismo: modal de confirmación «Eliminar pago» (CAP · capacitacion.inscripcion
 * EDITAR). Es DEFINITIVO: el pago desaparece del historial, deja de contar en totales,
 * saldos e ingresos y para rehacerlo hay que registrar un pago nuevo. Por auditoría el
 * sistema guarda el motivo (3 a 500 caracteres, obligatorio) y quién lo eliminó.
 * Presentacional: `open` lo da `pago != null`.
 */

import { Alert, Form, Input, Modal } from 'antd';
import { allSpacing } from '@theme/tokens';
import { formatBs } from '@application/utils/formatters';
import { formatConceptoPago } from '@application-capacitacion/utils/capacitacionCatalogos';
import {
  MOTIVO_ANULACION_MAX,
  validarMotivoAnulacion,
} from '@application-capacitacion/inscripciones/mappers/inscripcionEdicionMapper';

const PagoAnularModal = ({
  pago = null,
  form,
  anulando = false,
  error = null,
  onConfirmar,
  onCancel,
}) => (
  <Modal
    open={Boolean(pago)}
    title="Eliminar pago"
    okText="Eliminar pago"
    okButtonProps={{ danger: true }}
    cancelText="Cancelar"
    onOk={onConfirmar}
    onCancel={onCancel}
    confirmLoading={anulando}
    maskClosable={!anulando}
    destroyOnHidden
  >
    <Form form={form} layout="vertical" disabled={anulando}>
      <Alert
        type="warning"
        showIcon
        title="La eliminación es definitiva"
        description={`Se eliminará el pago${pago?.numeroRecibo ? ` ${pago.numeroRecibo}` : ''} de Bs ${formatBs(pago?.monto)} (${formatConceptoPago(pago?.concepto)}). Dejará de contar en el total pagado y los saldos, y no se puede revertir; para rehacerlo deberá registrar un pago nuevo.`}
        style={{ marginBottom: allSpacing.marginMD }}
      />
      {error ? (
        <Alert
          type="error"
          showIcon
          title="No se pudo eliminar el pago"
          description={error}
          style={{ marginBottom: allSpacing.marginMD }}
        />
      ) : null}
      <Form.Item
        name="motivo"
        label="Motivo de la eliminación"
        rules={[
          {
            validator: (_, value) => {
              const mensaje = validarMotivoAnulacion(value);
              return mensaje ? Promise.reject(new Error(mensaje)) : Promise.resolve();
            },
          },
        ]}
      >
        <Input.TextArea
          rows={3}
          maxLength={MOTIVO_ANULACION_MAX}
          showCount
          placeholder="Ej. Monto registrado por error"
        />
      </Form.Item>
    </Form>
  </Modal>
);

export default PagoAnularModal;
