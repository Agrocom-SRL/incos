/**
 * Tab «Planes de estudio» — listado de planes con acceso al detalle (matriz).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Table, Tag } from 'antd';
import { useAuthContext } from '@application-auth';
import { useCarrerasApi, usePlanesEstudiosApi } from '@application-configuracion/academico/hooks';
import { planDetallePath } from '@application-configuracion/academico/config/paths';

const PlanesTabPanel = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();
  const { carreras = [], loading: loadingCarreras } = useCarrerasApi();
  const { planes, loading, error, refetch } = usePlanesEstudiosApi();

  const puedeGestionarPlan = hasPermiso('configuracion.plan-estudio', 'DETALLE');

  const carreraPorId = useMemo(() => {
    const map = new Map();
    carreras.forEach((c) => map.set(c.id, c));
    return map;
  }, [carreras]);

  const columns = [
    {
      title: 'Carrera',
      key: 'carrera',
      render: (_, row) => {
        const c = carreraPorId.get(row.carrera_id);
        return c ? `${c.codigo ?? ''} ${c.nombre ?? ''}`.trim() : row.carrera_id ?? '—';
      },
    },
    { title: 'Plan', dataIndex: 'nombre_plan', key: 'nombre_plan' },
    {
      title: 'Resolución',
      dataIndex: 'resolucion_ministerial',
      key: 'resolucion',
      ellipsis: true,
    },
    {
      title: 'Vigente',
      dataIndex: 'vigente',
      key: 'vigente',
      width: 100,
      render: (v) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'Vigente' : 'Histórico'}</Tag>
      ),
    },
    { title: 'Hrs/sem', dataIndex: 'horas_semana', key: 'horas_semana', width: 90 },
    {
      title: '',
      key: 'acciones',
      width: 140,
      render: (_, row) =>
        puedeGestionarPlan ? (
          <Button type="link" onClick={() => navigate(planDetallePath(row.id))}>
            Gestionar plan
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Gestión por plan"
        description="Seleccione un plan para editar la matriz por periodos, asignaturas y prerrequisitos en la vista de detalle."
      />
      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={planes}
        loading={loading || loadingCarreras}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{ emptyText: 'No hay planes de estudio registrados' }}
      />
    </>
  );
};

export default PlanesTabPanel;
