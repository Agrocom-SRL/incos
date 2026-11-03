/**
 * Organismo: modal para crear una etapa adicional del calendario (periodo OTRO).
 * Nombre + rango de fechas + color. Devuelve el payload listo para el backend.
 */

import { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, ColorPicker } from 'antd';

const { RangePicker } = DatePicker;

const EtapaFormModal = ({ open, onCancel, onSubmit, confirmLoading = false }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    // Validación fallida: los errores ya se muestran en el formulario; no propagar el rechazo.
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const [ini, fin] = values.rango ?? [];
    const color = values.colorHex;
    const hex =
      typeof color === 'string' ? color : color?.toHexString ? color.toHexString() : null;
    const ok = await onSubmit({
      nombre: values.nombre.trim(),
      fechaInicio: ini.format('YYYY-MM-DD'),
      fechaFin: fin.format('YYYY-MM-DD'),
      colorHex: hex || null,
    });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Nueva etapa"
      okText="Crear etapa"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ colorHex: '#10b981' }}>
        <Form.Item
          name="nombre"
          label="Nombre de la etapa"
          rules={[{ required: true, message: 'Indique un nombre.' }]}
        >
          <Input placeholder="Ej. Receso de invierno" maxLength={100} />
        </Form.Item>
        <Form.Item
          name="rango"
          label="Fechas (inicio – fin)"
          rules={[{ required: true, message: 'Seleccione el rango de fechas.' }]}
        >
          <RangePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder={['Inicio', 'Fin']} />
        </Form.Item>
        <Form.Item name="colorHex" label="Color">
          <ColorPicker format="hex" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EtapaFormModal;
