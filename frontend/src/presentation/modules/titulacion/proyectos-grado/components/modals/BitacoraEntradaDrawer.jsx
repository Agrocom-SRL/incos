/**
 * Drawer: entrada de bitácora de tutoría (TUT · T15/T16).
 *
 * Tres modos según props (mismo formulario, payloads del contrato):
 *  - Nueva REUNION (sin `entrada` ni `avance`): tipo REUNION.
 *  - Revisión de avance (`avance`): tipo REVISION_AVANCE + avanceProyectoId +
 *    resultado de revisión (actualiza avances_proyecto.estado_revision).
 *  - Edición (`entrada`): fecha/actividad/observaciones/porcentaje/estado.
 *
 * Réplica digital de la planilla de seguimiento DDE (FECHA · ACTIVIDAD ·
 * OBSERVACIONES · % de avance).
 */

import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Drawer, Flex, Form, Input, InputNumber, Select, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import {
  ESTADOS_BITACORA,
  formatEstadoAvance,
  formatEstadoBitacora,
} from '@application-titulacion/utils/titulacionPills';

const { Text } = Typography;

/** Resultados válidos de una revisión de avance (T15 · estadoRevisionAvance). */
const RESULTADOS_REVISION = ['OBSERVADO', 'SUBSANADO', 'APROBADO'];

const BitacoraEntradaDrawer = ({
  open,
  onClose,
  onSubmit,
  saving = false,
  entrada = null,
  avance = null,
  proyectoTitulo = null,
}) => {
  const [form] = Form.useForm();

  const esEdicion = entrada != null;
  const esRevision = !esEdicion && avance != null;

  const title = esEdicion
    ? 'Editar entrada de bitácora'
    : esRevision
      ? 'Revisar avance'
      : 'Nueva entrada de bitácora';

  // Precarga por modo cada vez que se abre el drawer.
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      fecha: entrada?.fecha ? dayjs(entrada.fecha) : dayjs(),
      actividad: entrada?.actividad ?? '',
      observaciones: entrada?.observaciones ?? '',
      porcentajeAvance: entrada?.porcentajeAvance ?? null,
      estado: entrada?.estado ?? 'PENDIENTE',
      estadoRevisionAvance: 'OBSERVADO',
    });
  }, [open, entrada, form]);

  const resultadoOptions = useMemo(
    () => RESULTADOS_REVISION.map((r) => ({ value: r, label: formatEstadoAvance(r) })),
    [],
  );

  const estadoOptions = useMemo(
    () => ESTADOS_BITACORA.map((e) => ({ value: e, label: formatEstadoBitacora(e) })),
    [],
  );

  const handleGuardar = async () => {
    const values = await form.validateFields();
    const base = {
      fecha: values.fecha ? values.fecha.format('YYYY-MM-DD') : undefined,
      actividad: (values.actividad || '').trim() || null,
      observaciones: (values.observaciones || '').trim() || null,
      porcentajeAvance: values.porcentajeAvance ?? null,
    };
    if (esEdicion) {
      await onSubmit({ ...base, estado: values.estado });
      return;
    }
    if (esRevision) {
      await onSubmit({
        ...base,
        tipo: 'REVISION_AVANCE',
        avanceProyectoId: avance.id,
        estadoRevisionAvance: values.estadoRevisionAvance,
      });
      return;
    }
    await onSubmit({ ...base, tipo: 'REUNION' });
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnHidden
      footer={
        <Flex justify="flex-end" gap="small">
          <Button onClick={onClose}>Volver</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleGuardar}
          >
            Guardar entrada
          </Button>
        </Flex>
      }
    >
      {proyectoTitulo ? (
        <Text type="secondary">Proyecto: {proyectoTitulo}</Text>
      ) : null}
      {esRevision ? (
        <Text type="secondary">
          Avance revisado: {avance.titulo || avance.nombreArchivo || `Avance ${avance.numeroAvance ?? ''}`}
        </Text>
      ) : null}

      <Form form={form} layout="vertical" disabled={saving}>
        {esRevision ? (
          <Form.Item
            name="estadoRevisionAvance"
            label="Resultado de la revisión"
            rules={[{ required: true, message: 'Seleccione el resultado de la revisión' }]}
          >
            <Select options={resultadoOptions} />
          </Form.Item>
        ) : null}

        <Form.Item
          name="fecha"
          label="Fecha de la tutoría"
          rules={[{ required: true, message: 'Registre la fecha de la tutoría' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="actividad"
          label="Actividad"
          rules={[{ required: true, message: 'Describa la actividad revisada' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={2000}
            placeholder="Avance revisado en relación al cronograma de tutoría"
          />
        </Form.Item>

        <Form.Item name="observaciones" label="Observaciones (opcional)">
          <Input.TextArea
            rows={3}
            maxLength={2000}
            placeholder="Observaciones para el estudiante"
          />
        </Form.Item>

        <Form.Item
          name="porcentajeAvance"
          label="Porcentaje de avance del proyecto (opcional)"
        >
          <InputNumber min={0} max={100} step={5} addonAfter="%" style={{ width: '100%' }} />
        </Form.Item>

        {esEdicion ? (
          <Form.Item
            name="estado"
            label="Estado de la observación"
            tooltip="Marque «Subsanado» cuando el estudiante atienda la observación"
          >
            <Select options={estadoOptions} />
          </Form.Item>
        ) : null}
      </Form>
    </Drawer>
  );
};

export default BitacoraEntradaDrawer;
