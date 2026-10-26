/**
 * Drawer: hoja de seguimiento de un trámite de pasantía (TIT · P16/P17).
 *
 * Dos modos según props (mismo formulario, payloads del contrato):
 *  - Registro (sin `seguimiento`): nueva visita de supervisión.
 *  - Edición (`seguimiento`): mismos campos.
 *
 * Réplica digital del FORMULARIO DE SEGUIMIENTO DE PASANTÍA (fecha · trabajo
 * desempeñado · principales actividades · nivel ALTO/MEDIO/BAJO · fortalezas
 * · áreas a mejorar · sugerencias). Las firmas ("Sello y firma del docente" /
 * "Sello y firma de la empresa") NO son un dato a capturar aquí — van
 * impresas como líneas en blanco del PDF exportado (extensión 2026-08-11,
 * pedido explícito del usuario: se firma el documento físico, no se marca un
 * switch en el formulario digital).
 */

import { useEffect } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Drawer, Flex, Form, Input, Select, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { NIVEL_DESEMPENO_OPTIONS } from '@application-titulacion/utils/pasantiasPills';

const { Text } = Typography;

const SeguimientoPasantiaDrawer = ({
  open,
  onClose,
  onSubmit,
  saving = false,
  seguimiento = null,
  estudianteNombre = null,
}) => {
  const [form] = Form.useForm();

  const esEdicion = seguimiento != null;
  const title = esEdicion ? 'Editar seguimiento' : 'Registrar seguimiento';

  // Precarga por modo cada vez que se abre el drawer.
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      fecha: seguimiento?.fecha ? dayjs(seguimiento.fecha) : dayjs(),
      descripcionTrabajo: seguimiento?.descripcionTrabajo ?? '',
      principalesActividades: seguimiento?.principalesActividades ?? '',
      nivelDesempeno: seguimiento?.nivelDesempeno ?? undefined,
      fortalezas: seguimiento?.fortalezas ?? '',
      areasMejorar: seguimiento?.areasMejorar ?? '',
      sugerencias: seguimiento?.sugerencias ?? '',
    });
  }, [open, seguimiento, form]);

  const handleGuardar = async () => {
    // Validación fallida: los errores ya se muestran en el formulario; no propagar el rechazo.
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    await onSubmit({
      fecha: values.fecha ? values.fecha.format('YYYY-MM-DD') : undefined,
      descripcionTrabajo: (values.descripcionTrabajo || '').trim() || null,
      principalesActividades: (values.principalesActividades || '').trim() || null,
      nivelDesempeno: values.nivelDesempeno ?? null,
      fortalezas: (values.fortalezas || '').trim() || null,
      areasMejorar: (values.areasMejorar || '').trim() || null,
      sugerencias: (values.sugerencias || '').trim() || null,
    });
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={480}
      destroyOnHidden
      footer={
        <Flex justify="flex-end" gap="small">
          <Button onClick={onClose}>Volver</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleGuardar}>
            Guardar seguimiento
          </Button>
        </Flex>
      }
    >
      {estudianteNombre ? <Text type="secondary">Estudiante: {estudianteNombre}</Text> : null}

      <Form form={form} layout="vertical" disabled={saving}>
        <Form.Item
          name="fecha"
          label="Fecha de la visita"
          rules={[{ required: true, message: 'Registre la fecha de la visita de seguimiento' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="descripcionTrabajo" label="Trabajo desempeñado (opcional)">
          <Input.TextArea
            rows={3}
            maxLength={5000}
            placeholder="Descripción del trabajo que desempeña el estudiante"
          />
        </Form.Item>

        <Form.Item name="principalesActividades" label="Principales actividades (opcional)">
          <Input.TextArea
            rows={3}
            maxLength={5000}
            placeholder="Actividades realizadas en el periodo evaluado"
          />
        </Form.Item>

        <Form.Item name="nivelDesempeno" label="Nivel de desempeño">
          <Select
            options={NIVEL_DESEMPENO_OPTIONS}
            allowClear
            placeholder="Seleccione el nivel (Alto / Medio / Bajo)"
          />
        </Form.Item>

        <Form.Item name="fortalezas" label="Fortalezas (opcional)">
          <Input.TextArea rows={2} maxLength={5000} placeholder="Fortalezas observadas" />
        </Form.Item>

        <Form.Item name="areasMejorar" label="Áreas a mejorar (opcional)">
          <Input.TextArea rows={2} maxLength={5000} placeholder="Aspectos a reforzar" />
        </Form.Item>

        <Form.Item name="sugerencias" label="Sugerencias (opcional)">
          <Input.TextArea rows={2} maxLength={5000} placeholder="Sugerencias para el estudiante" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default SeguimientoPasantiaDrawer;
