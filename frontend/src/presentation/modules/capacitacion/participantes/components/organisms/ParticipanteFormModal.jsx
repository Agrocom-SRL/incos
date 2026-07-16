/**
 * Organismo: modal de alta/edición de participante (CAP · CREAR/EDITAR).
 *
 * AntD 6 (`open`, no `visible`). Reusa `ParticipanteFormFields` (mismos campos
 * que el paso "participante nuevo" de la inscripción). Recibe props ya
 * orquestadas por el hook de pantalla; no llama hooks de fetch.
 */

import { useEffect } from 'react';
import { Form, Modal } from 'antd';
import { mapParticipanteToFormValues } from '@application-capacitacion/participantes/mappers/participanteMapper';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';

const ParticipanteFormModal = ({
  open = false,
  participante = null, // objeto en edición | null en alta
  saving = false,
  onGuardar,
  onCancelar,
}) => {
  const [form] = Form.useForm();
  const isEdicion = Boolean(participante?.id);

  // Precarga al abrir: edición → datos del participante; alta → limpio.
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(mapParticipanteToFormValues(isEdicion ? participante : null));
  }, [open, isEdicion, participante, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onGuardar?.(values);
    } catch {
      // Errores de validación: AntD ya marca los campos.
    }
  };

  return (
    <Modal
      open={open}
      title={isEdicion ? 'Editar participante' : 'Nuevo participante'}
      okText={isEdicion ? 'Guardar cambios' : 'Registrar participante'}
      cancelText="Cancelar"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancelar}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" disabled={saving}>
        <ParticipanteFormFields disabled={saving} />
      </Form>
    </Modal>
  );
};

export default ParticipanteFormModal;
