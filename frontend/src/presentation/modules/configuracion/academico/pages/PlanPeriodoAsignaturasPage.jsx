/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan.
 * Se alcanza desde el lápiz de columna del documento en `PlanDetailPage.jsx`
 * (`onEditarPeriodo` → `planPeriodoAsignaturasPath`). Tres columnas:
 *
 *   Catálogo de materias — filtrable por clasificación; excluye materias ya
 *   asignadas a CUALQUIER periodo del plan (no solo el actual, ver
 *   `usePlanBuilder.materiasDisponibles`). Arrastrar una `MateriaCatalogoChip`
 *   hacia el periodo (o su botón «+») la agrega de inmediato con una carga
 *   horaria por defecto, sin modal — las horas se ajustan en línea en la fila.
 *
 *   Periodo en edición — una fila por asignatura ya colocada (materia, horas
 *   editables en línea, celda «PRE-REQUISITO», editar/eliminar).
 *
 *   Periodos anteriores (panel colapsable) — única fuente de arrastre para el
 *   prerrequisito cross-periodo: arrastrar una `PlanBuilderAsignaturaChip`
 *   hacia el `PlanBuilderPrerrequisitoSlot` de una fila (o su botón «+»).
 *
 * Fallback sin drag (accesibilidad/teclado): el botón «+» de cada materia del
 * catálogo y el «+» de cada slot de prerrequisito realizan la misma acción
 * que el drop correspondiente. Todas las validaciones de negocio (cupo de
 * horas, periodo anterior) son SOLO client-side — ver `utils/planBuilderRules.js`.
 */

import { useMemo, useState } from 'react';
import { App, Alert, Empty, Flex, InputNumber, Popconfirm, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
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
import PlanBuilderAsignaturaChip from '@configuracion/academico/components/atoms/PlanBuilderAsignaturaChip';
import PlanBuilderPrerrequisitoSlot from '@configuracion/academico/components/molecules/PlanBuilderPrerrequisitoSlot';
import MateriaClasificacionFilter from '@configuracion/academico/components/molecules/MateriaClasificacionFilter';
import PeriodosAnterioresPanel from '@configuracion/academico/components/molecules/PeriodosAnterioresPanel';
import AsignaturaPlanFormModal from '@configuracion/academico/components/molecules/AsignaturaPlanFormModal';
import PrerrequisitoFormModal from '@configuracion/academico/components/molecules/PrerrequisitoFormModal';
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
  const { notification } = App.useApp();
  const { hasPermiso } = useAuthContext();
  const puedeCrearAsignatura = hasPermiso(PLAN_ASIGNATURAS_PERMISO, 'CREAR');
  const puedeCrearPrerrequisito = hasPermiso(PLAN_PRERREQUISITOS_PERMISO, 'CREAR');

  const {
    plan,
    periodoActual,
    periodoNoEncontrado,
    gruposPeriodosAnteriores,
    asignaturaLabelById,
    materiasDisponibles,
    materiasLoading,
    horasDisponibles,
    prerrequisitosDe,
    puedeSerPrerrequisito,
    breadcrumbItems,
    loading,
    error,
    isInvalidId,
    guardando,
    handleVolver,
    handleEliminarPeriodo,
    handleCrearAsignatura,
    handleActualizarAsignatura,
    handleEliminarAsignatura,
    handleCrearPrerrequisito,
    handleEliminarPrerrequisito,
  } = usePlanBuilder();

  const [editModal, setEditModal] = useState(null);
  const [prerrequisitoModal, setPrerrequisitoModal] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [clasificacionFiltro, setClasificacionFiltro] = useState(null);
  const [horasEdit, setHorasEdit] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const periodoNombre = periodoActual ? periodoActual.nombre || `Año ${periodoActual.numero}` : '';

  const clasificaciones = useMemo(() => {
    const set = new Set(materiasDisponibles.map((m) => m.clasificacion || SIN_CLASIFICACION));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [materiasDisponibles]);

  const materiasFiltradas = useMemo(() => {
    if (!clasificacionFiltro) return materiasDisponibles;
    return materiasDisponibles.filter((m) => (m.clasificacion || SIN_CLASIFICACION) === clasificacionFiltro);
  }, [materiasDisponibles, clasificacionFiltro]);

  const abrirEditarAsignatura = (asignatura) =>
    setEditModal({
      asignaturaId: asignatura.id,
      initialValues: { horasSemanales: asignatura.horas_semanales, modalidad: asignatura.modalidad },
      materiaLabel: asignatura.materia?.sigla
        ? `${asignatura.materia.sigla} — ${asignatura.materia.nombre}`
        : asignatura.materia?.nombre,
    });
  const cerrarEditModal = () => setEditModal(null);

  const handleSubmitEdit = async (payload) => {
    const ok = await handleActualizarAsignatura(editModal.asignaturaId, payload);
    if (ok) cerrarEditModal();
    return ok;
  };

  /** Alta directa (drag o click «+») — misma acción, sin modal; horas por defecto editables en línea. */
  const crearAsignaturaConDefault = (materia) => {
    if (horasDisponibles <= 0) {
      notification.warning({
        title: 'Sin cupo de horas',
        description: `${periodoNombre} ya usa las ${plan?.horasSemana ?? '—'} h/semana del plan.`,
      });
      return;
    }
    const horasDefault = Math.max(1, Math.min(4, horasDisponibles));
    handleCrearAsignatura({ materia_id: materia.id, horas_semanales: horasDefault });
  };

  const handleCambiarHoras = (asignaturaId, valor) => {
    setHorasEdit((prev) => ({ ...prev, [asignaturaId]: valor }));
  };

  const handleGuardarHoras = async (asig) => {
    const valor = horasEdit[asig.id];
    setHorasEdit((prev) => {
      const next = { ...prev };
      delete next[asig.id];
      return next;
    });
    if (valor != null && valor !== asig.horas_semanales) {
      await handleActualizarAsignatura(asig.id, { horas_semanales: valor });
    }
  };

  const opcionesPrerrequisitoPara = useMemo(() => {
    if (!prerrequisitoModal) return [];
    const yaAgregados = new Set(prerrequisitosDe(prerrequisitoModal).map((p) => p.prerrequisito_id));
    return gruposPeriodosAnteriores.flatMap((g) => g.asignaturas).filter((a) => !yaAgregados.has(a.id));
  }, [prerrequisitoModal, gruposPeriodosAnteriores, prerrequisitosDe]);

  const handleSubmitPrerrequisito = async ({ prerrequisitoId }) => {
    const ok = await handleCrearPrerrequisito({ asignaturaId: prerrequisitoModal, prerrequisitoId });
    if (ok) setPrerrequisitoModal(null);
    return ok;
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

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'materia' && overData?.type === 'periodo-zone') {
      crearAsignaturaConDefault(activeData.materia);
      return;
    }

    if (activeData?.type === 'asignatura' && overData?.type === 'prereq-slot') {
      if (!puedeSerPrerrequisito(activeData.asignatura, overData.asignaturaId)) {
        notification.warning({
          title: 'Prerrequisito inválido',
          description: 'El prerrequisito debe pertenecer a un periodo estrictamente anterior.',
        });
        return;
      }
      handleCrearPrerrequisito({
        asignaturaId: overData.asignaturaId,
        prerrequisitoId: activeData.asignatura.id,
      });
    }
  };

  const headerActions = <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />;

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
                      <Flex align="center" gap={8}>
                        <Text strong className="cfg-plan-builder__periodo-title">
                          {periodoNombre}
                        </Text>
                        <span
                          className={`cfg-plan-builder__horas-badge${
                            horasDisponibles <= 0 ? ' cfg-plan-builder__horas-badge--full' : ''
                          }`}
                        >
                          {horasDisponibles} / {plan?.horasSemana ?? '—'} h/sem
                        </span>
                      </Flex>
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
                      Arrastra una materia del catálogo hacia el periodo para agregarla (o usa su botón «+»);
                      arrastra una asignatura de un periodo anterior hacia la columna PRE-REQUISITO de una fila
                      (o usa su botón «+»).
                    </Text>
                  </header>

                  <div className="cfg-plan-builder__grid">
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
                            <div key={materia.id} className="cfg-plan-builder__catalogo-row">
                              <MateriaCatalogoChip materia={materia} disabled={!puedeCrearAsignatura} />
                              <ActionButton
                                permiso={PLAN_ASIGNATURAS_PERMISO}
                                accion="CREAR"
                                variant="info"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => crearAsignaturaConDefault(materia)}
                                aria-label={`Agregar ${materia.nombre} al periodo`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </DetailInfoCard>

                    <DetailInfoCard
                      title={periodoNombre}
                      cols={1}
                      className="cfg-plan-builder__col cfg-plan-builder__col--main"
                    >
                      <PeriodoDropZone disabled={!puedeCrearAsignatura}>
                        {(periodoActual.asignaturas ?? []).length === 0 ? (
                          <Empty
                            description="Sin asignaturas — arrastra una materia del catálogo"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <div className="cfg-plan-builder__rows">
                            {(periodoActual.asignaturas ?? []).map((asig) => {
                              const prereqTags = prerrequisitosDe(asig.id).map((p) => {
                                const info = asignaturaLabelById.get(p.prerrequisito_id);
                                const label = info?.sigla
                                  ? `${info.sigla} — ${info.nombre}`
                                  : info?.nombre || `#${p.prerrequisito_id}`;
                                return { id: p.id, label };
                              });

                              return (
                                <div key={asig.id} className="cfg-plan-builder__row">
                                  <PlanBuilderAsignaturaChip
                                    asignatura={{
                                      sigla: asig.materia?.sigla,
                                      nombre: asig.materia?.nombre,
                                    }}
                                    disabled
                                  />
                                  <InputNumber
                                    size="small"
                                    min={1}
                                    max={60}
                                    value={horasEdit[asig.id] ?? asig.horas_semanales}
                                    onChange={(valor) => handleCambiarHoras(asig.id, valor)}
                                    onBlur={() => handleGuardarHoras(asig)}
                                    disabled={!puedeCrearAsignatura}
                                    addonAfter="h"
                                    className="cfg-plan-builder__row-horas-input"
                                  />
                                  <PlanBuilderPrerrequisitoSlot
                                    asignaturaId={asig.id}
                                    prerrequisitos={prereqTags}
                                    disabled={!puedeCrearPrerrequisito}
                                    onEliminar={handleEliminarPrerrequisito}
                                    onAgregarClick={() => setPrerrequisitoModal(asig.id)}
                                  />
                                  <ActionButton
                                    permiso={PLAN_ASIGNATURAS_PERMISO}
                                    accion="EDITAR"
                                    variant="warning"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => abrirEditarAsignatura(asig)}
                                  />
                                  <Popconfirm
                                    title="Eliminar asignatura del periodo"
                                    description="Se quitará esta asignatura de la matriz del plan. ¿Continuar?"
                                    okText="Eliminar"
                                    okButtonProps={{ danger: true }}
                                    cancelText="Cancelar"
                                    onConfirm={() => handleEliminarAsignatura(asig.id)}
                                  >
                                    <ActionButton
                                      permiso={PLAN_ASIGNATURAS_PERMISO}
                                      accion="ELIMINAR"
                                      variant="danger"
                                      size="small"
                                      icon={<DeleteOutlined />}
                                    />
                                  </Popconfirm>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </PeriodoDropZone>
                    </DetailInfoCard>

                    <div className="cfg-plan-builder__col">
                      <PeriodosAnterioresPanel
                        grupos={gruposPeriodosAnteriores}
                        disabled={!puedeCrearPrerrequisito}
                      />
                    </div>
                  </div>
                </section>
              ) : null}
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>

      <DragOverlay>
        {activeDrag?.type === 'materia' ? (
          <div className="cfg-plan-builder-chip cfg-plan-builder-chip--catalogo cfg-plan-builder-chip--overlay">
            <span className="cfg-plan-builder-chip__sigla">{activeDrag.materia.sigla || '—'}</span>
            <span className="cfg-plan-builder-chip__nombre">{activeDrag.materia.nombre}</span>
          </div>
        ) : null}
        {activeDrag?.type === 'asignatura' ? (
          <div className="cfg-plan-builder-chip cfg-plan-builder-chip--asignatura cfg-plan-builder-chip--overlay">
            <span className="cfg-plan-builder-chip__sigla">{activeDrag.asignatura.sigla || '—'}</span>
            <span className="cfg-plan-builder-chip__nombre">{activeDrag.asignatura.nombre}</span>
          </div>
        ) : null}
      </DragOverlay>

      <AsignaturaPlanFormModal
        open={Boolean(editModal)}
        loading={guardando}
        initialValues={editModal?.initialValues}
        materiaLabel={editModal?.materiaLabel}
        onCancel={cerrarEditModal}
        onSubmit={handleSubmitEdit}
      />

      <PrerrequisitoFormModal
        open={Boolean(prerrequisitoModal)}
        loading={guardando}
        asignaturaLabel={
          prerrequisitoModal
            ? (() => {
                const info = asignaturaLabelById.get(prerrequisitoModal);
                return info?.sigla ? `${info.sigla} — ${info.nombre}` : info?.nombre;
              })()
            : ''
        }
        opcionesPrerrequisito={opcionesPrerrequisitoPara}
        onCancel={() => setPrerrequisitoModal(null)}
        onSubmit={handleSubmitPrerrequisito}
      />
    </DndContext>
  );
};

export default PlanPeriodoAsignaturasPage;
