/**
 * Formulario ABM de proyecto de grado — workspace alineado a CFG Académico.
 * Gemelo de `CursoCapacitacionFormSections` (CAP): UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections`) con "Datos del proyecto" como primer
 * nivel y "Estudiantes del proyecto" como sección interna.
 *
 * La sección de estudiantes usa selects con BÚSQUEDA EN SERVIDOR (debounce en
 * `useBuscarEstudiantesTit`, orquestada por el hook de pantalla) — el
 * `FormField` genérico no cubre `onSearch`, por eso los `Form.Item` viven
 * aquí como JSX del organismo (mismo criterio que el `tagRender` de CAP).
 * Solo la modalidad PSP (grupal) muestra el multi-select de integrantes.
 */

import { Alert, Col, Form, Row, Select, Spin, Typography } from 'antd';
import { CfgFormWorkspace } from '@organisms';

const { Text } = Typography;

/** Contenido del dropdown mientras se escribe / busca / sin resultados. */
const buildNotFoundContent = (buscando) =>
  buscando ? (
    <Spin size="small" />
  ) : (
    <Text type="secondary">Escriba al menos 2 caracteres para buscar por nombre o C.I.</Text>
  );

const ProyectoGradoFormSections = ({
  form,
  formSections,
  modalidadGrupal = false,
  estudianteOptions = [],
  buscandoEstudiantes = false,
  onBuscarEstudiantes,
  footer = null,
}) => {
  const { datosProyecto } = formSections ?? {};

  // El titular elegido se excluye del multi-select de integrantes.
  const titularId = Form.useWatch('estudianteId', form);
  const integranteOptions = estudianteOptions.filter((o) => o.value !== titularId);

  if (!datosProyecto?.fields?.length) {
    return null;
  }

  const commonSearchProps = {
    showSearch: true,
    filterOption: false,
    onSearch: onBuscarEstudiantes,
    loading: buscandoEstudiantes,
    notFoundContent: buildNotFoundContent(buscandoEstudiantes),
    options: estudianteOptions,
  };

  return (
    <CfgFormWorkspace
      title={datosProyecto.title}
      description={datosProyecto.description}
      form={form}
      footer={footer}
      sections={[
        {
          key: 'datosProyecto',
          fields: datosProyecto.fields,
        },
        {
          key: 'estudiantes',
          title: 'Estudiantes del proyecto',
          description: modalidadGrupal
            ? 'Modalidad grupal (PSP): registre al titular responsable y agregue a los demás integrantes del grupo.'
            : 'Registre al estudiante titular del proyecto. Busque por nombre o C.I.',
          fields: [],
          children: (
            <>
              {!modalidadGrupal ? (
                <Alert
                  type="info"
                  showIcon
                  title="Esta modalidad admite un solo estudiante"
                  description="Para registrar un proyecto con varios integrantes seleccione la modalidad PSP."
                />
              ) : null}
              <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
                <Col xs={24} md={12}>
                  <Form.Item
                    name="estudianteId"
                    label="Estudiante titular"
                    rules={[{ required: true, message: 'Seleccione al estudiante titular' }]}
                  >
                    <Select
                      {...commonSearchProps}
                      allowClear
                      placeholder="Busque por nombre o C.I."
                    />
                  </Form.Item>
                </Col>
                {modalidadGrupal ? (
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="integranteIds"
                      label="Integrantes del grupo"
                      tooltip="Cada estudiante seleccionado se agrega a la lista del proyecto"
                    >
                      <Select
                        {...commonSearchProps}
                        mode="multiple"
                        options={integranteOptions}
                        placeholder="Busque y agregue varios integrantes"
                      />
                    </Form.Item>
                  </Col>
                ) : null}
              </Row>
            </>
          ),
        },
      ]}
    />
  );
};

export default ProyectoGradoFormSections;
