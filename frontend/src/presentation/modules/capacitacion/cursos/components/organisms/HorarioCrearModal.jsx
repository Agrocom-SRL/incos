/**
 * Organismo: modal «Crear horario» (segundo modal del selector de horarios del
 * curso, CAP). Reutiliza los campos del ABM de horarios (`HorarioFormFields`:
 * día, hora inicio y hora fin con la misma validación) dentro
 * de un `Form` propio; al confirmar delega en `onCrear(values)` (POST al
 * catálogo) y muestra el error devuelto sin cerrar. Presentacional.
 */

import { Alert, Form, Modal } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';
import { allSpacing } from '@theme/tokens';
import HorarioFormFields from '@capacitacion/grupos/components/organisms/HorarioFormFields';

const HorarioCrearModal = ({ open, creando = false, error = null, onCrear, onCancel }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const result = await onCrear?.(values);
    if (result?.success) form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Crear horario"
      okText="Crear horario"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={creando}
      maskClosable={!creando}
      destroyOnHidden
      width={modalWidths.modalWidth}
    >
      <Form form={form} layout="vertical" disabled={creando}>
        {error ? (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: allSpacing.marginSM }}
          />
        ) : null}
        <HorarioFormFields disabled={creando} multipleDias />
      </Form>
    </Modal>
  );
};

export default HorarioCrearModal;
