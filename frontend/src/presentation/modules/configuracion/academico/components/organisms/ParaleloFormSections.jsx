import { Alert, Form } from 'antd';
import CfgAcademicoFormWorkspace from './CfgAcademicoFormWorkspace';
import ParaleloCarreraFormControl from './ParaleloCarreraFormControl';

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
        message="La carrera no tiene plan de estudio vigente. Defínalo en el tab Planes."
        style={{ marginTop: 8 }}
      />
    ) : null;

  return (
    <CfgAcademicoFormWorkspace
      title={datosParalelo.title}
      description={datosParalelo.description}
      fields={datosParalelo.fields}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
      afterField={{ periodo_id: periodoExtra }}
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
