/**
 * Inscribir participante a un curso de capacitación (CAP · CREAR) — wizard
 * por pestañas (`WizardForm variant="tabs"`, gemelo de `InscripcionesNueva` de
 * Matrícula): participante (existente o nuevo) → curso → grupo y requisitos →
 * pago inicial (OPCIONAL; el paso no existe si el curso es gratuito). Con
 * `strictForwardNavigation`: todo avance por pestaña valida el paso visible.
 *
 * Página "dumb": la orquestación (pasos, validación, submit) vive en
 * `useInscribirParticipantePage` y la config de pasos en
 * `config/inscribirParticipanteWizardSteps`. El contenido de cada sección
 * vive en organismos propios `InscribirParticipanteSeccion*` (cada uno envuelto
 * en `FormWorkspaceSection` con el título/descripción de su sección) y el
 * último paso cierra con `InscripcionCapSeleccionResumen`, que esta página
 * compone vía `renderSectionContent`.
 *
 * Paso 1 sin tabs internas: arranca en búsqueda; si no encuentra a nadie, el
 * header de la tarjeta ofrece "Crear nuevo participante" (y, ya en modo
 * nuevo, "Buscar participante" para volver) — ver `handleCrearNuevoParticipante`/
 * `handleVolverABusqueda` del hook. Este botón se inyecta en `wizardSteps[0]`
 * como `headerActions` aquí en la página (JSX no vive en el hook de estado).
 *
 * Elegir un participante de la lista avanza directo al paso 2 (sin pasar por
 * el botón "Siguiente"): usa la API imperativa de `WizardForm`
 * (`wizardRef.current.goToStep`) porque seleccionar una fila YA es una
 * selección válida — no hace falta repetir la validación del paso.
 *
 * Elegir un curso avanza directo al paso "Grupo y requisitos".
 */

import { useCallback, useMemo, useRef } from 'react';
import { Alert, Flex, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, Button } from '@atoms';
import { WizardForm } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import {
  useInscribirParticipantePage,
  MODO_PARTICIPANTE,
} from '@application-capacitacion/inscripciones/hooks/state/useInscribirParticipantePage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import InscribirParticipanteSeccionParticipante from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionParticipante';
import InscribirParticipanteSeccionCurso from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionCurso';
import InscribirParticipanteSeccionGrupo from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionGrupo';
import InscribirParticipanteSeccionRequisitos from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionRequisitos';
import InscribirParticipanteSeccionPago from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionPago';
import InscripcionCapSeleccionResumen from '@capacitacion/inscripciones/components/organisms/InscripcionCapSeleccionResumen';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const InscribirParticipantePage = () => {
  const {
    esEdicion,
    pageTitle,
    finishLabel,
    permisoAccion,
    loadingFicha,
    errorFicha,
    grupoMotivoDeshabilitado,
    breadcrumbItems,
    handleVolver,
    form,
    wizardSteps,
    onValidateBeforeNext,
    handleValidationError,
    stepError,
    modoParticipante,
    participanteNoEncontrado,
    handleCrearNuevoParticipante,
    handleVolverABusqueda,
    participantes,
    loadingBusqueda,
    errorBusqueda,
    searchText,
    searchAttempted,
    buscarParticipantes,
    sugeridos,
    loadingSugeridos,
    participanteSeleccionado,
    handleSeleccionarParticipante,
    cursos,
    loadingCursos,
    errorCursos,
    cursoSeleccionadoId,
    cursoSeleccionado,
    handleCursoChange,
    loadingCursoDetalle,
    errorCursoDetalle,
    gruposCurso,
    requisitosCurso,
    grupoSeleccionado,
    capacitacionGrupoId,
    setCapacitacionGrupoId,
    requisitosEntregados,
    setRequisitosEntregados,
    registrarPagoInicial,
    handleTogglePagoInicial,
    saldosPorConcepto,
    conceptoOptions,
    ofrecePago,
    cursoExterno,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    reglasMetodo,
    handleMetodoPagoChange,
    handleFinish,
    inscribiendo,
  } = useInscribirParticipantePage();

  const wizardRef = useRef(null);

  /** Seleccionar de la tabla ya es una elección válida: avanza directo al paso 2. */
  const handleSeleccionarYAvanzar = useCallback(
    (participante) => {
      handleSeleccionarParticipante(participante);
      wizardRef.current?.goToStep(1);
    },
    [handleSeleccionarParticipante],
  );

  /**
   * Elegir una tarjeta de curso ya es una elección válida: avanza directo al
   * paso "Grupo y requisitos" (siempre existe).
   */
  const handleCursoSeleccionarYAvanzar = useCallback(
    (value) => {
      handleCursoChange(value);
      wizardRef.current?.goToStep(2);
    },
    [handleCursoChange],
  );

  const participanteHeaderActions = useMemo(() => {
    if (modoParticipante === MODO_PARTICIPANTE.NUEVO) {
      return (
        <Button variant="back" size="middle" icon={<SearchOutlined />} onClick={handleVolverABusqueda}>
          Buscar participante
        </Button>
      );
    }
    if (participanteNoEncontrado) {
      return (
        <Button
          variant="alternative"
          size="middle"
          icon={<UserAddOutlined />}
          onClick={handleCrearNuevoParticipante}
        >
          Crear nuevo participante
        </Button>
      );
    }
    return null;
  }, [modoParticipante, participanteNoEncontrado, handleVolverABusqueda, handleCrearNuevoParticipante]);

  const stepsWithHeaderActions = useMemo(
    () =>
      wizardSteps.map((step, index) =>
        index === 0 ? { ...step, headerActions: participanteHeaderActions } : step,
      ),
    [wizardSteps, participanteHeaderActions],
  );

  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, section, formInstance) => {
      if (sectionKey === 'participante') {
        return (
          <InscribirParticipanteSeccionParticipante
            key={sectionKey}
            section={section}
            form={formInstance}
            modoParticipante={modoParticipante}
            participantes={participantes}
            loadingBusqueda={loadingBusqueda}
            errorBusqueda={errorBusqueda}
            searchText={searchText}
            searchAttempted={searchAttempted}
            onBuscarParticipantes={buscarParticipantes}
            sugeridos={sugeridos}
            loadingSugeridos={loadingSugeridos}
            participanteSeleccionado={participanteSeleccionado}
            onSeleccionarParticipante={handleSeleccionarYAvanzar}
            disabled={inscribiendo}
          />
        );
      }

      if (sectionKey === 'curso') {
        return (
          <InscribirParticipanteSeccionCurso
            key={sectionKey}
            section={section}
            form={formInstance}
            cursos={cursos}
            loadingCursos={loadingCursos}
            errorCursos={errorCursos}
            cursoSeleccionadoId={cursoSeleccionadoId}
            onCursoChange={handleCursoSeleccionarYAvanzar}
          />
        );
      }

      if (sectionKey === 'grupo') {
        return (
          <InscribirParticipanteSeccionGrupo
            key={sectionKey}
            section={section}
            form={formInstance}
            loading={loadingCursoDetalle}
            error={errorCursoDetalle}
            grupos={gruposCurso}
            capacitacionGrupoId={capacitacionGrupoId}
            onGrupoChange={grupoMotivoDeshabilitado ? undefined : setCapacitacionGrupoId}
          />
        );
      }

      if (sectionKey === 'requisitos') {
        return (
          <InscribirParticipanteSeccionRequisitos
            key={sectionKey}
            section={section}
            form={formInstance}
            error={errorCursoDetalle}
            requisitos={requisitosCurso}
            requisitosEntregados={requisitosEntregados}
            onRequisitosChange={setRequisitosEntregados}
          />
        );
      }

      if (sectionKey === 'pago') {
        return (
          <InscribirParticipanteSeccionPago
            key={sectionKey}
            section={section}
            form={formInstance}
            registrarPagoInicial={registrarPagoInicial}
            onTogglePagoInicial={handleTogglePagoInicial}
            errorCatalogos={errorCatalogos}
            metodosPago={metodosPago}
            cuentasPago={cuentasPago}
            loadingCatalogos={loadingCatalogos}
            reglasMetodo={reglasMetodo}
            saldosPorConcepto={saldosPorConcepto}
            conceptoOptions={conceptoOptions}
            cursoExterno={cursoExterno}
            onMetodoPagoChange={handleMetodoPagoChange}
            disabled={inscribiendo}
          />
        );
      }

      if (sectionKey === 'resumen') {
        return (
          <InscripcionCapSeleccionResumen
            key={sectionKey}
            section={section}
            form={formInstance}
            modoParticipante={modoParticipante}
            participanteSeleccionado={participanteSeleccionado}
            curso={cursoSeleccionado}
            grupo={grupoSeleccionado}
            requisitos={requisitosCurso}
            requisitosEntregados={requisitosEntregados}
            ofrecePago={ofrecePago}
            registrarPagoInicial={registrarPagoInicial}
            conceptoOptions={conceptoOptions}
          />
        );
      }

      return null;
    },
    [
      modoParticipante,
      participantes,
      loadingBusqueda,
      errorBusqueda,
      searchText,
      searchAttempted,
      buscarParticipantes,
      sugeridos,
      loadingSugeridos,
      participanteSeleccionado,
      handleSeleccionarYAvanzar,
      inscribiendo,
      cursos,
      loadingCursos,
      errorCursos,
      cursoSeleccionadoId,
      cursoSeleccionado,
      handleCursoSeleccionarYAvanzar,
      loadingCursoDetalle,
      errorCursoDetalle,
      gruposCurso,
      requisitosCurso,
      grupoSeleccionado,
      capacitacionGrupoId,
      grupoMotivoDeshabilitado,
      setCapacitacionGrupoId,
      requisitosEntregados,
      setRequisitosEntregados,
      registrarPagoInicial,
      handleTogglePagoInicial,
      saldosPorConcepto,
      conceptoOptions,
      ofrecePago,
      cursoExterno,
      errorCatalogos,
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      reglasMetodo,
      handleMetodoPagoChange,
    ],
  );

  return (
    <PermisoGuard
      codigo={CAPACITACION_PERMISOS.inscripcion}
      accion={permisoAccion}
      fallback={
        <Typography.Text type="danger">
          {esEdicion
            ? 'No tiene permiso para editar inscripciones.'
            : 'No tiene permiso para inscribir participantes.'}
        </Typography.Text>
      }
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={
              <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
                Volver
              </BackButton>
            }
          />
        </PageHeaderArea>

        <DashboardPageShell>
          <MainContent>
            <Spin spinning={loadingFicha} tip="Cargando inscripción…">
              {errorFicha ? <Alert type="error" showIcon title={errorFicha} /> : null}
              <WizardForm
              ref={wizardRef}
              variant="tabs"
              steps={stepsWithHeaderActions}
              form={form}
              loading={inscribiendo}
              viewMode={false}
              resolveOptions={() => []}
              initialStep={0}
              onFinish={handleFinish}
              showSaveButton={false}
              renderSectionContent={renderSectionContent}
              onValidateBeforeNext={onValidateBeforeNext}
              onValidationError={handleValidationError}
              strictForwardNavigation
              errorMessage={stepError}
              finishLabel={finishLabel}
              nextLabel="Siguiente"
              prevLabel="Anterior"
            />
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
};

export default InscribirParticipantePage;
