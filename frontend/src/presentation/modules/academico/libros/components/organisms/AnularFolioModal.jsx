/**
 * Organismo: modal "Anular folio" — exige motivo (queda en las observaciones
 * del folio). Terminal: un folio ANULADO no vuelve a BORRADOR; para
 * regenerar el paralelo hay que generar folios nuevos (numeración nueva).
 */

import { Form, Input, Modal } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';

const { TextArea } = Input;

const AnularFolioModal = ({ open, anulando = false, onAnular, onCancelar }) => {
  const [form] = Form.useForm();

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onAnular?.(values.motivo?.trim());
  };

  return (
    <Modal
      open={open}
      title="Anular folio"
      okText="Anular folio"
      okButtonProps={{ danger: true }}
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={anulando}
      destroyOnHidden
      maskClosable={!anulando}
      width={modalWidths.modalWidthSM}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="motivo"
          label="Motivo de anulación"
          rules={[{ required: true, message: 'Ingrese el motivo de la anulación' }]}
        >
          <TextArea
            rows={3}
            maxLength={2000}
            showCount
            placeholder="Explique por qué se anula este folio"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AnularFolioModal;
