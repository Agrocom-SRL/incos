/**
 * Drawer: informe de un trámite de pasantía (TIT · P12/P13).
 *
 * Dos modos según props (mismo formulario, payloads del contrato):
 *  - Emisión (sin `informe`): el TIPO lo fija el camino del trámite
 *    (VERIFICACION_EMPRESA para PASANTIA, CONVALIDACION_TRABAJO para
 *    CONVALIDACION — regla del backend) y el PDF institucional se genera al
 *    guardar.
 *  - Edición (`informe`): mismos campos; el backend regenera el PDF.
 *
 * Réplica digital del informe institucional (memo, fechas, destinatario,
 * evaluación cualitativa y resultado VIABLE/NO_VIABLE).
 */

import { useEffect } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Drawer, Flex, Form, Input, Select, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import {
  RESULTADO_INFORME_OPTIONS,
  TIPO_INFORME_POR_TIPO_PASANTIA,
  formatTipoInforme,
} from '@application-titulacion/utils/pasantiasPills';

const { Text } = Typography;

const InformePasantiaDrawer = ({
  open,
  onClose,
  onSubmit,
  saving = false,
  informe = null,
  tipoPasantia = 'PASANTIA',
  estudianteNombre = null,
}) => {
  const [form] = Form.useForm();

  const esEdicion = informe != null;
  /** Tipo de informe coherente con el camino (el backend valida igual). */
  const tipoInforme = esEdicion
    ? informe.tipo
    : (TIPO_INFORME_POR_TIPO_PASANTIA[tipoPasantia] ?? 'VERIFICACION_EMPRESA');
  const esVerificacion = tipoInforme === 'VERIFICACION_EMPRESA';

  const title = esEdicion ? 'Editar informe' : 'Emitir informe';

  // Precarga por modo cada vez que se abre el drawer.
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      numeroMemo: informe?.numeroMemo ?? '',
      fechaVerificacion: informe?.fechaVerificacion ? dayjs(informe.fechaVerificacion) : null,
      fechaEmision: informe?.fechaEmision ? dayjs(informe.fechaEmision) : dayjs(),
      destinatario: informe?.destinatario ?? '',
      areaRelacionada: informe?.areaRelacionada ?? '',
      evaluacionCualitativa: informe?.evaluacionCualitativa ?? '',
      resultado: informe?.resultado ?? undefined,
      contenido: informe?.contenido ?? '',
    });
  }, [open, informe, form]);

  const handleGuardar = async () => {
    const values = await form.validateFields();
    await onSubmit({
      tipo: tipoInforme,
      numeroMemo: (values.numeroMemo || '').trim() || null,
      fechaVerificacion: values.fechaVerificacion
        ? values.fechaVerificacion.format('YYYY-MM-DD')
        : null,
      fechaEmision: values.fechaEmision ? values.fechaEmision.format('YYYY-MM-DD') : null,
      destinatario: (values.destinatario || '').trim() || null,
      areaRelacionada: (values.areaRelacionada || '').trim() || null,
      evaluacionCualitativa: (values.evaluacionCualitativa || '').trim() || null,
      resultado: values.resultado ?? null,
      contenido: (values.contenido || '').trim() || null,
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
            {esEdicion ? 'Guardar informe' : 'Emitir informe'}
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap="small">
        <Text type="secondary">Tipo: {formatTipoInforme(tipoInforme)}</Text>
        {estudianteNombre ? <Text type="secondary">Estudiante: {estudianteNombre}</Text> : null}
      </Flex>

      <Form form={form} layout="vertical" disabled={saving}>
        <Form.Item name="numeroMemo" label="Número de memo (opcional)">
          <Input maxLength={50} placeholder="Ej. MEMO 015/2026" />
        </Form.Item>

        {esVerificacion ? (
          <Form.Item name="fechaVerificacion" label="Fecha de verificación (opcional)">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        ) : null}

        <Form.Item
          name="fechaEmision"
          label="Fecha de emisión"
          rules={[{ required: true, message: 'Registre la fecha de emisión del informe' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="destinatario" label="Destinatario (opcional)">
          <Input maxLength={150} placeholder="Ej. Dirección Académica" />
        </Form.Item>

        <Form.Item name="areaRelacionada" label="Área relacionada (opcional)">
          <Input maxLength={150} placeholder="Ej. Contabilidad" />
        </Form.Item>

        <Form.Item
          name="resultado"
          label="Resultado (opcional mientras no se dictamine)"
        >
          <Select
            options={RESULTADO_INFORME_OPTIONS}
            allowClear
            placeholder="Seleccione el resultado"
          />
        </Form.Item>

        <Form.Item name="evaluacionCualitativa" label="Evaluación cualitativa (opcional)">
          <Input.TextArea
            rows={3}
            maxLength={5000}
            placeholder="Valoración cualitativa de la verificación o convalidación"
          />
        </Form.Item>

        <Form.Item name="contenido" label="Contenido del informe (opcional)">
          <Input.TextArea rows={4} maxLength={10000} placeholder="Cuerpo del informe" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default InformePasantiaDrawer;
