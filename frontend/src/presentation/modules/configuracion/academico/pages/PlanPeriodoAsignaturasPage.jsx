/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan.
 * Se alcanza desde el lápiz de columna del documento en `PlanDetailPage.jsx`
 * (`onEditarPeriodo` → `planPeriodoAsignaturasPath`). Tres cuadros:
 *
 *   Catálogo de materias — TODAS las materias activas, filtrables por
 *   clasificación (pill-select). Una materia libre se arrastra al periodo;
 *   una ya asignada a un año ANTERIOR (badge con el año) se arrastra a la
 *   fila de prerrequisitos de una asignatura. Sin botones «+» ni modales.
 *
 *   Asignaturas del periodo — una fila por asignatura del borrador (chip
 *   sigla+nombre, celda de horas estilo cuaderno de calificaciones, quitar)
 *   y una fila de total de horas del periodo al pie.
 *
 *   Prerrequisitos — se muestra solo si hay años anteriores: una fila por
 *   asignatura del periodo con su slot droppable.
 *
 * TODO es borrador en memoria (`usePlanBuilder.draftFilas`); la barra
 * «Guardar cambios» aparece únicamente cuando hay cambios y recién ahí se
 * llama a los endpoints. Validaciones client-side en `utils/planBuilderRules.js`.
 */

import { useMemo, useState } from 'react';
import { App, Alert, Button, Empty, Flex, Popconfirm, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, InboxOutlined, SaveOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useAuthContext } from '@application-auth';
import { usePlanBuilder } from '@application-configuracion/academico/hooks';
import {
  PLAN_ASIGNATURAS_PERMISO,
  PLAN_PERIODOS_PERMISO,
  PLAN_PRERREQUISITOS_PERMISO,
} from '@application-configuracion/academico/config/planEstudioPermisos';
import MateriaCatalogoChip from '@configuracion/academico/components/atoms/MateriaCatalogoChip';
import PlanPeriodoAsignaturaRow from '@configuracion/academico/components/molecules/PlanPeriodoAsignaturaRow';
import PlanPrerrequisitoRow from '@configuracion/academico/components/molecules/PlanPrerrequisitoRow';
import MateriaClasificacionFilter from '@configuracion/academico/components/molecules/MateriaClasificacionFilter';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';
import '../styles/plan-builder.css';

const { Text } = Typography;

const SIN_CLASIFICACION = 'Sin clasificación';

/** Droppable del Flujo A — zona única «soltar aquí para agregar al periodo». */
const PeriodoDropZone = ({ disabled, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'periodo-drop-zone',
    data: { type: 'periodo-zone' },
    disabled,
  });
  return (
    <div
      ref={setNodeRef}
      className={`cfg-plan-builder__dropzone${isOver && !disabled ? ' cfg-plan-builder__dropzone--over' : ''}`}
    >
      {children}
    </div>
  );
};

const PlanPeriodoAsignaturasPage = () => {
  const { notification, modal } = App.useApp();
  const { hasPermiso } = useAuthContext();
  const puedeCrearAsignatura = hasPermiso(PLAN_ASIGNATURAS_PERMISO, 'CREAR');
  const puedeEliminarAsignatura = hasPermiso(PLAN_ASIGNATURAS_PERMISO, 'ELIMINAR');
  const puedeCrearPrerrequisito = hasPermiso(PLAN_PRERREQUISITOS_PERMISO, 'CREAR');

  const {
    periodoActual,
    periodoNombre,
    periodoNoEncontrado,
    tienePeriodosAnteriores,
    materiasCatalogo,
    materiasLoading,
    draftFilas,
    hayCambios,
    horasAsignadas,
    horasSemana,
    horasDisponibles,
    breadcrumbItems,
    loading,
    error,
    isInvalidId,
    guardando,
    agregarMateria,
    quitarFila,
    cambiarHoras,
    agregarPrerrequisito,
    quitarPrerrequisito,
    descartarCambios,
    guardarCambios,
    handleVolver,
    handleEliminarPeriodo,
  } = usePlanBuilder();

  const [activeDrag, setActiveDrag] = useState(null);
  const [clasificacionFiltro, setClasificacionFiltro] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const clasificaciones = useMemo(() => {
    const set = new Set(materiasCatalogo.map((m) => m.clasificacion || SIN_CLASIFICACION));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [materiasCatalogo]);

  /** Catálogo visible: fuera las que ya están en el borrador del periodo. */
  const materiasFiltradas = useMemo(() => {
    const visibles = materiasCatalogo.filter((m) => !m.enPeriodoActual);
    if (!clasificacionFiltro) return visibles;
    return visibles.filter((m) => (m.clasificacion || SIN_CLASIFICACION) === clasificacionFiltro);
  }, [materiasCatalogo, clasificacionFiltro]);

  /** Una materia solo se puede arrastrar si sirve para algo en este periodo. */
  const puedeArrastrar = (materia) => {
    if (materia.asignadaEn) return materia.esPrerrequisitoValido && puedeCrearPrerrequisito;
    return puedeCrearAsignatura;
  };

  // -----------------------------------------------------------------------
  // dnd-kit — DndContext raíz
  // -----------------------------------------------------------------------

  const handleDragStart = (event) => {
    setActiveDrag(event.active.data.current ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const materia = active.data.current?.materia;
    const overData = over.data.current;
    if (!materia || !overData) return;

    if (overData.type === 'periodo-zone') {
      if (materia.asignadaEn) {
        notification.warning({
          title: 'Materia ya asignada',
          description: `${materia.sigla ?? materia.nombre} ya pertenece a ${materia.asignadaEn.periodoNombre}.`,
        });
        return;
      }
      agregarMateria(materia);
      return;
    }

    if (overData.type === 'prereq-slot') {
      agregarPrerrequisito(overData.filaKey, materia);
    }
  };

  const confirmarVolver = () => {
    if (!hayCambios) {
      handleVolver();
      return;
    }
    modal.confirm({
      title: 'Cambios sin guardar',
      content: 'Si vuelves ahora se perderán los cambios del periodo.',
      okText: 'Salir sin guardar',
      cancelText: 'Seguir editando',
      okButtonProps: { danger: true },
      onOk: handleVolver,
    });
  };

  const headerActions = <BackButton icon={<ArrowLeftOutlined />} onClick={confirmarVolver} />;

  if (isInvalidId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Asignaturas del periodo" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="error" showIcon title="Identificador de plan o periodo inválido" />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={periodoNombre ? `Asignaturas — ${periodoNombre}` : 'Asignaturas del periodo'}
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        </PageHeaderArea>

        <DashboardPageShell>
          <MainContent>
            <Spin spinning={loading} tip="Cargando plan de estudio…">
              {error ? <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} /> : null}

              {!loading && periodoNoEncontrado ? (
                <Empty description="Este periodo ya no existe en el plan" />
              ) : null}

              {periodoActual ? (
                <section className="cfg-academico-workspace cfg-plan-builder">
                  <header className="cfg-academico-workspace__header">
                    <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                      <Text strong className="cfg-plan-builder__periodo-title">
                        {periodoNombre}
                      </Text>
                      <Popconfirm
                        title="Eliminar periodo"
                        description="Se eliminará el periodo y debe estar sin asignaturas. ¿Continuar?"
                        okText="Eliminar"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancelar"
                        onConfirm={handleEliminarPeriodo}
                      >
                        <ActionButton
                          permiso={PLAN_PERIODOS_PERMISO}
                          accion="ELIMINAR"
                          variant="danger"
                          size="small"
                          icon={<DeleteOutlined />}
                        >
                          Eliminar periodo
                        </ActionButton>
                      </Popconfirm>
                    </Flex>
                    <Text type="secondary" className="cfg-academico-workspace__desc">
                      Arrastra materias del catálogo hacia el periodo.
                      {tienePeriodosAnteriores
                        ? ' Para un prerrequisito, arrastra una materia de un año anterior (con etiqueta de año) hacia la fila de la asignatura.'
                        : ''}
                      {' '}Los cambios se aplican al presionar «Guardar cambios».
                    </Text>
                  </header>

                  <div
                    className={`cfg-plan-builder__grid${
                      tienePeriodosAnteriores ? '' : ' cfg-plan-builder__grid--sin-prereqs'
                    }`}
                  >
                    <DetailInfoCard title="Catálogo de materias" cols={1} className="cfg-plan-builder__col">
                      <MateriaClasificacionFilter
                        clasificaciones={clasificaciones}
                        value={clasificacionFiltro}
                        onChange={setClasificacionFiltro}
                      />
                      {materiasLoading ? (
                        <Spin size="small" />
                      ) : materiasFiltradas.length === 0 ? (
                        <Empty description="Sin materias disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div className="cfg-plan-builder__chip-list">
                          {materiasFiltradas.map((materia) => (
                            <MateriaCatalogoChip
                              key={materia.id}
                              materia={materia}
                              disabled={!puedeArrastrar(materia)}
                            />
                          ))}
                        </div>
                      )}
                    </DetailInfoCard>

                    <DetailInfoCard
                      title="Asignaturas del periodo"
                      cols={1}
                      className="cfg-plan-builder__col cfg-plan-builder__col--main"
                    >
                      <PeriodoDropZone disabled={!puedeCrearAsignatura}>
                        {draftFilas.length === 0 ? (
                          <div className="cfg-plan-builder__placeholder">
                            <InboxOutlined aria-hidden />
                            <span>Arrastra aquí una materia del catálogo</span>
                          </div>
                        ) : (
                          <div className="cfg-plan-builder__rows">
                            {draftFilas.map((fila) => (
                              <PlanPeriodoAsignaturaRow
                                key={fila.key}
                                fila={fila}
                                horasDisponibles={horasDisponibles}
                                puedeEditar={puedeCrearAsignatura}
                                puedeEliminar={puedeEliminarAsignatura}
                                onCambiarHoras={cambiarHoras}
                                onQuitar={quitarFila}
                              />
                            ))}
                          </div>
                        )}
                      </PeriodoDropZone>
                      <div
                        className={`cfg-plan-builder__total${
                          horasDisponibles < 0 ? ' cfg-plan-builder__total--excedido' : ''
                        }`}
                      >
                        <span className="cfg-plan-builder__total-label">Horas semanales</span>
                        <span className="cfg-plan-builder__total-valor">
                          {horasAsignadas} / {horasSemana ?? '—'}
                        </span>
                      </div>
                    </DetailInfoCard>

                    {tienePeriodosAnteriores ? (
                      <DetailInfoCard title="Prerrequisitos" cols={1} className="cfg-plan-builder__col">
                        {draftFilas.length === 0 ? (
                          <Empty
                            description="Agrega asignaturas al periodo"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <div className="cfg-plan-builder__prereq-rows">
                            {draftFilas.map((fila) => (
                              <PlanPrerrequisitoRow
                                key={fila.key}
                                fila={fila}
                                disabled={!puedeCrearPrerrequisito}
                                onEliminar={(prereqKey) => quitarPrerrequisito(fila.key, prereqKey)}
                              />
                            ))}
                          </div>
                        )}
                      </DetailInfoCard>
                    ) : null}
                  </div>

                  {hayCambios ? (
                    <footer className="cfg-plan-builder__savebar">
                      <Text type="secondary">Tienes cambios sin guardar</Text>
                      <Flex gap={8}>
                        <Button onClick={descartarCambios} disabled={guardando}>
                          Descartar
                        </Button>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          loading={guardando}
                          onClick={guardarCambios}
                        >
                          Guardar cambios
                        </Button>
                      </Flex>
                    </footer>
                  ) : null}
                </section>
              ) : null}
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>

      <DragOverlay>
        {activeDrag?.materia ? (
          <div className="cfg-plan-builder-chip cfg-plan-builder-chip--catalogo cfg-plan-builder-chip--overlay">
            <span className="cfg-plan-builder-chip__sigla">{activeDrag.materia.sigla || '—'}</span>
            <span className="cfg-plan-builder-chip__nombre">{activeDrag.materia.nombre}</span>
            {activeDrag.materia.asignadaEn ? (
              <span className="cfg-plan-builder-chip__badge">{activeDrag.materia.asignadaEn.periodoNombre}</span>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PlanPeriodoAsignaturasPage;
