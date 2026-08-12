/**
 * MisEstudiantesDocentePage — rama DOCENTE del ítem de menú Matrículas.
 *
 * Página GEMELA de `InscripcionesList` (mismo shell visual: PageHeader +
 * `section.cfg-academico-workspace` + `CarreraTabsListView` con tabs por carrera
 * y chips de segundo nivel), pero con el roster del docente autenticado:
 * un registro por estudiante+curso (`GET /docentes/mis-estudiantes`, identidad
 * resuelta en servidor) y chips por CURSO (materia · paralelo) en vez de paralelo.
 *
 * SOLO LECTURA: única acción "ver ficha" (permiso `estudiantes.ver` DETALLE,
 * fail-closed; el backend restringe a SUS estudiantes). Orquestación en
 * `useMisEstudiantesDocente` (application/inscripciones · features).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useMisEstudiantesDocente } from '@application-matricula/registro/hooks';
import { allSpacing } from '@theme/tokens';
import { createBreadcrumbItems } from '../config/breadcrumbs';
import { createMisEstudiantesDocenteColumns } from '../config/misEstudiantesDocenteColumns';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

/** Accessor de carrera del roster (campos planos de /docentes/mis-estudiantes). */
const getCarreraEstudiante = (record) => ({
  nombre: record.carreraNombre || null,
  codigo: record.carreraCodigo || null,
  colorHex: record.carreraColorHex || null,
});

/** Segundo nivel: CURSO (materia · paralelo) como chips dentro de cada carrera. */
const subGroupCurso = {
  allLabel: 'Todos',
  sinLabel: 'Sin curso',
  getSubgrupo: (record) => {
    if (record.ofertaCursoId == null && !record.materiaSigla) return null;
    return {
      id: record.ofertaCursoId ?? null,
      nombre:
        [record.materiaSigla, record.paraleloNombre].filter(Boolean).join(' · ') || 'Curso',
      // Mismo color para la misma materia en todas las carreras.
      colorKey: record.materiaSigla || null,
    };
  },
};

const MisEstudiantesDocentePage = () => {
  const navigate = useNavigate();
  const { estudiantes, totalEstudiantes, gestion, loading, error, searchText, setSearchText, refetch } =
    useMisEstudiantesDocente();

  const columns = useMemo(() => createMisEstudiantesDocenteColumns(navigate), [navigate]);
  const breadcrumbItems = useMemo(() => createBreadcrumbItems('MAT-LISTA', 'Mis estudiantes'), []);

  const rosterVacio = !loading && !error && totalEstudiantes === 0;

  return (
    <PageTemplate
      header={<PageHeader title="Mis estudiantes" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Mis estudiantes" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Estudiantes matriculados en sus cursos
              {gestion.nombre ? ` de la ${gestion.nombre}` : ' de la gestión vigente'}. Un mismo
              estudiante puede aparecer en más de un curso.
            </Paragraph>
          </header>
          {error ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar su lista de estudiantes"
              description={error}
              action={
                <Button size="small" onClick={refetch}>
                  Reintentar
                </Button>
              }
            />
          ) : rosterVacio ? (
            <div className="cfg-academico-tab-panel">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Aún no tiene estudiantes en la gestión vigente."
              />
            </div>
          ) : (
            <CarreraTabsListView
              rows={estudiantes}
              getCarrera={getCarreraEstudiante}
              subGroup={subGroupCurso}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por estudiante, código, C.I., materia..."
              columns={columns}
              rowKey={(record) => record.rowKey}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              loadingTip="Cargando estudiantes..."
            />
          )}
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default MisEstudiantesDocentePage;
