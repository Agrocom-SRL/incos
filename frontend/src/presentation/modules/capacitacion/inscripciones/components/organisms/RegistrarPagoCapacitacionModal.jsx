/**
 * Organismo: modal "Registrar pago" de la ficha de inscripción (CAP).
 *
 * AntD 6 (`open`). Envuelve `PagoCapacitacionFormFields` en su propio Form;
 * la orquestación (reglas por método, submit, refetch) viene del hook de
 * pantalla vía props. Muestra error de catálogos si los hubo.
 */

import { Alert, Form, Modal } from 'antd';
import { allSpacing } from '@theme/tokens';
import PagoCapacitacionFormFields from '@capacitacion/inscripciones/components/organisms/PagoCapacitacionFormFields';

const RegistrarPagoCapacitacionModal = ({
  open = false,
  form,
  metodosPago,
  cuentasPago,
  loadingCatalogos,
  errorCatalogos,
  metodoPagoId,
  reglasMetodo,
  saldo,
  onMetodoPagoChange,
  guardando = false,
  onGuardar,
  onCancelar,
}) => {
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onGuardar?.(values);
    } catch {
      // Errores de validación: AntD ya marca los campos.
    }
  };

  return (
    <Modal
      open={open}
      title="Registrar pago"
      okText="Registrar pago"
      cancelText="Cancelar"
      confirmLoading={guardando}
      onOk={handleOk}
      onCancel={onCancelar}
      destroyOnHidden
    >
      {errorCatalogos ? (
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los catálogos de pago"
          description={errorCatalogos}
          style={{ marginBottom: allSpacing.marginSM }}
        />
      ) : null}
      <Form form={form} layout="vertical" disabled={guardando}>
        <PagoCapacitacionFormFields
          metodosPago={metodosPago}
          cuentasPago={cuentasPago}
          loadingCatalogos={loadingCatalogos}
          metodoPagoId={metodoPagoId}
          reglasMetodo={reglasMetodo}
          saldo={saldo}
          onMetodoPagoChange={onMetodoPagoChange}
          disabled={guardando}
        />
      </Form>
    </Modal>
  );
};

export default RegistrarPagoCapacitacionModal;
