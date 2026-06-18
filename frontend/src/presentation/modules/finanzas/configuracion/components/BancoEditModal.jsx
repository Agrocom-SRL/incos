/**
 * Organismo: modal de alta/edición de un BANCO autorizado
 * (Config. de pagos · Finanzas).
 *
 * Modal AntD6 (`open`) con form precargado en edición. Campos: código (req),
 * nombre (req), método de pago (opcional, del catálogo ya cargado) y activo
 * (switch). En alta el switch arranca activo. Recibe handlers ya mapeados; no
 * hace fetch. El permiso (CREAR/EDITAR) lo decide la página al abrir el modal.
 */

import { useEffect, useMemo } from 'react';
import { Form, Input, Modal, Select, Switch } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';

const BancoEditModal = ({ open, banco, metodos = [], saving, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();
  const esEdicion = Boolean(banco?.id);

  const metodoOptions = useMemo(
    () => metodos.map((metodo) => ({ value: metodo.id, label: metodo.nombre })),
    [metodos],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      codigo: banco?.codigo ?? '',
      nombre: banco?.nombre ?? '',
      metodoPagoId: banco?.metodoPagoId ?? undefined,
      activo: banco?.activo ?? true,
    });
  }, [open, banco, form]);

  const handleOk = () => form.submit();

  return (
    <Modal
      open={open}
      title={esEdicion ? 'Editar banco' : 'Agregar banco'}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={!saving}
      width={modalWidths.modalWidth}
    >
      <Form form={form} layout="vertical" onFinish={onGuardar}>
        <Form.Item
          name="codigo"
          label="Código"
          rules={[{ required: true, message: 'Ingrese el código del banco' }]}
        >
          <Input size="large" placeholder="Código del banco" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[{ required: true, message: 'Ingrese el nombre del banco' }]}
        >
          <Input size="large" placeholder="Nombre del banco" maxLength={150} />
        </Form.Item>

        <Form.Item name="metodoPagoId" label="Método de pago (opcional)">
          <Select
            size="large"
            allowClear
            placeholder="Asociar a un método de pago"
            options={metodoOptions}
          />
        </Form.Item>

        <Form.Item name="activo" label="Activo" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BancoEditModal;
