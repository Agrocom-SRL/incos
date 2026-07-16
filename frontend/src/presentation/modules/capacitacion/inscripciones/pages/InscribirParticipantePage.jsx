/**
 * Inscribir participante a un curso de capacitación (CAP · CREAR) — flujo
 * INLINE (≈ PagosRegistrar de Finanzas): participante (existente o nuevo) →
 * curso → pago inicial opcional. Shell de formulario CFG Académico.
 *
 * Página "dumb": la orquestación vive en `useInscribirParticipantePage`.
 * Reusa `fin-pago-reg-*` (pagos-registrar.css) para el selector y el resumen.
 */

import { Alert, Empty, Flex, Form, Segmented, Select, Switch, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import { allSpacing } from '@theme/tokens';
import {
  useInscribirParticipantePage,
  MODO_PARTICIPANTE,
} from '@application-capacitacion/inscripciones/hooks/state/useInscribirParticipantePage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { formatEstadoCurso } from '@application-capacitacion/utils/capacitacionPills';
import ParticipanteSelector from '@capacitacion/inscripciones/components/organisms/ParticipanteSelector';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';
import PagoCapacitacionFormFields from '@capacitacion/inscripciones/components/organisms/PagoCapacitacionFormFields';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-registrar.css';

const { Paragraph, Text } = Typography;

const InscribirParticipantePage = () => {
  const {
    breadcrumbItems,
    handleVolver,
    form,
    modoParticipante,
    handleModoParticipanteChange,
    participantes,
    loadingBusqueda,
    errorBusqueda,
    buscarParticipantes,
    participanteSeleccionado,
    handleSeleccionarParticipante,
    handleCambiarParticipante,
    cursos,
    loadingCursos,
    errorCursos,
    cursoSeleccionadoId,
    cursoSeleccionado,
    handleCursoChange,
    conPagoInicial,
    handleConPagoInicialChange,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    handleFinish,
    inscribiendo,
  } = useInscribirParticipantePage();

  const volverAction = (
    <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </BackButton>
  );

  const cursoOptions = cursos.map((curso) => ({
    value: curso.id,
    label: `${curso.titulo} · Bs ${formatBs(curso.costo)} · ${formatEstadoCurso(curso.estado)}`,
  }));

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Inscribir participante"
          breadcrumbItems={breadcrumbItems}
          actions={volverAction}
        />
      }
      sidebar={null}
    >
      <Form form={form} layout="vertical" disabled={inscribiendo}>
        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
          {/* Paso 1: participante (existente o nuevo) */}
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader
                title="Participante"
                actions={
                  <Segmented
                    value={modoParticipante}
                    onChange={handleModoParticipanteChange}
                    options={[
                      { value: MODO_PARTICIPANTE.EXISTENTE, label: 'Buscar existente' },
                      { value: MODO_PARTICIPANTE.NUEVO, label: 'Nuevo participante' },
                    ]}
                  />
                }
              />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Busque a un participante ya registrado o ingrese los datos mínimos de una persona
                nueva (se registra junto con la inscripción, en una sola operación).
              </Paragraph>
            </header>
            <div className="cfg-academico-form-workspace__body">
              {modoParticipante === MODO_PARTICIPANTE.EXISTENTE ? (
                <ParticipanteSelector
                  participantes={participantes}
                  loading={loadingBusqueda}
                  error={errorBusqueda}
                  onBuscar={buscarParticipantes}
                  participanteSeleccionado={participanteSeleccionado}
                  onSeleccionar={handleSeleccionarParticipante}
                  onCambiar={handleCambiarParticipante}
                />
              ) : (
                <ParticipanteFormFields disabled={inscribiendo} />
              )}
            </div>
          </section>

          {/* Paso 2: curso */}
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Curso de capacitación" />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Solo se ofertan los cursos activos. El cupo es informativo: no bloquea la
                inscripción.
              </Paragraph>
            </header>
            <div className="cfg-academico-form-workspace__body">
              {errorCursos ? (
                <Alert
                  type="error"
                  showIcon
                  title="No se pudieron cargar los cursos"
                  description={errorCursos}
                  style={{ marginBottom: allSpacing.marginSM }}
                />
              ) : null}
              {!loadingCursos && !errorCursos && cursos.length === 0 ? (
                <Empty description="No hay cursos de capacitación disponibles." />
              ) : (
                <Select
                  size="large"
                  style={{ width: '100%' }}
                  loading={loadingCursos}
                  placeholder="Seleccione el curso"
                  options={cursoOptions}
                  value={cursoSeleccionadoId ?? undefined}
                  onChange={handleCursoChange}
                  showSearch
                  optionFilterProp="label"
                />
              )}
              {cursoSeleccionado ? (
                <div className="fin-pago-reg-resumen" style={{ marginTop: allSpacing.marginSM }}>
                  <div className="fin-pago-reg-resumen__item">
                    <Text type="secondary" className="fin-pago-reg-resumen__label">
                      Costo
                    </Text>
                    <Text strong>Bs {formatBs(cursoSeleccionado.costo)}</Text>
                  </div>
                  <div className="fin-pago-reg-resumen__item">
                    <Text type="secondary" className="fin-pago-reg-resumen__label">
                      Cupo
                    </Text>
                    <Text strong>
                      {cursoSeleccionado.cupoMaximo != null
                        ? `${cursoSeleccionado.inscritosCount} / ${cursoSeleccionado.cupoMaximo}`
                        : `${cursoSeleccionado.inscritosCount} inscritos`}
                    </Text>
                  </div>
                  <div className="fin-pago-reg-resumen__item">
                    <Text type="secondary" className="fin-pago-reg-resumen__label">
                      Fechas
                    </Text>
                    <Text strong>{cursoSeleccionado.fechasLabel || '—'}</Text>
                  </div>
                  <div className="fin-pago-reg-resumen__item">
                    <Text type="secondary" className="fin-pago-reg-resumen__label">
                      Horarios
                    </Text>
                    <Text strong>{cursoSeleccionado.horariosDetalle || 'Por definir'}</Text>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Paso 3: pago inicial opcional */}
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader
                title="Pago inicial (opcional)"
                actions={
                  <Switch
                    checked={conPagoInicial}
                    onChange={handleConPagoInicialChange}
                    checkedChildren="Con pago"
                    unCheckedChildren="Sin pago"
                  />
                }
              />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Puede registrar el primer pago junto con la inscripción (misma transacción) o
                dejarlo pendiente y cobrarlo después desde la ficha.
              </Paragraph>
            </header>
            <div className="cfg-academico-form-workspace__body">
              {conPagoInicial ? (
                <>
                  {errorCatalogos ? (
                    <Alert
                      type="error"
                      showIcon
                      title="No se pudieron cargar los catálogos de pago"
                      description={errorCatalogos}
                      style={{ marginBottom: allSpacing.marginSM }}
                    />
                  ) : null}
                  <PagoCapacitacionFormFields
                    metodosPago={metodosPago}
                    cuentasPago={cuentasPago}
                    loadingCatalogos={loadingCatalogos}
                    metodoPagoId={metodoPagoId}
                    reglasMetodo={reglasMetodo}
                    saldo={cursoSeleccionado?.costo ?? 0}
                    onMetodoPagoChange={handleMetodoPagoChange}
                    disabled={inscribiendo}
                  />
                </>
              ) : (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  La inscripción quedará con estado de pago «Sin pagos».
                </Paragraph>
              )}

              <div className="cfg-academico-form-workspace__footer">
                <Flex gap="small" justify="flex-end" wrap>
                  <BackButton onClick={handleVolver}>Cancelar</BackButton>
                  <ActionButton
                    permiso={CAPACITACION_PERMISOS.inscripcion}
                    accion="CREAR"
                    variant="primary"
                    icon={<SaveOutlined />}
                    loading={inscribiendo}
                    onClick={handleFinish}
                  >
                    Registrar inscripción
                  </ActionButton>
                </Flex>
              </div>
            </div>
          </section>
        </Flex>
      </Form>
    </PageTemplate>
  );
};

export default InscribirParticipantePage;
