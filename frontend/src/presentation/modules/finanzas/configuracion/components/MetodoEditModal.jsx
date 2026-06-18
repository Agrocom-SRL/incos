/**
 * Organismo: modal de edición del NOMBRE de un método de pago
 * (Config. de pagos · Finanzas).
 *
 * Los 4 métodos son fijos (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): el código no se
 * edita; solo el nombre visible. El switch de activo vive en la tarjeta (toggle
 * directo). Modal AntD6 (`open`). Recibe handlers ya mapeados (no hace fetch).
 */

import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';

const MetodoEditModal = ({ open, metodo, saving, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && metodo) {
      form.setFieldsValue({ nombre: metodo.nombre });
    }
  }, [open, metodo, form]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onGuardar?.(metodo.id, { nombre: values.nombre?.trim() });
  };

  return (
    <Modal
      open={open}
      title={`Editar método${metodo?.codigo ? ` · ${metodo.codigo}` : ''}`}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={!saving}
      width={modalWidths.modalWidthSM}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="nombre"
          label="Nombre del método"
          rules={[{ required: true, message: 'Ingrese el nombre del método' }]}
        >
          <Input size="large" placeholder="Nombre visible del método" maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MetodoEditModal;
