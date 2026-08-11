/**
 * Formulario de registro de acta de defensa — workspace alineado a CFG
 * Académico (mismo patrón que `ProyectoGradoFormSections`): UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections`) con "Datos de la defensa", "Tribunal
 * Evaluador" y "Calificación final" como secciones internas tituladas —
 * pedido explícito del usuario, para no mostrar los campos sueltos.
 *
 * Los tres campos usan `children` (no la grilla declarativa `fields`
 * genérica): DatePicker/TimePicker con formato propio y la fila dinámica de
 * calificación por integrante no encajan en el tipado genérico de
 * `FormField` (mismo criterio que la sección "Estudiantes del proyecto" de
 * `ProyectoGradoFormSections`, que también usa `children`).
 */

import { Col, Flex, Form, Input, InputNumber, Row, Select, TimePicker, DatePicker } from 'antd';
import { CfgFormWorkspace } from '@organisms';
import { StatusPill } from '@atoms';
import {
  formatResultadoActaDefensa,
  getResultadoActaDefensaPillClass,
  NOTA_MINIMA_APROBACION_ACTA_PREVIEW,
} from '@application-titulacion/utils/titulacionPills';
import { allSpacing } from '@theme/tokens';

/** Miembros del Tribunal Evaluador por acta (espejo de `TRIBUNAL_ACTA_DEFENSA_MIEMBROS`, backend). */
export const TRIBUNAL_MIEMBROS = 3;
export const CARGO_DEFECTO = 'Tribunal Evaluador';
const HORA_FORMATO = 'HH:mm';

/** Fila de calificación de UN estudiante integrante ACTIVO, con preview de resultado reactivo. */
const CalificacionEstudianteRow = ({ form, integrante }) => {
  const nota = Form.useWatch(['calificaciones', integrante.estudianteId], form);
  const notaNumero = Number(nota);
  const tieneNota =
    nota !== null && nota !== undefined && nota !== '' && Number.isFinite(notaNumero);
  const resultadoPreview = tieneNota
    ? notaNumero >= NOTA_MINIMA_APROBACION_ACTA_PREVIEW
      ? 'APRUEBA'
      : 'REPRUEBA'
    : null;

  return (
    <Flex align="center" gap={allSpacing.marginSM} wrap>
      <Form.Item
        name={['calificaciones', integrante.estudianteId]}
        label={
          integrante.ci
            ? `${integrante.nombreCompleto} · C.I. ${integrante.ci}`
            : integrante.nombreCompleto
        }
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

const RegistrarActaDefensaFormSections = ({
  form,
  integrantesActivos = [],
  docentes = [],
  loadingDocentes = false,
  footer = null,
}) => (
  <CfgFormWorkspace
    title="Acta de defensa"
    description="Al confirmar, el sistema registra el acta (una por integrante activo) con el tribunal y la calificación final, y actualiza el estado del proyecto conforme al resultado."
    form={form}
    footer={footer}
    sections={[
      {
        key: 'datosDefensa',
        title: 'Datos de la defensa',
        description: 'Fecha, horario del acto y número de acta (folio del talonario físico).',
        fields: [],
        children: (
          <>
            <Row gutter={[allSpacing.marginSM, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="fechaDefensa"
                  label="Fecha de defensa"
                  rules={[{ required: true, message: 'Registre la fecha de la defensa' }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
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
              <Col xs={24} md={8}>
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
            <Row gutter={[allSpacing.marginSM, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="numeroActa"
                  label="Número de acta (opcional)"
                  extra="Se asigna automáticamente el siguiente correlativo de la gestión; indíquelo solo para empatar el libro físico."
                >
                  <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="Automático" />
                </Form.Item>
              </Col>
            </Row>
          </>
        ),
      },
      {
        key: 'tribunal',
        title: 'Tribunal Evaluador',
        description:
          'Seleccione a los 3 docentes del instituto que integran el tribunal (sin profesionales externos).',
        fields: [],
        children: (
          <Flex vertical gap={0}>
            {Array.from({ length: TRIBUNAL_MIEMBROS }, (_, index) => (
              <Row gutter={[allSpacing.marginSM, 0]} key={index}>
                <Col xs={24} md={16}>
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
                <Col xs={24} md={8}>
                  <Form.Item name={['tribunal', index, 'cargo']} label="Cargo (opcional)">
                    <Input placeholder={CARGO_DEFECTO} maxLength={80} />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Flex>
        ),
      },
      {
        key: 'calificaciones',
        title: 'Calificación final',
        description: 'Registre la nota (0 a 100) de cada estudiante integrante activo del proyecto.',
        fields: [],
        children: (
          <Flex vertical gap={allSpacing.marginSM}>
            {integrantesActivos.map((integrante) => (
              <CalificacionEstudianteRow
                key={integrante.estudianteId ?? integrante.id}
                form={form}
                integrante={integrante}
              />
            ))}
          </Flex>
        ),
      },
    ]}
  />
);

export default RegistrarActaDefensaFormSections;
