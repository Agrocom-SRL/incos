/**
 * Inscribir participante a un curso de capacitación (CAP · CREAR) — wizard
 * por pestañas (`WizardForm variant="tabs"`, gemelo de `UsuarioCreatePage`):
 * participante (existente o nuevo) → curso → pago inicial opcional.
 *
 * Página "dumb": la orquestación (pasos, validación, submit) vive en
 * `useInscribirParticipantePage`. El contenido de cada paso (selector/
 * formulario de participante, selector de curso, campos de pago) vive en
 * organismos propios `InscribirParticipanteSeccion*`, que esta página compone
 * vía `renderSectionContent`. Reusa `fin-pago-reg-*` (pagos-registrar.css)
 * solo para el resaltado del selector de participante; en el paso "Pago
 * inicial" el resumen del curso elegido (costo/cupo/fechas/horarios) es la
 * molécula `CursoCapacitacionResumen` (icono+texto, mismo lenguaje que la
 * tarjeta del paso "Curso"), no cajas de ancho fijo.
 *
 * Paso 1 sin tabs internas: arranca en búsqueda; si no encuentra a nadie, el
 * header de la tarjeta ofrece "Crear nuevo participante" (y, ya en modo
 * nuevo, "Buscar participante" para volver) — ver `handleCrearNuevoParticipante`/
 * `handleVolverABusqueda` del hook. Este botón se inyecta en `wizardSteps[0]`
 * como `headerActions` aquí en la página (JSX no vive en el hook de estado).
 *
 * Elegir un participante de la tabla avanza directo al paso 2 (sin pasar por
 * el botón "Siguiente"): usa la API imperativa de `WizardForm`
 * (`wizardRef.current.goToStep`) porque seleccionar una fila YA es una
 * selección válida — no hace falta repetir la validación del paso.
 */

import { useCallback, useMemo, useRef } from 'react';
import { Flex, Switch, Typography } from 'antd';
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
import InscribirParticipanteSeccionPago from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionPago';
import CursoCapacitacionResumen from '@capacitacion/inscripciones/components/molecules/CursoCapacitacionResumen';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-registrar.css';
import '../styles/inscribir-participante.css';

const InscribirParticipantePage = () => {
  const {
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
    requierePago,
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

  const wizardRef = useRef(null);

  /** Seleccionar de la tabla ya es una elección válida: avanza directo al paso 2. */
  const handleSeleccionarYAvanzar = useCallback(
    (participante) => {
      handleSeleccionarParticipante(participante);
      wizardRef.current?.goToStep(1);
    },
    [handleSeleccionarParticipante],
  );

  /** Elegir una tarjeta de curso ya es una elección válida: avanza directo al paso 3. */
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
    (_stepIndex, sectionKey) => {
      if (sectionKey === 'participante') {
        return (
          <InscribirParticipanteSeccionParticipante
            key="participante"
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
            key="curso"
            cursos={cursos}
            loadingCursos={loadingCursos}
            errorCursos={errorCursos}
            cursoSeleccionadoId={cursoSeleccionadoId}
            onCursoChange={handleCursoSeleccionarYAvanzar}
          />
        );
      }

      if (sectionKey === 'pago') {
        return (
          <Flex vertical gap="middle" key="pago">
            <CursoCapacitacionResumen curso={cursoSeleccionado} />
            {requierePago ? (
              <>
                <Switch
                  checked={conPagoInicial}
                  onChange={handleConPagoInicialChange}
                  checkedChildren="Con pago"
                  unCheckedChildren="Sin pago"
                  style={{ alignSelf: 'flex-start' }}
                />
                <InscribirParticipanteSeccionPago
                  conPagoInicial={conPagoInicial}
                  errorCatalogos={errorCatalogos}
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
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Este curso no tiene costo asociado (Bs 0): la inscripción no requiere
                registrar ningún pago.
              </Typography.Paragraph>
            )}
          </Flex>
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
      requierePago,
      conPagoInicial,
      handleConPagoInicialChange,
      errorCatalogos,
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      metodoPagoId,
      reglasMetodo,
      handleMetodoPagoChange,
    ],
  );

  return (
    <PermisoGuard
      codigo={CAPACITACION_PERMISOS.inscripcion}
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">
          No tiene permiso para inscribir participantes.
        </Typography.Text>
      }
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title="Inscribir participante"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        </PageHeaderArea>

        <DashboardPageShell>
          <MainContent>
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
              errorMessage={stepError}
              finishLabel="Registrar inscripción"
              nextLabel="Siguiente"
              prevLabel="Anterior"
            />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
};

export default InscribirParticipantePage;
