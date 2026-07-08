import { Alert, Form } from 'antd';
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
  sinPlanVigente = false,
  carreraId,
  fieldsDisabled = false,
}) => {
  const { datosParalelo } = formSections ?? {};

  if (!datosParalelo?.fields?.length) {
    return null;
  }

  const periodoExtra =
    sinPlanVigente && carreraId ? (
      <Alert
        type="warning"
        showIcon
        title="La carrera no tiene plan de estudio vigente. Defínalo en el tab Planes."
        style={{ marginTop: 8 }}
      />
    ) : null;

  const turno = Form.useWatch('turno', form);
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
      }
    />
  );
};

export default ParaleloFormSections;
