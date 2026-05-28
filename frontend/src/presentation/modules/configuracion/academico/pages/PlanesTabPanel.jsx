/**
 * Tab «Planes de estudio» — listado de planes con acceso al detalle (matriz).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Tag } from 'antd';
import { useAuthContext } from '@application-auth';
import { TableListView } from '@organisms';
import { Text } from '@atoms';
import { TableActions, TableCell } from '@molecules';
import { useTableData } from '@molecules';
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

  const getSearchFields = useMemo(
    () => (plan) => {
      const carrera = carreraPorId.get(plan.carrera_id);
      const carreraLabel = carrera ? `${carrera.codigo ?? ''} ${carrera.nombre ?? ''}`.trim() : '';
      return [plan.nombre_plan, plan.resolucion_ministerial, carreraLabel].filter(Boolean);
    },
    [carreraPorId],
  );

  const { searchText, setSearchText, filteredData } = useTableData(planes || [], getSearchFields);

  const columns = useMemo(() => [
    {
      title: 'Carrera',
      key: 'carrera',
      ellipsis: true,
      render: (_, row) => {
        const c = carreraPorId.get(row.carrera_id);
        return (
          <TableCell strong fallback="—">
            {c ? `${c.codigo ?? ''} ${c.nombre ?? ''}`.trim() : row.carrera_id ?? '—'}
          </TableCell>
        );
      },
    },
    {
      title: 'Plan',
      dataIndex: 'nombre_plan',
      key: 'nombre_plan',
      ellipsis: true,
      render: (v) => (
        <TableCell strong fallback="—">
          {v}
        </TableCell>
      ),
    },
    {
      title: 'Resolución',
      dataIndex: 'resolucion_ministerial',
      key: 'resolucion',
      ellipsis: true,
      render: (v) => (
        <TableCell fallback="—">
          <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
            {v || '—'}
          </Text>
        </TableCell>
      ),
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
    {
      title: 'Hrs/sem',
      dataIndex: 'horas_semana',
      key: 'horas_semana',
      width: 90,
      align: 'right',
      render: (v) => <TableCell align="right">{v ?? '—'}</TableCell>,
    },
    {
      title: '',
      key: 'acciones',
      width: 140,
      align: 'right',
      render: (_, row) =>
        puedeGestionarPlan ? (
          <TableActions
            record={row}
            navigate={navigate}
            viewPath="/:id"
            onView={(r) => navigate(planDetallePath(r.id))}
            permisos={{
              ver: { codigo: 'configuracion.plan-estudio', accion: 'DETALLE' },
            }}
          />
        ) : null,
    },
  ], [carreraPorId, navigate, puedeGestionarPlan]);

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
          message={typeof error === 'string' ? error : 'Ocurrió un error al cargar planes'}
          style={{ marginBottom: 16 }}
          action={
            <ActionButton
              permiso="configuracion.plan-estudio"
              accion="LISTAR"
              variant="default"
              size="small"
              onClick={refetch}
            >
              Reintentar
            </ActionButton>
          }
        />
      )}
      <TableListView
        data={filteredData}
        loading={loading || loadingCarreras}
        error={null}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por plan, resolución o carrera..."
        columns={columns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        title="Planes de estudio"
        loadingTip="Cargando planes..."
      />
    </>
  );
};

export default PlanesTabPanel;
