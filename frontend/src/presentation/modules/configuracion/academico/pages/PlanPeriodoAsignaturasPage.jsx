/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan.
 * Se alcanza desde el lápiz de columna del documento en `PlanDetailPage.jsx`
 * (`onEditarPeriodo` → `planPeriodoAsignaturasPath`). Estilo curriculum
 * builder sobre el shell del formulario académico (`cfg-academico-form-workspace`):
 *
 *   Toolbar del header — título del periodo (color primario, sin horas),
 *   descripción y las acciones ARRIBA: Descartar (solo con cambios),
 *   «Guardar cambios» (primario, deshabilitado sin cambios) y Eliminar periodo.
 *
 *   Catálogo de materias — buscador global + pill-select de clasificación
 *   (siempre una seleccionada, sin «Todas») + grid de tiles (sigla arriba,
 *   nombre abajo, pill de tipo). Solo materias útiles: libres para el periodo
 *   o de un año anterior (badge) como fuente de prerrequisito. Sin botones «+».
 *
 *   Asignaturas del periodo — filas planilla (celda de horas gemela del
 *   cuaderno, quitar discreto) + total de horas con barra de progreso.
 *
 *   Prerrequisitos — visible solo con años anteriores: fila por asignatura
 *   con celda-etiqueta (sigla) + slot droppable.
 *
 * TODO es borrador en memoria (`usePlanBuilder.draftFilas`); nada persiste
 * hasta «Guardar cambios». Validaciones en `utils/planBuilderRules.js`.
 */

import { useMemo, useState } from 'react';
import { App, Alert, Button, Empty, Flex, Input, Popconfirm, Progress, Spin, Typography, theme } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, InboxOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
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
  const { token } = theme.useToken();
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
    moverPrerrequisito,
    quitarPrerrequisito,
    descartarCambios,
    guardarCambios,
    handleVolver,
    handleEliminarPeriodo,
  } = usePlanBuilder();

  const [activeDrag, setActiveDrag] = useState(null);
  const [clasificacionFiltro, setClasificacionFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const clasificaciones = useMemo(() => {
    const set = new Set(materiasCatalogo.map((m) => m.clasificacion || SIN_CLASIFICACION));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [materiasCatalogo]);

  // Siempre hay UNA clasificación activa (sin «Todas»): la elegida por el
  // usuario o, si ya no existe en el catálogo (se usaron sus materias), la primera.
  const clasificacionActiva =
    clasificacionFiltro && clasificaciones.includes(clasificacionFiltro)
      ? clasificacionFiltro
      : clasificaciones[0] ?? null;

  /**
   * Catálogo visible en dos grupos: materias LIBRES (clasificación + búsqueda;
   * la búsqueda cruza clasificaciones) y materias de AÑOS ANTERIORES — fuente
   * de prerrequisitos, siempre visibles (solo las filtra la búsqueda) para
   * saber qué se puede jalar hacia la columna Prerrequisitos.
   */
  const { materiasLibres, materiasAnteriores } = useMemo(() => {
    const visibles = materiasCatalogo.filter((m) => !m.enPeriodoActual);
    const q = busqueda.trim().toLowerCase();
    const coincide = (m) => !q || `${m.sigla ?? ''} ${m.nombre ?? ''}`.toLowerCase().includes(q);
    return {
      materiasLibres: visibles.filter(
        (m) =>
          !m.asignadaEn &&
          coincide(m) &&
          (q || !clasificacionActiva || (m.clasificacion || SIN_CLASIFICACION) === clasificacionActiva),
      ),
      materiasAnteriores: visibles.filter((m) => m.asignadaEn && coincide(m)),
    };
  }, [materiasCatalogo, clasificacionActiva, busqueda]);

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

    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData || !overData) return;

    // Tag ya colocado → moverlo a otra fila (arriba/abajo) sin eliminarlo
    if (activeData.type === 'prereq-tag') {
      if (overData.type === 'prereq-slot') {
        moverPrerrequisito(activeData.fromFilaKey, overData.filaKey, activeData.prereq.key);
      }
      return;
    }

    const materia = activeData.materia;
    if (!materia) return;

    if (overData.type === 'periodo-zone') {
      if (materia.asignadaEn) {
        notification.warning({
          title: 'Materia ya asignada',
          description: `${materia.sigla ?? materia.nombre} pertenece a ${materia.asignadaEn.periodoNombre}; solo puede usarse como prerrequisito.`,
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
      content: 'Si vuelve ahora se perderán los cambios del periodo.',
      okText: 'Salir sin guardar',
      cancelText: 'Seguir editando',
      okButtonProps: { danger: true },
      onOk: handleVolver,
    });
  };

  const headerActions = <BackButton icon={<ArrowLeftOutlined />} onClick={confirmarVolver} />;

  const porcentajeHoras = horasSemana ? Math.round((horasAsignadas / horasSemana) * 100) : 0;

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
                <section className="cfg-academico-workspace cfg-academico-form-workspace cfg-plan-builder">
                  <header className="cfg-academico-workspace__header">
                    <Flex align="flex-start" justify="space-between" wrap="wrap" gap={12}>
                      <div className="cfg-plan-builder__header-info">
                        <Text strong className="cfg-plan-builder__periodo-title">
                          {periodoNombre}
                        </Text>
                        <Text type="secondary" className="cfg-academico-workspace__desc">
                          Arrastre materias del catálogo hacia el periodo.
                          {tienePeriodosAnteriores
                            ? ' Para un prerrequisito, arrastre una materia de un año anterior (con etiqueta de año) hacia la fila de la asignatura.'
                            : ''}
                        </Text>
                      </div>
                      <Flex align="center" gap={8} wrap="wrap" className="cfg-plan-builder__toolbar">
                        {hayCambios ? (
                          <Button onClick={descartarCambios} disabled={guardando}>
                            Descartar
                          </Button>
                        ) : null}
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          loading={guardando}
                          disabled={!hayCambios}
                          onClick={guardarCambios}
                        >
                          Guardar cambios
                        </Button>
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
                            icon={<DeleteOutlined />}
                          >
                            Eliminar periodo
                          </ActionButton>
                        </Popconfirm>
                      </Flex>
                    </Flex>
                  </header>

                  <div className="cfg-academico-form-workspace__body cfg-plan-builder__body">
                    <div className="cfg-plan-builder__grid">
                      <div className="cfg-plan-builder__col-stack">
                      <DetailInfoCard title="Catálogo de materias" cols={1} className="cfg-plan-builder__col">
                        <div className="cfg-plan-builder__catalogo-controles">
                          <div className="cfg-plan-builder__control">
                            <span className="cfg-plan-builder__control-label">Clasificación</span>
                            <MateriaClasificacionFilter
                              clasificaciones={clasificaciones}
                              value={clasificacionActiva}
                              onChange={setClasificacionFiltro}
                            />
                          </div>
                          <div className="cfg-plan-builder__control">
                            <span className="cfg-plan-builder__control-label">Buscar</span>
                            <Input
                              allowClear
                              prefix={<SearchOutlined />}
                              placeholder="Buscar materia"
                              value={busqueda}
                              onChange={(e) => setBusqueda(e.target.value)}
                              className="cfg-plan-builder__buscador"
                            />
                          </div>
                        </div>
                        {materiasLoading ? (
                          <Spin size="small" />
                        ) : materiasLibres.length === 0 ? (
                          <Empty description="Sin materias disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                          <div className="cfg-plan-builder__chip-list">
                            {materiasLibres.map((materia) => (
                              <MateriaCatalogoChip
                                key={materia.id}
                                materia={materia}
                                disabled={!puedeArrastrar(materia)}
                              />
                            ))}
                          </div>
                        )}

                      </DetailInfoCard>

                      {tienePeriodosAnteriores ? (
                        <DetailInfoCard
                          title="Materias de años anteriores"
                          cols={1}
                          className="cfg-plan-builder__col"
                        >
                          {materiasAnteriores.length === 0 ? (
                            <Empty
                              description="Sin materias en años anteriores"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ) : (
                            <div className="cfg-plan-builder__chip-list">
                              {materiasAnteriores.map((materia) => (
                                <MateriaCatalogoChip
                                  key={materia.id}
                                  materia={materia}
                                  disabled={!puedeArrastrar(materia)}
                                />
                              ))}
                            </div>
                          )}
                        </DetailInfoCard>
                      ) : null}
                      </div>

                      <div className="cfg-plan-builder__col-stack">
                      <DetailInfoCard
                        title="Asignaturas del periodo"
                        cols={1}
                        className="cfg-plan-builder__col cfg-plan-builder__col--main"
                      >
                        <PeriodoDropZone disabled={!puedeCrearAsignatura}>
                          {draftFilas.length === 0 ? (
                            <div className="cfg-plan-builder__placeholder">
                              <InboxOutlined aria-hidden />
                              <span>Arrastre aquí una materia del catálogo</span>
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
                        <Progress
                          percent={porcentajeHoras}
                          showInfo={false}
                          size="small"
                          strokeColor={horasDisponibles < 0 ? token.colorError : token.colorPrimary}
                          aria-label={`Horas asignadas: ${horasAsignadas} de ${horasSemana ?? '—'}`}
                        />
                      </DetailInfoCard>

                      {tienePeriodosAnteriores ? (
                        <DetailInfoCard title="Prerrequisitos" cols={1} className="cfg-plan-builder__col">
                          {draftFilas.length === 0 ? (
                            <Empty
                              description="Agregue asignaturas al periodo"
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
                    </div>
                  </div>
                </section>
              ) : null}
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>

      <DragOverlay>
        {activeDrag?.materia ? (
          <div className="cfg-plan-builder-chip cfg-plan-builder-chip--catalogo cfg-plan-builder-chip--overlay">
            <div className="cfg-plan-builder-chip__top">
              <span className="cfg-plan-builder-chip__sigla">{activeDrag.materia.sigla || '—'}</span>
              {activeDrag.materia.asignadaEn ? (
                <span className="cfg-plan-builder-chip__badge">{activeDrag.materia.asignadaEn.periodoNombre}</span>
              ) : null}
            </div>
            <span className="cfg-plan-builder-chip__nombre">{activeDrag.materia.nombre}</span>
          </div>
        ) : null}
        {activeDrag?.type === 'prereq-tag' ? (
          <span className="cfg-plan-builder-prereq-tag cfg-plan-builder-prereq-tag--overlay">
            {activeDrag.prereq.sigla || activeDrag.prereq.nombre || `#${activeDrag.prereq.prerrequisitoId}`}
          </span>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PlanPeriodoAsignaturasPage;
