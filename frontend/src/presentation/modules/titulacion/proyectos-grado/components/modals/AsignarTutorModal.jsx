/**
 * Modal: asignar/cambiar tutor del proyecto de grado (TIT · T10, proyecto·APROBAR).
 *
 * Al confirmar, el backend registra la designación y genera el informe
 * oficial (PDF DESIGNACION_OFICIAL → dictamenes_proyecto). Patrón de modal
 * con formulario de `CambiarPasswordModal` (seguridad/usuarios).
 *
 * Extensión 2026-08-11: la designación queda además como una entrada de
 * bitácora (fecha + observaciones si se registran aquí) — pedido explícito
 * del usuario de tener el historial de tutoría visible sin registrarlo aparte.
 */

import { useEffect } from 'react';
import { Alert, Form, Input, Modal, Select, Typography } from 'antd';

const { Paragraph } = Typography;

const AsignarTutorModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  docentes = [],
  loadingDocentes = false,
  docentesDisponible = true,
  tutorActualId = null,
}) => {
  const [form] = Form.useForm();

  // Precarga el tutor vigente cada vez que se abre el modal.
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ tutorId: tutorActualId ?? undefined, observaciones: '' });
    }
  }, [open, tutorActualId, form]);

  const handleOk = async () => {
    // Validación fallida: los errores ya se muestran en el formulario; no propagar el rechazo.
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    await onSubmit({
      tutorId: values.tutorId,
      observaciones: (values.observaciones || '').trim() || undefined,
    });
  };

  return (
    <Modal
      title={tutorActualId ? 'Cambiar tutor del proyecto' : 'Asignar tutor al proyecto'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Asignar tutor"
      cancelText="Volver"
      confirmLoading={saving}
      destroyOnHidden
    >
      <Paragraph type="secondary">
        Al confirmar, el sistema registra la designación oficial del tutor y genera el informe en
        PDF para la DDE.
      </Paragraph>
      {!docentesDisponible ? (
        <Alert
          type="warning"
          showIcon
          title="Catálogo de docentes no disponible para su rol"
        />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="tutorId"
            label="Docente tutor"
            rules={[{ required: true, message: 'Seleccione al docente tutor' }]}
          >
            <Select
              options={docentes}
              loading={loadingDocentes}
              showSearch
              optionFilterProp="label"
              placeholder="Seleccione un docente"
            />
          </Form.Item>
          <Form.Item name="observaciones" label="Observaciones (opcional)">
            <Input.TextArea
              rows={3}
              maxLength={2000}
              placeholder="Registre observaciones de la designación si corresponde"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default AsignarTutorModal;
