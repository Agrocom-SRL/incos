/**
 * Modal para habilitar una fecha especial de clase (taller/recuperación) — molécula.
 * Permite fecha futura. Envía { fecha, motivo, horaInicio?, horaFin? } al confirmar.
 */
import { DatePicker, Form, Input, Modal, TimePicker } from 'antd';

const FechaEspecialModal = ({ open, onClose, onConfirmar, confirmando }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onConfirmar({
      fecha: values.fecha?.format('YYYY-MM-DD'),
      motivo: values.motivo?.trim(),
      horaInicio: values.horaInicio?.format('HH:mm') ?? undefined,
      horaFin: values.horaFin?.format('HH:mm') ?? undefined,
    });
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      title="Habilitar fecha especial"
      okText="Habilitar"
      cancelText="Cancelar"
      confirmLoading={confirmando}
      onOk={handleOk}
      onCancel={onClose}
      forceRender
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" requiredMark="optional" className="asi-fecha-especial-form">
        <Form.Item
          name="fecha"
          label="Fecha de clase"
          rules={[{ required: true, message: 'Elegí la fecha de la sesión' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Seleccioná un día" />
        </Form.Item>
        <Form.Item
          name="motivo"
          label="Motivo"
          rules={[{ required: true, message: 'Indicá el motivo (taller, recuperación, …)' }]}
        >
          <Input maxLength={120} placeholder="Taller de recuperación" />
        </Form.Item>
        <Form.Item name="horaInicio" label="Hora inicio (opcional)">
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={5} placeholder="08:00" />
        </Form.Item>
        <Form.Item name="horaFin" label="Hora fin (opcional)">
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={5} placeholder="10:00" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FechaEspecialModal;
