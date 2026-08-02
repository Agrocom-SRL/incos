/**
 * Modal: registrar el acta de defensa de grado del proyecto (TIT · extensión
 * 2026-08-01, proyecto·APROBAR).
 *
 * Patrón de formulario de `AprobarEtapaModal`/`AsignarTutorModal`. El
 * tribunal (P5: siempre docentes del instituto, sin entrada de texto libre)
 * reutiliza el MISMO catálogo de `useDocentesCatalogoTitApi` ya cargado por
 * la ficha para "Asignar tutor" (se pasa por props, sin duplicar el fetch).
 * La calificación es INDIVIDUAL por integrante ACTIVO (P3): en un proyecto
 * PSP grupal se registra una fila por estudiante, pero el envío sigue siendo
 * un único POST con `calificaciones: [{ estudianteId, calificacionFinal }]`
 * (contrato C12). El resultado (APRUEBA/REPRUEBA) que se ve junto a cada
 * nota es solo un PREVIEW visual calculado en el cliente contra el umbral
 * institucional por defecto — la fuente de verdad la calcula el backend
 * contra `configuracion_evaluacion` de la gestión (P2) y puede diferir.
 */

import { useEffect, useMemo } from 'react';
import {
  Alert,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  TimePicker,
  Typography,
} from 'antd';
import { StatusPill } from '@atoms';
import {
  formatResultadoActaDefensa,
  getResultadoActaDefensaPillClass,
  NOTA_MINIMA_APROBACION_ACTA_PREVIEW,
} from '@application-titulacion/utils/titulacionPills';
import { modalWidths } from '@theme/tokens/spacing';
import { allSpacing } from '@theme/tokens';

const { Text, Paragraph } = Typography;

/** Miembros del Tribunal Evaluador por acta (espejo de `TRIBUNAL_ACTA_DEFENSA_MIEMBROS`, backend). */
const TRIBUNAL_MIEMBROS = 3;
const CARGO_DEFECTO = 'Tribunal Evaluador';
const HORA_FORMATO = 'HH:mm';

/** Fila de calificación de UN estudiante integrante ACTIVO, con preview de resultado reactivo. */
const CalificacionEstudianteRow = ({ form, integrante }) => {
  const nota = Form.useWatch(['calificaciones', integrante.estudianteId], form);
  const notaNumero = Number(nota);
  const tieneNota = nota !== null && nota !== undefined && nota !== '' && Number.isFinite(notaNumero);
  const resultadoPreview = tieneNota
    ? notaNumero >= NOTA_MINIMA_APROBACION_ACTA_PREVIEW
      ? 'APRUEBA'
      : 'REPRUEBA'
    : null;

  return (
    <Flex align="center" gap={allSpacing.marginSM} wrap>
      <Form.Item
        name={['calificaciones', integrante.estudianteId]}
        label={integrante.ci ? `${integrante.nombreCompleto} · C.I. ${integrante.ci}` : integrante.nombreCompleto}
        rules={[{ required: true, message: 'Registre la calificación final del estudiante' }]}
        style={{ flex: '1 1 260px', marginBottom: 0 }}
      >
        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0 a 100" />
      </Form.Item>
      {resultadoPreview ? (
        <StatusPill
          label={formatResultadoActaDefensa(resultadoPreview)}
          className={getResultadoActaDefensaPillClass(resultadoPreview)}
        />
      ) : null}
    </Flex>
  );
};

const RegistrarActaDefensaModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  integrantes = [],
  docentes = [],
  loadingDocentes = false,
  docentesDisponible = true,
}) => {
  const [form] = Form.useForm();

  /** Solo integrantes ACTIVOS defienden (P3: una calificación individual por estudiante). */
  const integrantesActivos = useMemo(
    () => integrantes.filter((i) => i.estado === 'ACTIVO'),
    [integrantes],
  );

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      tribunal: Array.from({ length: TRIBUNAL_MIEMBROS }, () => ({ cargo: CARGO_DEFECTO })),
    });
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      fechaDefensa: values.fechaDefensa.format('YYYY-MM-DD'),
      horaInicio: values.horaInicio.format(HORA_FORMATO),
      horaConclusion: values.horaConclusion ? values.horaConclusion.format(HORA_FORMATO) : undefined,
      tribunal: (values.tribunal || []).map((miembro) => ({
        docenteId: miembro.docenteId,
        cargo: (miembro.cargo || '').trim() || undefined,
      })),
      calificaciones: integrantesActivos.map((integrante) => ({
        estudianteId: integrante.estudianteId,
        calificacionFinal: values.calificaciones?.[integrante.estudianteId],
      })),
      numeroActa: values.numeroActa || undefined,
    });
  };

  const sinIntegrantesActivos = integrantesActivos.length === 0;

  return (
    <Modal
      title="Registrar acta de defensa"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Registrar acta"
      cancelText="Volver"
      confirmLoading={saving}
      okButtonProps={{ disabled: !docentesDisponible || sinIntegrantesActivos }}
      destroyOnHidden
      width={modalWidths.modalWidthLG}
    >
      <Paragraph type="secondary">
        Al confirmar, el sistema registra el acta (una por integrante activo) con el tribunal y la
        calificación final, y actualiza el estado del proyecto conforme al resultado.
      </Paragraph>

      {!docentesDisponible ? (
        <Alert type="warning" showIcon title="Catálogo de docentes no disponible para su rol" />
      ) : sinIntegrantesActivos ? (
        <Alert
          type="warning"
          showIcon
          title="El proyecto no tiene integrantes activos"
          description="No es posible registrar el acta sin al menos un estudiante activo en el proyecto."
        />
      ) : (
        <Form form={form} layout="vertical" disabled={saving}>
          <Row gutter={[allSpacing.marginSM, 0]}>
            <Col span={8}>
              <Form.Item
                name="fechaDefensa"
                label="Fecha de defensa"
                rules={[{ required: true, message: 'Registre la fecha de la defensa' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="horaInicio"
                label="Hora de inicio"
                rules={[{ required: true, message: 'Registre la hora de inicio del acto' }]}
              >
                <TimePicker
                  format={HORA_FORMATO}
                  minuteStep={5}
                  needConfirm={false}
                  placeholder={HORA_FORMATO}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="horaConclusion" label="Hora de conclusión (opcional)">
                <TimePicker
                  format={HORA_FORMATO}
                  minuteStep={5}
                  needConfirm={false}
                  placeholder={HORA_FORMATO}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Text strong>Tribunal Evaluador</Text>
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            Seleccione a los 3 docentes del instituto que integran el tribunal (P5: sin
            profesionales externos).
          </Paragraph>
          {Array.from({ length: TRIBUNAL_MIEMBROS }, (_, index) => (
            <Row gutter={[allSpacing.marginSM, 0]} key={index}>
              <Col span={16}>
                <Form.Item
                  name={['tribunal', index, 'docenteId']}
                  label={`Miembro ${index + 1}`}
                  rules={[{ required: true, message: 'Seleccione al docente' }]}
                >
                  <Select
                    options={docentes}
                    loading={loadingDocentes}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Busque por nombre"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['tribunal', index, 'cargo']} label="Cargo (opcional)">
                  <Input placeholder={CARGO_DEFECTO} maxLength={80} />
                </Form.Item>
              </Col>
            </Row>
          ))}

          <Text strong>Calificación final</Text>
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            Registre la nota (0 a 100) de cada estudiante integrante activo del proyecto.
          </Paragraph>
          <Flex vertical gap={allSpacing.marginSM}>
            {integrantesActivos.map((integrante) => (
              <CalificacionEstudianteRow
                key={integrante.estudianteId ?? integrante.id}
                form={form}
                integrante={integrante}
              />
            ))}
          </Flex>

          <Form.Item
            name="numeroActa"
            label="Número de acta (opcional)"
            extra="Se asigna automáticamente el siguiente correlativo de la gestión; indíquelo solo para empatar el libro físico."
            style={{ marginTop: allSpacing.margin }}
          >
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="Automático" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default RegistrarActaDefensaModal;
