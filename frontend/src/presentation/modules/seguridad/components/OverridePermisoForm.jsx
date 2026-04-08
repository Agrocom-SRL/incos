import { Form, Input, Select } from 'antd';

const ACCIONES = [
  'LISTAR',
  'DETALLE',
  'CREAR',
  'EDITAR',
  'ELIMINAR',
  'ACTIVAR',
  'APROBAR',
  'EXPORTAR',
  'GENERAR_PDF',
];
const TIPOS = ['GRANT', 'REVOKE'];

/**
 * Opciones planas para select de permiso: { value: permiso_id, label }
 */
export default function OverridePermisoForm({ form, permisoOptions = [] }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="permiso_id"
        label="Permiso"
        rules={[{ required: true, message: 'Seleccione permiso' }]}
      >
        <Select
          showSearch
          optionFilterProp="label"
          options={permisoOptions}
          placeholder="Permiso"
        />
      </Form.Item>
      <Form.Item
        name="accion"
        label="Acción"
        rules={[{ required: true, message: 'Requerido' }]}
      >
        <Select options={ACCIONES.map((a) => ({ value: a, label: a }))} />
      </Form.Item>
      <Form.Item
        name="tipo"
        label="Tipo"
        rules={[{ required: true, message: 'Requerido' }]}
      >
        <Select options={TIPOS.map((t) => ({ value: t, label: t }))} />
      </Form.Item>
      <Form.Item name="motivo" label="Motivo">
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
}
