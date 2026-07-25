/**
 * Modal: subir avance del proyecto (TUT · T20, avance·CREAR — portal del
 * estudiante). Upload PDF/Word por multipart (`uploadAvanceProyecto`); el
 * archivo NO se sube solo: se adjunta al enviar el formulario
 * (`beforeUpload: false`). El guard de integrante lo aplica el servidor.
 */

import { useEffect } from 'react';
import { Form, Input, Modal, Upload, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { AVANCE_ACCEPT } from '@application-tutorias/titulacion/hooks/state/useMiProyectoGradoPage';

const { Text } = Typography;

/** Normaliza el evento del Upload al fileList que guarda el Form.Item. */
const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const SubirAvanceModal = ({ open, onCancel, onSubmit, subiendo = false }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const file = values.archivo?.[0]?.originFileObj ?? null;
    await onSubmit({
      file,
      titulo: (values.titulo || '').trim() || undefined,
      descripcion: (values.descripcion || '').trim() || undefined,
    });
  };

  return (
    <Modal
      title="Subir avance"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Enviar avance"
      cancelText="Volver"
      confirmLoading={subiendo}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="archivo"
          label="Archivo del avance"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Adjunte el archivo del avance' }]}
        >
          <Upload.Dragger
            accept={AVANCE_ACCEPT}
            maxCount={1}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Arrastre el archivo aquí o haga clic para elegirlo</p>
            <Text type="secondary">Formatos permitidos: PDF o Word (.doc, .docx)</Text>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item name="titulo" label="Título del avance (opcional)">
          <Input maxLength={255} placeholder="Ej. Capítulo 2 — Marco teórico" />
        </Form.Item>
        <Form.Item name="descripcion" label="Descripción (opcional)">
          <Input.TextArea
            rows={3}
            maxLength={2000}
            placeholder="Describa brevemente el contenido entregado"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubirAvanceModal;
