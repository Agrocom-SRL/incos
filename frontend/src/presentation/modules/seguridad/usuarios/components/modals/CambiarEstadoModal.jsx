import { Form, Input, Modal, Select } from 'antd';

const ESTADOS = [
  { value: '__ACTIVO__', label: 'Activo' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'RETIRADO', label: 'Retirado' },
];

export default function CambiarEstadoModal({ open, loading, initialValues, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      estado: values.estado === '__ACTIVO__' || values.estado == null ? null : values.estado,
      motivo: values.motivo || null,
    });
  };

  return (
    <Modal
      title="Cambiar estado"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Aplicar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
      afterOpenChange={(opened) => {
        if (opened) {
          const nextValues = initialValues || {};
          form.setFieldsValue({
            ...nextValues,
            estado: nextValues.estado ?? '__ACTIVO__',
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...(initialValues || {}), estado: initialValues?.estado ?? '__ACTIVO__' }}
      >
        <Form.Item name="estado" label="Estado">
          <Select allowClear placeholder="Activo" options={ESTADOS} />
        </Form.Item>
        <Form.Item
          shouldUpdate
          noStyle
        >
          {() => {
            const estado = form.getFieldValue('estado');
            return (
              <Form.Item
                name="motivo"
                label="Motivo"
                rules={estado ? [{ required: true, message: 'El motivo es obligatorio' }] : []}
              >
                <Input.TextArea rows={3} placeholder="Motivo del cambio de estado" />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
