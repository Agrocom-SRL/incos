/**
 * Formulario ABM de trámite de pasantía — workspace alineado a CFG Académico.
 * Gemelo de `ProyectoGradoFormSections` (TIT · Titulación): UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections`) con "Datos del trámite" como primer
 * nivel y "Estudiante" como sección interna.
 *
 * La sección de estudiante usa un select con BÚSQUEDA EN SERVIDOR (debounce
 * en `useBuscarEstudiantesTit`, orquestada por el hook de pantalla) — el
 * `FormField` genérico no cubre `onSearch`, por eso el `Form.Item` vive aquí
 * como JSX del organismo (mismo criterio que titulación). Las secciones de
 * puesto/contrato/responsable llegan declarativas desde el hook (el camino
 * CONVALIDACION agrega la de contrato).
 */

import { Col, Form, Row, Select, Spin, Typography } from 'antd';
import { CfgFormWorkspace } from '@organisms';

const { Text } = Typography;

/** Contenido del dropdown mientras se escribe / busca / sin resultados. */
const buildNotFoundContent = (buscando) =>
  buscando ? (
    <Spin size="small" />
  ) : (
    <Text type="secondary">Escriba al menos 2 caracteres para buscar por nombre o C.I.</Text>
  );

const PasantiaFormSections = ({
  form,
  formSections,
  estudianteOptions = [],
  buscandoEstudiantes = false,
  onBuscarEstudiantes,
  footer = null,
}) => {
  const { datosTramite, puesto, contrato, responsable } = formSections ?? {};

  if (!datosTramite?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosTramite.title}
      description={datosTramite.description}
      form={form}
      footer={footer}
      sections={[
        {
          key: 'estudiante',
          title: 'Estudiante',
          description:
            'Registre al estudiante del trámite. Busque por nombre o C.I. Un estudiante ' +
            'solo puede tener un trámite vigente a la vez.',
          fields: [],
          children: (
            <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
              <Col xs={24} md={12}>
                <Form.Item
                  name="estudianteId"
                  label="Estudiante"
                  rules={[{ required: true, message: 'Seleccione al estudiante del trámite' }]}
                >
                  <Select
                    showSearch
                    filterOption={false}
                    onSearch={onBuscarEstudiantes}
                    loading={buscandoEstudiantes}
                    notFoundContent={buildNotFoundContent(buscandoEstudiantes)}
                    options={estudianteOptions}
                    allowClear
                    placeholder="Busque por nombre o C.I."
                  />
                </Form.Item>
              </Col>
            </Row>
          ),
        },
        {
          key: 'datosTramite',
          fields: datosTramite.fields,
        },
        ...(puesto ? [{ key: 'puesto', ...puesto }] : []),
        ...(contrato ? [{ key: 'contrato', ...contrato }] : []),
        ...(responsable ? [{ key: 'responsable', ...responsable }] : []),
      ]}
    />
  );
};

export default PasantiaFormSections;
