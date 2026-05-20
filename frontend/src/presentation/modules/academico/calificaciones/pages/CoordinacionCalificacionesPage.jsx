/**
 * Vista general de coordinación — docentes con cursos en la gestión vigente.
 */

import { Alert, Button, Input, Table } from 'antd';
import { useMemo, useState } from 'react';
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

const CoordinacionCalificacionesPage = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const { docentes, gestionVigente, bimestreVigente, isLoading, error, refetch, breadcrumbItems } =
    useVistaAdminDocentes();

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return docentes;
    return docentes.filter(
      (d) =>
        d.nombre.toLowerCase().includes(q) ||
        d.especialidad?.toLowerCase().includes(q),
    );
  }, [docentes, busqueda]);

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

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-docentes-admin sd">
        <CalificacionesAcciones className="cal-acciones--end">
          <AccionPoliticaInstitucional to={POLITICA_INSTITUCIONAL_PATH} />
        </CalificacionesAcciones>

        <p className="cal-docentes-admin__contexto">
          Gestión <strong>{gestionVigente}</strong> · Bimestre vigente <strong>{bimestreVigente}</strong>
          {' — '}
          Elegí un docente para revisar sus cursos y abrir el cuaderno de notas.
        </p>

        <Input.Search
          placeholder="Buscar por nombre o especialidad"
          allowClear
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="cal-docentes-admin__busqueda"
        />

        {error ? (
          <Alert
            type="error"
            showIcon
            message="No se pudo cargar el listado"
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Table
          rowKey="id"
          loading={isLoading}
          columns={columnas}
          dataSource={filtrados}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          className="cal-docentes-admin__table"
        />
      </div>
    </PageTemplate>
  );
};

export default CoordinacionCalificacionesPage;
