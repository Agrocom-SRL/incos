/**
 * Modal: cancelar el proyecto de grado (TIT · T11 con destino CANCELADO,
 * proyecto·APROBAR). Extensión 2026-08-11, flujo separado del avance de
 * etapa (pedido explícito del usuario): cancelar es posible desde CUALQUIER
 * etapa vigente, no es "una etapa más" a elegir junto a la siguiente —
 * mezclarlo en `AprobarEtapaModal` le quitaba fluidez al flujo normal.
 *
 * Patrón `AnularActaDefensaModal`: un solo modal con motivo obligatorio y
 * botón de confirmación en danger, sin `Modal.confirm` adicional encima
 * (regla A5: la propia existencia del modal ya es la confirmación).
 */

import { Form, Input, Modal, Typography } from 'antd';
import { formatExplicacionTransicionProyecto } from '@application-titulacion/utils/titulacionPills';

const { TextArea } = Input;
const { Paragraph } = Typography;

const CancelarProyectoModal = ({ open, onCancel, onSubmit, saving = false }) => {
  const [form] = Form.useForm();

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onSubmit?.(values.motivo?.trim());
  };

  return (
    <Modal
      open={open}
      title="Cancelar proyecto de grado"
      okText="Sí, cancelar proyecto"
      okButtonProps={{ danger: true }}
      cancelText="Volver"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={!saving}
    >
      <Paragraph type="danger">{formatExplicacionTransicionProyecto('CANCELADO')}</Paragraph>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="motivo"
          label="Motivo de la cancelación"
          rules={[
            { required: true, message: 'Indique el motivo de la cancelación' },
            { min: 3, message: 'El motivo debe tener al menos 3 caracteres' },
            { max: 2000, message: 'El motivo no puede superar los 2000 caracteres' },
          ]}
        >
          <TextArea
            rows={4}
            maxLength={2000}
            showCount
            placeholder="Explique por qué se cancela este proyecto de grado"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CancelarProyectoModal;
