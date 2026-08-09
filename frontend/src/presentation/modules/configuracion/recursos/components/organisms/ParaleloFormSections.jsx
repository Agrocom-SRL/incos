import { Alert, Form, Select } from 'antd';
import { CfgFormWorkspace } from '@organisms';
import ParaleloCarreraFormControl from './ParaleloCarreraFormControl';
import ParaleloTurnoHorarioInfo from '../atoms/ParaleloTurnoHorarioInfo';

const ParaleloFormSections = ({
  form,
  formSections,
  resolveOptions,
  footer = null,
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  sinPlanActivo = false,
  planesDisponibles = [],
  carreraId,
  fieldsDisabled = false,
}) => {
  const { datosParalelo } = formSections ?? {};
  const turno = Form.useWatch('turno', form);

  if (!datosParalelo?.fields?.length) {
    return null;
  }

  const requierePlanEstudio = planesDisponibles.length > 1;

  const periodoExtra =
    sinPlanActivo && carreraId ? (
      <Alert
        type="warning"
        showIcon
        title="La carrera no tiene plan de estudio activo. Defínalo en el tab Planes."
        style={{ marginTop: 8 }}
      />
    ) : null;

  const turnoExtra = turno ? (
    <ParaleloTurnoHorarioInfo turno={turno} compact />
  ) : null;

  return (
    <CfgFormWorkspace
      title={datosParalelo.title}
      description={datosParalelo.description}
      fields={datosParalelo.fields}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
      afterField={{ periodo_id: periodoExtra, turno: turnoExtra }}
      beforeFields={
        <>
          <Form.Item
            name="carrera_id"
            label="Carrera"
            rules={[{ required: true, message: 'Seleccione la carrera' }]}
            className="cfg-paralelo-carrera-form-item"
          >
            <ParaleloCarreraFormControl
              form={form}
              carreras={carreras}
              loading={carrerasLoading}
              error={carrerasError}
              disabled={fieldsDisabled}
            />
          </Form.Item>

          {requierePlanEstudio ? (
            <Form.Item
              name="plan_estudio_id"
              label="Plan de estudios"
              rules={[{ required: true, message: 'Seleccione el plan de estudios' }]}
              className="cfg-paralelo-plan-form-item"
            >
              <Select
                placeholder="Seleccione el plan de estudios"
                options={resolveOptions('planes')}
                disabled={fieldsDisabled}
              />
            </Form.Item>
          ) : null}
        </>
      }
    />
  );
};

export default ParaleloFormSections;
