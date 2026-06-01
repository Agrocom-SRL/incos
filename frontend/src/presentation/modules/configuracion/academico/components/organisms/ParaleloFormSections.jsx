import { Form } from 'antd';
import CfgAcademicoFormWorkspace from './CfgAcademicoFormWorkspace';
import ParaleloCarreraPicker from './ParaleloCarreraPicker';
import ParaleloPeriodoPicker from './ParaleloPeriodoPicker';

const ParaleloFormSections = ({
  form,
  formSections,
  resolveOptions,
  footer = null,
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  periodos = [],
  periodosLoading = false,
  sinPlanVigente = false,
  onCarreraChange,
  fieldsDisabled = false,
}) => {
  const { datosParalelo } = formSections ?? {};

  if (!datosParalelo?.fields?.length) {
    return null;
  }

  return (
    <CfgAcademicoFormWorkspace
      title={datosParalelo.title}
      description={datosParalelo.description}
      fields={datosParalelo.fields}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
      beforeFields={
        <>
          <Form.Item
            name="carrera_id"
            label="Carrera"
            rules={[{ required: true, message: 'Seleccione la carrera' }]}
          >
            <ParaleloCarreraPicker
              carreras={carreras}
              loading={carrerasLoading}
              error={carrerasError}
              disabled={fieldsDisabled}
              onChange={() => {
                form.setFieldValue('periodo_id', undefined);
                onCarreraChange?.();
              }}
            />
          </Form.Item>

          <Form.Item
            name="periodo_id"
            label="Periodo del plan"
            rules={[{ required: true, message: 'Seleccione el periodo' }]}
          >
            <ParaleloPeriodoPicker
              periodos={periodos}
              loading={periodosLoading}
              disabled={fieldsDisabled}
              sinPlanVigente={sinPlanVigente}
            />
          </Form.Item>
        </>
      }
    />
  );
};

export default ParaleloFormSections;
