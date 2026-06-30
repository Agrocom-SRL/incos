/**
 * MiMatriculaPage — variante del estudiante para el ítem de menú "Matrículas".
 *
 * Patrón wrapper por rol: cuando entra un ESTUDIANTE, en vez de la lista admin
 * de inscripciones se muestran SUS materias matriculadas + su horario semanal
 * (grilla reutilizada de inscripción, SOLO LECTURA, sin descargas).
 * Datos: GET /v1/estudiantes/mi-matricula (estudiante resuelto en servidor).
 */

import { useMemo } from 'react';
import { Alert, Empty, Spin, Table, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import { useMiMatricula } from '@application-inscripciones/hooks/state/useMiMatricula.js';
import InscripcionHorariosTab from '@matricula/components/organisms/InscripcionHorariosTab.jsx';

const materiasColumns = [
  { title: 'Sigla', dataIndex: 'asignaturaSigla', key: 'asignaturaSigla', width: 120 },
  { title: 'Asignatura', dataIndex: 'asignaturaNombre', key: 'asignaturaNombre' },
  {
    title: 'Docente',
    dataIndex: 'docenteNombre',
    key: 'docenteNombre',
    render: (v) => v || '—',
  },
];

export default function MiMatriculaPage() {
  const {
    gestion,
    carrera,
    materias,
    courseSchedules,
    gridRangeInscripcion,
    sabadoRangeInscripcion,
    loading,
    error,
  } = useMiMatricula(true);

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Matrícula' }, { title: 'Mi matrícula' }],
    [],
  );

  const dataSource = useMemo(
    () => (materias || []).map((m, i) => ({ key: `${m.asignaturaSigla}-${i}`, ...m })),
    [materias],
  );

  return (
    <PageTemplate header={<PageHeader title="Mi matrícula" breadcrumbItems={breadcrumbItems} />}>
      {loading ? (
        <Spin spinning tip="Cargando tu matrícula…">
          <div style={{ minHeight: 160 }} aria-hidden />
        </Spin>
      ) : error ? (
        <Alert type="warning" showIcon title="No se pudo cargar tu matrícula" description={error} />
      ) : !materias?.length && !courseSchedules?.length ? (
        <Empty description="Aún no tienes una matrícula registrada en la gestión vigente." />
      ) : (
        <>
          <DetailInfoCard title="Mi inscripción" icon={<BookOutlined />} cols={2}>
            <DetailField label="Carrera">{carrera?.nombre || '—'}</DetailField>
            <DetailField label="Gestión">
              {gestion ? (
                <Tag color="green">
                  {gestion.nombre || gestion.anio || gestion.id}
                </Tag>
              ) : (
                '—'
              )}
            </DetailField>
          </DetailInfoCard>

          <DetailInfoCard title="Materias matriculadas" icon={<BookOutlined />} cols={1}>
            <Table
              columns={materiasColumns}
              dataSource={dataSource}
              size="small"
              pagination={false}
              locale={{ emptyText: 'Sin materias matriculadas' }}
            />
          </DetailInfoCard>

          <InscripcionHorariosTab
            courseSchedules={courseSchedules}
            gridRangeInscripcion={gridRangeInscripcion}
            sabadoRangeInscripcion={sabadoRangeInscripcion}
          />
        </>
      )}
    </PageTemplate>
  );
}
