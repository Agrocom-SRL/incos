/**
 * Organismo: modal de edición de una fila del folio (ESTADO/OBSERVACIONES —
 * columnas del centralizador). Deshabilitado por la página si el folio está
 * FIRMADO (inmutable) o ANULADO (terminal); el backend lo valida igualmente.
 */

import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';
import { ESTADO_ACADEMICO_OPTIONS } from '@application-academico/libros/utils/librosEstados';

const { TextArea } = Input;

const EditarFilaFolioModal = ({ open, fila, guardando = false, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open || !fila) return;
    form.setFieldsValue({
      estadoAcademico: fila.estadoAcademico ?? undefined,
      observaciones: fila.observaciones ?? undefined,
    });
  }, [open, fila, form]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onGuardar?.({
      estadoAcademico: values.estadoAcademico ?? null,
      observaciones: values.observaciones?.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      title={fila ? `Editar fila · ${fila.nombreCompleto}` : 'Editar fila'}
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
        <Form.Item
          name="estadoAcademico"
          label="Estado"
          rules={[{ required: true, message: 'Seleccione el estado académico' }]}
        >
          <Select size="large" options={ESTADO_ACADEMICO_OPTIONS} placeholder="Seleccione el estado" />
        </Form.Item>
        <Form.Item name="observaciones" label="Observaciones (opcional)">
          <TextArea rows={2} maxLength={255} showCount placeholder="Observación de la fila" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditarFilaFolioModal;
