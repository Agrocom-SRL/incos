/**
 * B2 `/academico/nivelaciones/inscribir` — dos entradas (documento de diseño):
 *
 * 1) Deep-link con querystring de contexto (desde la grilla, P1 nivel 2):
 *    el Drawer se abre DIRECTO sobre la landing, en modo `crear` (si trae
 *    ancla real) o `detalle` (solo lectura, caso más común hoy — ver
 *    `nivelacionEventoContexto.js`).
 * 2) Landing SIN contexto (acceso por menú): buscador de estudiante calcado
 *    de `HistorialSelectorPage.jsx`. Al elegir un estudiante,
 *    `useNivelacionSelector` carga sus materias pendientes/arrastradas
 *    (cierre del "Gap 2" — antes mostraba un estado "próximamente"); cada
 *    fila navega con el mismo contrato de querystring que la entrada 1, ya
 *    con el ancla real (`subjectEnrollmentId` XOR `enrollmentId`+`planSubjectId`).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Empty, Flex, Spin, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView, TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { SearchBar, Text } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useNivelacionSelector } from '@application-academico/nivelaciones/hooks/useNivelacionSelector.js';
import {
  buildCrearEventoContextoParams,
  parseCrearEventoContexto,
  parseDetalleEventoContexto,
} from '@application-academico/nivelaciones/utils/nivelacionEventoContexto.js';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs';
import { createNivelacionSelectorColumns } from '../config/nivelacionSelectorColumns.jsx';
import { createMateriasPendientesEstudianteColumns } from '../config/materiasPendientesEstudianteColumns.jsx';
import EventoHistorialDrawer from '../components/EventoHistorialDrawer.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/nivelaciones.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (shape plano del listado de estudiantes). */
const getCarreraEstudiante = (record) => ({
  nombre: record.carreraNombre,
  codigo: record.carreraCodigo,
  colorHex: record.carreraColorHex,
});

const NivelacionInscribirPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    query,
    onQueryChange,
    modoBusqueda,
    estudiantesLista,
    listaLoading,
    listaError,
    tablePagination,
    resultadosBusqueda,
    busquedaLoading,
    busquedaError,
    estudianteSeleccionado,
    seleccionarEstudiante,
    limpiarSeleccion,
    materiasPendientes,
    materiasPendientesLoading,
    materiasPendientesError,
  } = useNivelacionSelector();

  const contextoCrear = parseCrearEventoContexto(searchParams);
  const contextoDetalle = !contextoCrear ? parseDetalleEventoContexto(searchParams) : null;
  const tieneContextoUrl = Boolean(contextoCrear || contextoDetalle);

  const cerrarDrawerContexto = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const onSeleccionarMateria = useCallback(
    (materia) => {
      const params = buildCrearEventoContextoParams({
        subjectEnrollmentId: materia.esAnclaDirecta ? materia.matriculaMateriaId : null,
        enrollmentId: materia.esAnclaDirecta ? null : materia.inscripcionId,
        planSubjectId: materia.esAnclaDirecta ? null : materia.asignaturaPlanId,
        estudianteNombre: estudianteSeleccionado?.nombreCompleto,
        estudianteCodigo: estudianteSeleccionado?.codigoEstudiante,
        asignaturaSigla: materia.asignaturaSigla,
        asignaturaNombre: materia.asignaturaNombre,
      });
      setSearchParams(params, { replace: false });
    },
    [estudianteSeleccionado, setSearchParams],
  );

  const columns = useMemo(
    () => createNivelacionSelectorColumns({ onSeleccionar: seleccionarEstudiante }),
    [seleccionarEstudiante],
  );

  const columnasMaterias = useMemo(
    () => createMateriasPendientesEstudianteColumns({ onSeleccionar: onSeleccionarMateria }),
    [onSeleccionarMateria],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-NIV-INSCRIBIR', 'ACA-NIV'),
    [],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Registrar evento de nivelación" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Seleccionar estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Elija un estudiante de la lista por carrera, o filtre con el buscador, para
              registrar un evento de nivelación. También puede llegar directo desde la grilla
              de un paralelo (menú Nivelaciones → Ver grilla).
            </Paragraph>
            <div className="historial-selector__buscar" style={{ maxWidth: 520 }}>
              <SearchBar
                placeholder="Buscar por nombre, código o C.I. (mín. 2 caracteres)…"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>
          </header>

          {estudianteSeleccionado ? (
            <section className="cfg-academico-workspace" style={{ marginBottom: allSpacing.marginLG }}>
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader
                  title={`Materias pendientes de ${(estudianteSeleccionado.nombreCompleto || '').toUpperCase()}`}
                />
                <Text type="secondary">
                  <a onClick={limpiarSeleccion} role="button" tabIndex={0}>
                    Elegir otro estudiante
                  </a>
                </Text>
              </header>

              <Spin spinning={materiasPendientesLoading} tip="Cargando materias pendientes…">
                {!materiasPendientesLoading && materiasPendientesError ? (
                  <Text type="danger">{materiasPendientesError}</Text>
                ) : !materiasPendientesLoading && !materiasPendientes ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Este estudiante no tiene materias pendientes o arrastradas registradas."
                  />
                ) : materiasPendientes ? (
                  <TableListView
                    embedded
                    showSearch={false}
                    data={materiasPendientes.materiasPendientes}
                    columns={columnasMaterias}
                    rowKey={(record) => `${record.asignaturaPlanId}-${record.matriculaMateriaId ?? 'arrastrada'}`}
                  />
                ) : null}
              </Spin>
            </section>
          ) : null}

          {modoBusqueda ? (
            <div className="cfg-academico-tab-panel">
              <TableListView
                embedded
                showSearch={false}
                data={resultadosBusqueda}
                loading={busquedaLoading}
                error={busquedaError}
                columns={columns}
                rowKey={(record) => record.id}
                loadingTip="Buscando estudiantes..."
              />
            </div>
          ) : (
            <CarreraTabsListView
              rows={estudiantesLista}
              getCarrera={getCarreraEstudiante}
              loading={listaLoading}
              error={listaError}
              showSearch={false}
              columns={columns}
              rowKey={(record) => record.id}
              pagination={tablePagination}
              defaultSort={{ field: 'estudiante', order: 'ascend' }}
              loadingTip="Cargando estudiantes..."
            />
          )}
        </section>
      </Flex>

      <EventoHistorialDrawer
        abierto={tieneContextoUrl}
        modo={contextoCrear ? 'crear' : 'detalle'}
        contexto={contextoCrear?.contexto ?? contextoDetalle}
        ancla={contextoCrear?.ancla}
        detalle={contextoDetalle}
        onCerrar={cerrarDrawerContexto}
      />
    </PageTemplate>
  );
};

export default NivelacionInscribirPage;
