/**
 * Organismo: modal de edición de la OBSERVACIÓN de una fila del folio.
 * El ESTADO académico no es editable aquí: siempre deriva del centralizador
 * de calificaciones (vista 135) — fijarlo a mano contradiría esa fuente de
 * verdad. Deshabilitado por la página si el folio está ANULADO (terminal);
 * el backend lo valida igualmente.
 */

import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';

const { TextArea } = Input;

const EditarFilaFolioModal = ({ open, fila, guardando = false, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open || !fila) return;
    form.setFieldsValue({ observaciones: fila.observaciones ?? undefined });
  }, [open, fila, form]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onGuardar?.({ observaciones: values.observaciones?.trim() || null });
  };

  return (
    <Modal
      open={open}
      title={fila ? `Editar observación · ${fila.nombreCompleto}` : 'Editar observación'}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={guardando}
      destroyOnHidden
      maskClosable={!guardando}
      width={modalWidths.modalWidthSM}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="observaciones" label="Observaciones (opcional)">
          <TextArea rows={3} maxLength={255} showCount placeholder="Observación de la fila" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditarFilaFolioModal;
