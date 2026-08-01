/**
 * Formulario ABM de proyecto de grado — workspace alineado a CFG Académico.
 * Gemelo de `CursoCapacitacionFormSections` (CAP): UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections`) con "Datos del proyecto" como primer
 * nivel y "Estudiantes del proyecto" como sección interna.
 *
 * Extensión 2026-07-31 (Requisito 1): la sección de estudiantes YA NO busca
 * en un catálogo genérico — el titular y los integrantes se eligen del
 * catálogo de estudiantes ELEGIBLES de 3er año para la carrera seleccionada
 * (`useEstudiantesElegiblesModalidadApi`, `GET /estudiantes-elegibles`), que
 * el backend ya filtra (3er año, sin proyecto vigente); por eso el select usa
 * filtro EN CLIENTE (`showSearch` + `optionFilterProp`) sobre ese catálogo
 * acotado, sin `onSearch` server-side. El `FormField` genérico no cubre este
 * comportamiento, por eso los `Form.Item` viven aquí como JSX del organismo
 * (mismo criterio que el `tagRender` de CAP). Solo la modalidad PSP (grupal)
 * muestra el multi-select de integrantes.
 */

import { Alert, Col, Empty, Form, Row, Select, Typography } from 'antd';
import { CfgFormWorkspace } from '@organisms';

const { Text } = Typography;

/** Contenido del dropdown: sin carrera elegida, cargando, o sin elegibles. */
const buildNotFoundContent = ({ carreraSeleccionada, cargando }) => {
  if (!carreraSeleccionada) {
    return <Text type="secondary">Seleccione primero la carrera del proyecto.</Text>;
  }
  if (cargando) {
    return <Text type="secondary">Buscando estudiantes de 3er año elegibles…</Text>;
  }
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No hay estudiantes de 3er año disponibles para elegir modalidad de graduación en esta gestión."
    />
  );
};

const ProyectoGradoFormSections = ({
  form,
  formSections,
  modalidadGrupal = false,
  estudianteOptions = [],
  buscandoEstudiantes = false,
  carreraSeleccionada = false,
  footer = null,
}) => {
  const { datosProyecto } = formSections ?? {};

  // El titular elegido se excluye del multi-select de integrantes.
  const titularId = Form.useWatch('estudianteId', form);
  const integranteOptions = estudianteOptions.filter((o) => o.value !== titularId);

  if (!datosProyecto?.fields?.length) {
    return null;
  }

  const commonElegiblesProps = {
    showSearch: true,
    optionFilterProp: 'label',
    disabled: !carreraSeleccionada,
    loading: buscandoEstudiantes,
    notFoundContent: buildNotFoundContent({ carreraSeleccionada, cargando: buscandoEstudiantes }),
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
            ? 'Modalidad grupal (PSP): registre al titular responsable y agregue a los demás integrantes del grupo, ambos de entre los estudiantes de 3er año elegibles.'
            : 'Registre al estudiante titular del proyecto, de entre los estudiantes de 3er año elegibles para la carrera seleccionada.',
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
                      {...commonElegiblesProps}
                      allowClear
                      placeholder={
                        carreraSeleccionada
                          ? 'Seleccione un estudiante de 3er año elegible'
                          : 'Seleccione primero la carrera'
                      }
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
                        {...commonElegiblesProps}
                        mode="multiple"
                        options={integranteOptions}
                        placeholder={
                          carreraSeleccionada
                            ? 'Seleccione a los demás integrantes elegibles'
                            : 'Seleccione primero la carrera'
                        }
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
