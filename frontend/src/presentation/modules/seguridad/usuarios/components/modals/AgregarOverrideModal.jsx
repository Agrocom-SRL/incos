import { Alert, Form, Input, Modal, Radio, Select, Tag } from 'antd';

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

const TIPO_ETIQUETA = { GRANT: 'OTORGAR', REVOKE: 'REVOCAR' };

/**
 * Modal de ajuste individual (override) de un usuario.
 *
 * Dos flujos, mismo submit:
 * - Manual (`fixedValues` ausente): formulario completo (permiso/acción/tipo/motivo).
 * - Toggle rápido desde la grilla de accesos (`fixedValues` presente, ver
 *   `AccesosUsuarioDominioPicker`): permiso/acción/tipo ya vienen resueltos del click en
 *   la celda; el modal solo pide el motivo (obligatorio) y arma el payload completo antes
 *   de invocar `onSubmit`, para que el llamador reciba siempre la misma forma
 *   `{ permiso_id, accion, tipo, motivo }`.
 */
export default function AgregarOverrideModal({
  open,
  loading,
  permisoOptions = [],
  fixedValues,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const esToggleRapido = Boolean(fixedValues);

  const handleOk = async () => {
    if (esToggleRapido) {
      const { motivo } = await form.validateFields();
      await onSubmit({
        permiso_id: fixedValues.permiso_id,
        accion: fixedValues.accion,
        tipo: fixedValues.tipo,
        motivo,
      });
      form.resetFields();
      return;
    }
    const values = await form.validateFields();
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={esToggleRapido ? 'Ajuste individual de acceso' : 'Agregar override'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={esToggleRapido ? (fixedValues.tipo === 'GRANT' ? 'Otorgar' : 'Revocar') : 'Agregar'}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      {esToggleRapido ? (
        <Alert
          type={fixedValues.tipo === 'GRANT' ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 16 }}
          title={
            <span>
              Vas a {TIPO_ETIQUETA[fixedValues.tipo] || fixedValues.tipo}: <strong>{fixedValues.permisoLabel}</strong>{' '}
              <Tag>{fixedValues.accion}</Tag>
            </span>
          }
        />
      ) : null}
      <Form form={form} layout="vertical" initialValues={{ tipo: 'GRANT' }}>
        {esToggleRapido ? null : (
          <>
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
          </>
        )}
        <Form.Item
          name="motivo"
          label="Motivo"
          rules={esToggleRapido ? [{ required: true, message: 'El motivo es obligatorio' }] : undefined}
        >
          <Input.TextArea rows={3} placeholder="Razón del ajuste" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
