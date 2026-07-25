/**
 * Formulario de sesión de reforzamiento — workspace alineado a CFG Académico.
 * Tres sectores dentro de UNA misma tarjeta (prop `sections` de
 * `CfgFormWorkspace`, mismo patrón que `CursoCapacitacionFormSections`):
 * "Programación" da título a la tarjeta, "Modalidad y lugar" y "Participantes"
 * quedan como secciones internas.
 *
 * Las horas de inicio/fin son `TimePicker` (no existe renderer declarativo
 * `time` en FormField), por eso la primera sección se compone aquí con la
 * MISMA grilla del workspace (`Row` + `cfgFormColProps` + `FormField`): el
 * hook de estado solo declara datos; el JSX del picker vive en presentación.
 */

import { Form, Row, Col, TimePicker } from 'antd';
import { FormField } from '@molecules';
import { CfgFormWorkspace, cfgFormColProps } from '@organisms';

const HORA_FORMAT = 'HH:mm';

/** Form.Item de hora con el mismo layout vertical de FormField. */
const HoraField = ({ name, label, requiredMessage }) => (
  <Form.Item
    name={name}
    label={label}
    rules={[{ required: true, message: requiredMessage }]}
    className="form-field form-field--vertical"
  >
    <TimePicker
      format={HORA_FORMAT}
      minuteStep={5}
      needConfirm={false}
      placeholder={HORA_FORMAT}
      style={{ width: '100%' }}
    />
  </Form.Item>
);

const SesionReforzamientoFormSections = ({ form, formSections, footer = null }) => {
  const { programacion, modalidad, participantes } = formSections ?? {};

  if (!programacion?.fields?.length) {
    return null;
  }

  // Grilla propia de la sección de programación: curso + fecha (declarativos),
  // horas (TimePicker) y tema (declarativo), con el ritmo del workspace.
  const camposPorNombre = Object.fromEntries(
    programacion.fields.map((field) => [field.name, field]),
  );

  const programacionGrid = (
    <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
      {camposPorNombre.asignacionDocenteId ? (
        <Col {...cfgFormColProps(12)}>
          <FormField
            field={camposPorNombre.asignacionDocenteId}
            form={form}
            labelLayout="vertical"
          />
        </Col>
      ) : null}
      {camposPorNombre.fecha ? (
        <Col {...cfgFormColProps(12)}>
          <FormField field={camposPorNombre.fecha} form={form} labelLayout="vertical" />
        </Col>
      ) : null}
      <Col {...cfgFormColProps(12)}>
        <HoraField
          name="horaInicio"
          label="Hora de inicio"
          requiredMessage="Seleccione la hora de inicio"
        />
      </Col>
      <Col {...cfgFormColProps(12)}>
        <HoraField
          name="horaFin"
          label="Hora de fin"
          requiredMessage="Seleccione la hora de fin"
        />
      </Col>
      {camposPorNombre.tema ? (
        <Col {...cfgFormColProps(24)}>
          <FormField field={camposPorNombre.tema} form={form} labelLayout="vertical" />
        </Col>
      ) : null}
    </Row>
  );

  return (
    <CfgFormWorkspace
      title={programacion.title}
      description={programacion.description}
      form={form}
      footer={footer}
      sections={[
        {
          key: 'programacion',
          fields: [],
          children: programacionGrid,
        },
        ...(modalidad?.fields?.length
          ? [
              {
                key: 'modalidad',
                title: modalidad.title,
                description: modalidad.description,
                fields: modalidad.fields,
              },
            ]
          : []),
        ...(participantes?.fields?.length
          ? [
              {
                key: 'participantes',
                title: participantes.title,
                description: participantes.description,
                fields: participantes.fields,
              },
            ]
          : []),
      ]}
    />
  );
};

export default SesionReforzamientoFormSections;
