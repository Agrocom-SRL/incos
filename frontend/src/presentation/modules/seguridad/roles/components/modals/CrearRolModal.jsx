import { Form, Input, Modal, Select } from 'antd';
import { TIPO_CONFIG } from '@modules/seguridad/roles/constants/rolTipoConfig.js';

const TIPO_OPTIONS = Object.entries(TIPO_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

/**
 * Alta de un rol nuevo (codigo + nombre + tipo opcional).
 * Mismo encuadre que EditarUsuarioModal: Form vertical dentro de Modal AntD 6.
 */
export default function CrearRolModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title="Nuevo rol"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Crear rol"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
      afterOpenChange={(opened) => {
        if (!opened) form.resetFields();
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="codigo"
          label="Código"
          tooltip="Identificador único en mayúsculas (A-Z, 0-9, guion bajo)."
          normalize={(value) => (value ? value.toUpperCase() : value)}
          rules={[
            { required: true, message: 'Ingrese el código del rol' },
            { max: 50, message: 'Máximo 50 caracteres' },
            {
              pattern: /^[A-Z0-9_]+$/,
              message: 'Solo mayúsculas, números y guion bajo',
            },
          ]}
        >
          <Input placeholder="EJ. COORDINADOR_ACADEMICO" autoFocus />
        </Form.Item>
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[
            { required: true, message: 'Ingrese el nombre del rol' },
            { max: 100, message: 'Máximo 100 caracteres' },
          ]}
        >
          <Input placeholder="Nombre visible del rol" />
        </Form.Item>
        <Form.Item name="tipo" label="Tipo (opcional)">
          <Select allowClear placeholder="Sin categoría" options={TIPO_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
