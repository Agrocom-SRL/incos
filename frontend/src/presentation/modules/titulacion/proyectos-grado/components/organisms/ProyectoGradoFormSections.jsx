/**
 * Formulario ABM de proyecto de grado — workspace alineado a CFG Académico.
 * Gemelo de `CursoCapacitacionFormSections` (CAP): UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections`) con "Estudiantes del proyecto" como
 * PRIMERA sección (2026-08-10: al elegir al titular se resuelve la carrera,
 * así que va antes que "Datos del proyecto") y "Datos del proyecto" como
 * segunda.
 *
 * 2026-08-10: la sección de estudiantes busca entre TODOS los estudiantes
 * (`useBuscarEstudiantesTit`, `GET /estudiantes/search`, mismo buscador que
 * `AgregarIntegranteModal`/Pasantías) — ya no se restringe a elegibles de
 * 3er año. Búsqueda EN SERVIDOR (`onSearch` + `filterOption={false}`,
 * debounced en el hook), no filtro en cliente. El `FormField` genérico no
 * cubre este comportamiento, por eso los `Form.Item` viven aquí como JSX del
 * organismo (mismo criterio que el `tagRender` de CAP). Solo la modalidad
 * PSP (grupal) muestra el multi-select de integrantes.
 */

import { Col, Form, Row, Select, Spin, Typography } from 'antd';
import { CfgFormWorkspace } from '@organisms';

const { Text } = Typography;

const notFoundContent = (cargando) =>
  cargando ? (
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
  buscarEstudiantes,
  onEstudianteChange,
  footer = null,
}) => {
  const { datosProyecto } = formSections ?? {};

  // El titular elegido se excluye del multi-select de integrantes.
  const titularId = Form.useWatch('estudianteId', form);
  const integranteOptions = estudianteOptions.filter((o) => o.value !== titularId);

  if (!datosProyecto?.fields?.length) {
    return null;
  }

  const commonBusquedaProps = {
    showSearch: true,
    filterOption: false,
    onSearch: buscarEstudiantes,
    loading: buscandoEstudiantes,
    notFoundContent: notFoundContent(buscandoEstudiantes),
    options: estudianteOptions,
  };

  return (
    <CfgFormWorkspace
      title="Proyecto de grado"
      form={form}
      footer={footer}
      sections={[
        {
          key: 'estudiantes',
          title: 'Estudiantes del proyecto',
          description: modalidadGrupal
            ? 'Modalidad grupal (PSP): registre al titular responsable y agregue a los demás integrantes del grupo. Al elegir al titular, la carrera se autocompleta con su carrera vigente.'
            : 'Registre al estudiante titular del proyecto. Al elegirlo, la carrera se autocompleta con su carrera vigente.',
          fields: [],
          children: (
            <>
              <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
                <Col xs={24} md={12}>
                  <Form.Item
                    name="estudianteId"
                    label="Estudiante titular"
                    rules={[{ required: true, message: 'Seleccione al estudiante titular' }]}
                  >
                    <Select
                      {...commonBusquedaProps}
                      allowClear
                      onChange={onEstudianteChange}
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
                        {...commonBusquedaProps}
                        mode="multiple"
                        options={integranteOptions}
                        placeholder="Busque por nombre o C.I."
                      />
                    </Form.Item>
                  </Col>
                ) : null}
              </Row>
            </>
          ),
        },
        {
          key: 'datosProyecto',
          title: datosProyecto.title,
          description: datosProyecto.description,
          fields: datosProyecto.fields,
        },
      ]}
    />
  );
};

export default ProyectoGradoFormSections;
