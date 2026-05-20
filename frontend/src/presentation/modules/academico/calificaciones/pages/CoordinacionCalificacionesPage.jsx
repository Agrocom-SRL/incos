/**
 * Vista general de coordinación — docentes con cursos en la gestión vigente.
 */

import { Alert, Button, Input, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useVistaAdminDocentes } from '@application-academico/calificaciones/hooks/useVistaAdminDocentes.js';
import {
  docenteCursosPath,
  POLITICA_INSTITUCIONAL_PATH,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CalificacionesAcciones, {
  AccionPoliticaInstitucional,
} from '../components/CalificacionesAcciones.jsx';
import '../styles/calificaciones.css';

const { Text } = Typography;

const CoordinacionCalificacionesPage = () => {
  const navigate = useNavigate();
  const {
    docentes,
    gestionVigente,
    bimestreVigente,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    busquedaInput,
    setBusquedaInput,
    esBusquedaActiva,
    busquedaMinChars,
    prelimLimit,
  } = useVistaAdminDocentes();

  const columnas = [
    {
      title: 'Docente',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre) => <strong>{nombre}</strong>,
    },
    {
      title: 'Especialidad',
      dataIndex: 'especialidad',
      key: 'especialidad',
      render: (v) => v ?? '—',
    },
    {
      title: 'Cursos',
      dataIndex: 'cantidadCursos',
      key: 'cantidadCursos',
      align: 'center',
      width: 100,
    },
    {
      title: '',
      key: 'accion',
      width: 140,
      render: (_, row) => (
        <Button type="primary" size="small" onClick={() => navigate(docenteCursosPath(row.id))}>
          Ver cursos
        </Button>
      ),
    },
  ];

  const header = (
    <PageHeader title="Coordinación de calificaciones" breadcrumbItems={breadcrumbItems} />
  );

  const contextoGestion = gestionVigente ?? '—';
  const contextoBimestre = bimestreVigente != null ? String(bimestreVigente) : '—';

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-docentes-admin sd">
        <CalificacionesAcciones className="cal-acciones--end">
          <AccionPoliticaInstitucional to={POLITICA_INSTITUCIONAL_PATH} />
        </CalificacionesAcciones>

        <Alert
          type="info"
          showIcon
          title="Coordinación"
          description={
            <p style={{ margin: 0 }}>
              Gestión <strong>{contextoGestion}</strong> · Bimestre vigente <strong>{contextoBimestre}</strong>
              {' — '}
              Docentes con cursos que tienen estudiantes matriculados (inscritos o cursando). Elegí un docente para
              revisar sus cursos y abrir el cuaderno de notas.
            </p>
          }
          style={{ marginBottom: 16 }}
        />

        <div className="sd-card">
          <div className="sd-card__head sd-card__head--cabecera">
            <span className="sd-card__title">Docentes</span>
          </div>
          <div className="sd-card__body" style={{ display: 'block', padding: '16px 20px' }}>
            <Input.Search
              allowClear
              placeholder="Nombre o especialidad del docente…"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              loading={isLoading}
              className="cal-docentes-admin__busqueda"
              style={{ maxWidth: 480, marginBottom: 12 }}
            />

            {error ? (
              <Alert
                type="error"
                showIcon
                message="No se pudo cargar el listado"
                description={String(error)}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
                style={{ marginBottom: 12 }}
              />
            ) : null}

            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              {esBusquedaActiva
                ? `Búsqueda por nombre o especialidad. Escriba menos de ${busquedaMinChars} caracteres para volver a la muestra inicial.`
                : `Muestra de hasta ${prelimLimit} docentes con más cursos activos. Escriba al menos ${busquedaMinChars} caracteres para buscar en todo el listado.`}
            </Text>

            <Table
              rowKey="id"
              loading={isLoading}
              columns={columnas}
              dataSource={docentes}
              pagination={
                esBusquedaActiva
                  ? { pageSize: 10, showSizeChanger: true, hideOnSinglePage: true }
                  : { pageSize: prelimLimit, hideOnSinglePage: true }
              }
              className="cal-docentes-admin__table"
              locale={{
                emptyText: error
                  ? String(error)
                  : isLoading
                    ? 'Cargando…'
                    : 'Sin docentes con cursos matriculados en la gestión vigente.',
              }}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default CoordinacionCalificacionesPage;
