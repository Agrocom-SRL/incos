/**
 * Tab prerrequisitos — selector de asignatura + dependencias.
 */

import { Alert, Flex, Select, Spin, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { usePlanPrerrequisitosPanel } from '@application-configuracion/academico/hooks';

const PlanPrerrequisitosTab = ({ planId, asignaturaCatalog, api }) => {
  const {
    asignaturaId,
    setAsignaturaId,
    prerrequisitos,
    esPrerrequisitoDe,
    loading,
    opcionesPrerrequisito,
    nuevoPrerrequisitoId,
    setNuevoPrerrequisitoId,
    addingId,
    handleAgregar,
    handleEliminar,
    labelForAsignatura,
    asignaturaOptions,
  } = usePlanPrerrequisitosPanel({ planId, asignaturaCatalog, api });

  const columnsReq = [
    {
      title: 'Prerrequisito (debe cursar antes)',
      key: 'prer',
      render: (_, row) => labelForAsignatura(row.prerrequisito_id),
    },
    {
      title: '',
      key: 'acc',
      width: 80,
      render: (_, row) => (
        <ActionButton
          permiso="configuracion.plan-estudio.prerrequisitos"
          accion="ELIMINAR"
          variant="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleEliminar(row.id)}
        />
      ),
    },
  ];

  const columnsDe = [
    {
      title: 'Asignaturas que requieren esta materia',
      key: 'dep',
      render: (_, row) => labelForAsignatura(row.asignatura_id),
    },
  ];

  if (!asignaturaCatalog?.length) {
    return (
      <Alert
        type="info"
        showIcon
        message="Sin asignaturas en el plan"
        description="Agregue asignaturas a la matriz antes de definir prerrequisitos."
      />
    );
  }

  return (
    <Flex vertical gap="large">
      <Alert
        type="info"
        showIcon
        message="Prerrequisitos por asignatura del plan"
        description="El prerrequisito debe pertenecer a un periodo anterior al de la asignatura seleccionada."
      />

      <div>
        <label htmlFor="cfg-prer-asig" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Asignatura del plan
        </label>
        <Select
          id="cfg-prer-asig"
          showSearch
          optionFilterProp="label"
          placeholder="Seleccione una asignatura…"
          style={{ width: '100%', maxWidth: 560 }}
          options={asignaturaOptions}
          value={asignaturaId}
          onChange={setAsignaturaId}
        />
      </div>

      {asignaturaId ? (
        <Spin spinning={loading}>
          <Flex vertical gap="middle">
            <div>
              <Flex gap={8} wrap="wrap" align="center" style={{ marginBottom: 12 }}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Agregar prerrequisito…"
                  style={{ minWidth: 280, flex: 1 }}
                  options={opcionesPrerrequisito}
                  value={nuevoPrerrequisitoId}
                  onChange={setNuevoPrerrequisitoId}
                  allowClear
                />
                <ActionButton
                  permiso="configuracion.plan-estudio.prerrequisitos"
                  accion="CREAR"
                  variant="primary"
                  icon={<PlusOutlined />}
                  loading={Boolean(addingId)}
                  onClick={handleAgregar}
                >
                  Agregar
                </ActionButton>
              </Flex>
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                columns={columnsReq}
                dataSource={prerrequisitos}
                locale={{ emptyText: 'Sin prerrequisitos definidos' }}
              />
            </div>

            <div>
              <h4 style={{ marginBottom: 8 }}>Es prerrequisito de</h4>
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                columns={columnsDe}
                dataSource={esPrerrequisitoDe}
                locale={{ emptyText: 'Ninguna asignatura depende de esta' }}
              />
            </div>
          </Flex>
        </Spin>
      ) : (
        <Alert type="warning" showIcon message="Seleccione una asignatura para ver y editar sus prerrequisitos." />
      )}
    </Flex>
  );
};

export default PlanPrerrequisitosTab;
