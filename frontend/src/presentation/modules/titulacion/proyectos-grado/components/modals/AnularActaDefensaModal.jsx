/**
 * Modal: anular un acta de defensa EMITIDA (TIT · extensión 2026-08-02,
 * proyecto·APROBAR — mismo permiso que registrar el acta, P8/P6).
 *
 * Patrón `AnularFolioModal` (Libros de registro): exige motivo (3-500
 * caracteres), que el backend antepone a `observaciones`
 * (`"ANULADA: {motivo}"`). Terminal: un acta ANULADA no vuelve a EMITIDA; la
 * transición del proyecto (APROBADO/REPROBADO) NO se revierte (corrección de
 * estado = decisión manual documentada).
 */

import { Form, Input, Modal, Typography } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';

const { TextArea } = Input;
const { Paragraph } = Typography;

const AnularActaDefensaModal = ({ open, acta, anulando = false, onAnular, onCancelar }) => {
  const [form] = Form.useForm();

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onAnular?.(values.motivo?.trim());
  };

  return (
    <Modal
      open={open}
      title="Anular acta de defensa"
      okText="Anular acta"
      okButtonProps={{ danger: true }}
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={anulando}
      destroyOnHidden
      maskClosable={!anulando}
      width={modalWidths.modalWidthSM}
    >
      <Paragraph type="secondary">
        {acta?.numeroActaFormateado
          ? `Se anulará el acta ${acta.numeroActaFormateado}${acta.estudianteNombre ? ` de ${acta.estudianteNombre}` : ''}. Esta acción no se puede deshacer.`
          : 'Esta acción no se puede deshacer.'}
      </Paragraph>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="motivo"
          label="Motivo de anulación"
          rules={[
            { required: true, message: 'Indique el motivo de la anulación' },
            { min: 3, message: 'El motivo debe tener al menos 3 caracteres' },
            { max: 500, message: 'El motivo no puede superar los 500 caracteres' },
          ]}
        >
          <TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Explique por qué se anula esta acta de defensa"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AnularActaDefensaModal;
