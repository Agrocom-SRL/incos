import { Form, Input, Modal, Radio, Select } from 'antd';

const ACCIONES = ['VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR'];

export default function AgregarOverrideModal({
  open,
  loading,
  permisoOptions = [],
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Agregar override"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Agregar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ tipo: 'GRANT' }}>
        <Form.Item name="permiso_id" label="Permiso" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={permisoOptions}
            placeholder="Seleccione permiso"
          />
        </Form.Item>
        <Form.Item name="accion" label="Acción" rules={[{ required: true }]}>
          <Select options={ACCIONES.map((a) => ({ value: a, label: a }))} />
        </Form.Item>
        <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="GRANT">GRANT (otorga)</Radio>
            <Radio value="REVOKE">REVOKE (revoca)</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="motivo" label="Motivo">
          <Input.TextArea rows={3} placeholder="Razón del override" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
