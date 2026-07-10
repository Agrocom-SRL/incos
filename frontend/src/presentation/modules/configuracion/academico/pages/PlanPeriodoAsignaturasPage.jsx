/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan.
 * Se alcanza desde el lápiz de columna del documento en `PlanDetailPage.jsx`
 * (`onEditarPeriodo` → `planPeriodoAsignaturasPath`). `DndContext` raíz de
 * dnd-kit con dos flujos:
 *
 *   Flujo A — agregar asignatura al periodo: arrastrar una `MateriaCatalogoChip`
 *   del catálogo lateral hacia la zona del periodo. Se valida cupo de horas
 *   (`puedeAgregarHoras`) antes de abrir `AsignaturaPlanFormModal` prellenado.
 *
 *   Flujo B — prerrequisito cross-periodo: arrastrar una `PlanBuilderAsignaturaChip`
 *   de CUALQUIER periodo (columna derecha «Otros periodos») hacia la celda
 *   `PlanBuilderPrerrequisitoSlot` de una fila del periodo en edición. Solo
 *   válido si el periodo de origen es estrictamente anterior
 *   (`puedeSerPrerrequisito`); el feedback de rechazo se pinta en `onDragOver`
 *   (antes del drop, ver `invalidOverId`).
 *
 * Fallback sin drag (accesibilidad / teclado): botón «+ Asignatura» y el «+»
 * de cada slot de prerrequisito abren los mismos modales existentes
 * (`AsignaturaPlanFormModal`, `PrerrequisitoFormModal`, `PeriodoFormModal`).
 * Todas las validaciones de negocio (cupo de horas, periodo anterior) son
 * SOLO client-side — ver `utils/planBuilderRules.js`.
 */

import { useMemo, useState } from 'react';
import { App, Alert, Empty, Flex, Popconfirm, Spin, Tag, Typography } from 'antd';
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
import { PageHeader, ListPanelHeader } from '@molecules';
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
import PeriodoFormModal from '@configuracion/academico/components/molecules/PeriodoFormModal';
import AsignaturaPlanFormModal from '@configuracion/academico/components/molecules/AsignaturaPlanFormModal';
import PrerrequisitoFormModal from '@configuracion/academico/components/molecules/PrerrequisitoFormModal';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';
import '../styles/plan-builder.css';

const { Text } = Typography;

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
    gruposOtrosPeriodos,
    asignaturaLabelById,
    materiasDisponibles,
    materiasLoading,
    horasDisponibles,
    prerrequisitosDe,
    puedeAgregarHoras,
    puedeSerPrerrequisito,
    breadcrumbItems,
    loading,
    error,
    isInvalidId,
    guardando,
    handleVolver,
    handleActualizarPeriodo,
    handleEliminarPeriodo,
    handleCrearAsignatura,
    handleActualizarAsignatura,
    handleEliminarAsignatura,
    handleCrearPrerrequisito,
    handleEliminarPrerrequisito,
  } = usePlanBuilder();

  const [asignaturaModal, setAsignaturaModal] = useState(null);
  const [prerrequisitoModal, setPrerrequisitoModal] = useState(null);
  const [periodoEditOpen, setPeriodoEditOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null);
  const [invalidSlotId, setInvalidSlotId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const periodoNombre = periodoActual ? periodoActual.nombre || `Año ${periodoActual.numero}` : '';

  const abrirCrearAsignatura = (materiaPreseleccionada) =>
    setAsignaturaModal({ mode: 'create', materiaPreseleccionada });
  const abrirEditarAsignatura = (asignatura) =>
    setAsignaturaModal({
      mode: 'edit',
      asignaturaId: asignatura.id,
      initialValues: { horasSemanales: asignatura.horas_semanales, modalidad: asignatura.modalidad },
      materiaLabel: asignatura.materia?.sigla
        ? `${asignatura.materia.sigla} — ${asignatura.materia.nombre}`
        : asignatura.materia?.nombre,
    });
  const cerrarAsignaturaModal = () => setAsignaturaModal(null);

  const handleSubmitAsignatura = async (payload) => {
    if (asignaturaModal.mode === 'create') {
      if (!puedeAgregarHoras(payload.horas_semanales)) {
        notification.warning({
          title: 'Sin cupo de horas',
          description: `Disponible en ${periodoNombre}: ${horasDisponibles} h/sem.`,
        });
        return false;
      }
      const ok = await handleCrearAsignatura(payload);
      if (ok) cerrarAsignaturaModal();
      return ok;
    }
    const ok = await handleActualizarAsignatura(asignaturaModal.asignaturaId, payload);
    if (ok) cerrarAsignaturaModal();
    return ok;
  };

  const opcionesPrerrequisitoPara = useMemo(() => {
    if (!prerrequisitoModal) return [];
    const yaAgregados = new Set(prerrequisitosDe(prerrequisitoModal).map((p) => p.prerrequisito_id));
    return gruposOtrosPeriodos
      .filter((g) => g.esAnterior)
      .flatMap((g) => g.asignaturas)
      .filter((a) => !yaAgregados.has(a.id));
  }, [prerrequisitoModal, gruposOtrosPeriodos, prerrequisitosDe]);

  const handleSubmitPrerrequisito = async ({ prerrequisitoId }) => {
    const ok = await handleCrearPrerrequisito({ asignaturaId: prerrequisitoModal, prerrequisitoId });
    if (ok) setPrerrequisitoModal(null);
    return ok;
  };

  const handleSubmitPeriodo = async (values) => {
    const ok = await handleActualizarPeriodo(values);
    if (ok) setPeriodoEditOpen(false);
    return ok;
  };

  // -----------------------------------------------------------------------
  // dnd-kit — DndContext raíz
  // -----------------------------------------------------------------------

  const handleDragStart = (event) => {
    setActiveDrag(event.active.data.current ?? null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) {
      setInvalidSlotId(null);
      return;
    }
    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type === 'asignatura' && overData?.type === 'prereq-slot') {
      const valido = puedeSerPrerrequisito(activeData.asignatura, overData.asignaturaId);
      setInvalidSlotId(valido ? null : String(over.id));
    } else {
      setInvalidSlotId(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDrag(null);
    setInvalidSlotId(null);
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'materia' && overData?.type === 'periodo-zone') {
      if (horasDisponibles <= 0) {
        notification.warning({
          title: 'Sin cupo de horas',
          description: `${periodoNombre} ya usa las ${plan?.horasSemana ?? '—'} h/semana del plan.`,
        });
        return;
      }
      abrirCrearAsignatura(activeData.materia);
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
      onDragOver={handleDragOver}
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
                    <ListPanelHeader
                      title={`${periodoNombre} — ${horasDisponibles} h/sem disponibles${
                        plan?.horasSemana ? ` de ${plan.horasSemana}` : ''
                      }`}
                      actions={
                        <Flex gap={8} wrap="wrap">
                          <ActionButton
                            permiso={PLAN_PERIODOS_PERMISO}
                            accion="EDITAR"
                            variant="warning"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => setPeriodoEditOpen(true)}
                          >
                            Editar periodo
                          </ActionButton>
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
                      }
                    />
                    <Text type="secondary" className="cfg-academico-workspace__desc">
                      Arrastra una materia del catálogo hacia este periodo para agregarla, o arrastra una
                      asignatura de un periodo anterior hacia la columna «PRE-REQUISITO» de una fila.
                    </Text>
                  </header>

                  <div className="cfg-plan-builder__grid">
                    <DetailInfoCard title="Catálogo de materias" cols={1} className="cfg-plan-builder__col">
                      {materiasLoading ? (
                        <Spin size="small" />
                      ) : materiasDisponibles.length === 0 ? (
                        <Empty description="Sin materias disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div className="cfg-plan-builder__chip-list">
                          {materiasDisponibles.map((materia) => (
                            <MateriaCatalogoChip
                              key={materia.id}
                              materia={materia}
                              disabled={!puedeCrearAsignatura}
                            />
                          ))}
                        </div>
                      )}
                    </DetailInfoCard>

                    <DetailInfoCard
                      title={periodoNombre}
                      cols={1}
                      className="cfg-plan-builder__col cfg-plan-builder__col--main"
                      extra={
                        <ActionButton
                          permiso={PLAN_ASIGNATURAS_PERMISO}
                          accion="CREAR"
                          variant="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => abrirCrearAsignatura(null)}
                        >
                          Asignatura
                        </ActionButton>
                      }
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
                                      id: asig.id,
                                      sigla: asig.materia?.sigla,
                                      nombre: asig.materia?.nombre,
                                      periodoId: periodoActual.id,
                                      periodoNumero: periodoActual.numero,
                                    }}
                                    disabled={!puedeCrearPrerrequisito}
                                  />
                                  <span className="cfg-plan-builder__row-horas">
                                    {asig.horas_semanales ?? '—'} h
                                  </span>
                                  <PlanBuilderPrerrequisitoSlot
                                    asignaturaId={asig.id}
                                    prerrequisitos={prereqTags}
                                    invalid={invalidSlotId === `prereq-slot-${asig.id}`}
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

                    <DetailInfoCard title="Otros periodos" cols={1} className="cfg-plan-builder__col">
                      {gruposOtrosPeriodos.length === 0 ? (
                        <Empty description="Este plan no tiene otros periodos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div className="cfg-plan-builder__grupos">
                          {gruposOtrosPeriodos.map((grupo) => (
                            <div key={grupo.periodoId} className="cfg-plan-builder__grupo">
                              <Flex align="center" gap={6} className="cfg-plan-builder__grupo-head">
                                <Text strong>{grupo.periodoNombre}</Text>
                                {!grupo.esAnterior ? (
                                  <Tag className="cfg-plan-builder__grupo-tag">no válido aquí</Tag>
                                ) : null}
                              </Flex>
                              {grupo.asignaturas.length === 0 ? (
                                <Text type="secondary">Sin asignaturas</Text>
                              ) : (
                                <div className="cfg-plan-builder__chip-list">
                                  {grupo.asignaturas.map((asig) => (
                                    <PlanBuilderAsignaturaChip
                                      key={asig.id}
                                      asignatura={asig}
                                      locked={!grupo.esAnterior}
                                      disabled={!puedeCrearPrerrequisito}
                                      size="small"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </DetailInfoCard>
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

      <PeriodoFormModal
        open={periodoEditOpen}
        mode="edit"
        loading={guardando}
        initialValues={{ nombre: periodoActual?.nombre, numero: periodoActual?.numero }}
        onCancel={() => setPeriodoEditOpen(false)}
        onSubmit={handleSubmitPeriodo}
      />

      <AsignaturaPlanFormModal
        open={Boolean(asignaturaModal)}
        mode={asignaturaModal?.mode}
        loading={guardando || materiasLoading}
        initialValues={{
          ...asignaturaModal?.initialValues,
          materiaId: asignaturaModal?.materiaPreseleccionada?.id,
        }}
        materiaLabel={asignaturaModal?.materiaLabel}
        materiasOptions={asignaturaModal?.mode === 'create' ? materiasDisponibles : []}
        onCancel={cerrarAsignaturaModal}
        onSubmit={handleSubmitAsignatura}
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
