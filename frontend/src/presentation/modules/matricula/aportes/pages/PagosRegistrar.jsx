/**
 * PagosRegistrar - Página para registrar un pago
 *
 * Single Responsibility: Orquestar el wizard de registro de pago de un estudiante
 *
 * Atomic Design: Page
 * - Shell alineado al patrón de EstudiantesAsignarBeca:
 *   PageHeaderArea (PageHeader + BackButton) + DashboardPageShell + MainContent.
 * - El contenido es un `WizardForm variant="tabs"`:
 *   1. "Estado del aporte" → verificación a ancho completo (sin panel de
 *      estudiante: la identidad va en el título de la página y en Confirmación).
 *      El botón "Asignar beca" vive en la cabecera del card (headerActions),
 *      como en los formularios de Configuración.
 *   2. "Datos del pago" → tres secciones del workspace: método de pago,
 *      datos del comprobante y monto de esta cuota
 *      (solo si el pago NO es gratuito; con beca 100% el wizard salta este paso).
 *   3. "Confirmación" → resumen del pago + compromiso de pago inline cuando es
 *      la 1ra cuota con saldo restante (reemplaza al antiguo modal) + observación.
 * - También se sirve por la ruta legacy `/pagos/registrar` (dominio Finanzas):
 *   `returnListPath`/`menuSidebarKey` y las redirecciones se conservan intactos.
 *
 * Arquitectura:
 * Page → shell global + WizardForm (organismo compartido)
 * - Toda la lógica vive en usePagosRegistrarPageState (application/hooks/state):
 *   validaciones espejo del backend, payload, idempotencia, recibo y redirecciones.
 */

import { useCallback, useMemo } from 'react';
import { Flex, Spin } from 'antd';
import { ArrowLeftOutlined, GiftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { FormWorkspaceSection, WizardForm } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePagosRegistrarPageState } from '@application-pagos/hooks';
import { formatFechaLiteral } from '@application/utils';
import {
  PagoEstadoAporteSection,
  PagoDatosPagoSection,
  PagoConfirmacionResumen,
} from '../components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const PagosRegistrar = () => {
  // Toda la lógica del flujo vive en el hook de estado de la pantalla
  const {
    student,
    pageTitle,
    breadcrumbItems,
    handleVolver,
    handleAsignarBeca,
    ocultarBotonAsignarBeca,
    sinEstudiante,
    redirigiendoADetalle,
    cargandoDatosBase,
    becaActiva,
    porcentajeBeca,
    descuentoBeca,
    esPrimeraCuota,
    estadoActualAporte,
    configuracionAporteActiva,
    configuracionAportes,
    metodosPago,
    cuentasPago,
    bancosAutorizados,
    montoCuota,
    saldoPendiente,
    esPagoGratuito,
    mostrarSelectorCompromiso,
    saldoRestanteCompromiso,
    compromisoDias,
    setCompromisoDias,
    fechaCompromisoProyectada,
    opcionesCompromiso,
    form,
    validarPasoDatosPago,
    handleFinish,
    isSubmitting,
    submitError,
  } = usePagosRegistrarPageState();

  const backAction = (
    <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </BackButton>
  );

  // "Asignar beca" en la cabecera del card del paso 1 (la beca modifica el saldo
  // que se verifica en ese paso), como los formularios de Configuración.
  const asignarBecaAction = useMemo(
    () =>
      !ocultarBotonAsignarBeca ? (
        <ActionButton
          permiso="matricula.beca.asignar"
          accion="CREAR"
          variant="success"
          icon={<GiftOutlined />}
          onClick={handleAsignarBeca}
        >
          Asignar beca
        </ActionButton>
      ) : null,
    [ocultarBotonAsignarBeca, handleAsignarBeca]
  );

  // Pasos del wizard: config vacío por sección, todo el contenido es custom
  // vía renderSectionContent (patrón EstudiantesAsignarBeca). Con pago gratuito
  // (beca/condonación 100%) no hay paso "Datos del pago".
  const wizardSteps = useMemo(() => {
    const pasoAporte = {
      title: 'Estado del aporte',
      formTitle: 'Verifique el estado del aporte',
      description:
        'Revise el monto del aporte, la beca aplicada, las cuotas registradas y el saldo pendiente antes de continuar.',
      sections: ['aporte'],
      config: { aporte: {} },
      headerActions: asignarBecaAction,
    };
    const pasoPago = {
      title: 'Datos del pago',
      formTitle: 'Registre los datos del pago',
      description:
        'Seleccione el método de pago, complete los datos del comprobante e indique el monto de esta cuota.',
      sections: ['pago'],
      config: { pago: {} },
    };
    const pasoConfirmacion = {
      title: 'Confirmación',
      formTitle: 'Confirme el registro del pago',
      description: esPagoGratuito
        ? 'Revise el resumen y registre el pago del aporte cubierto por la beca.'
        : 'Revise el resumen del pago y registre la cuota.',
      sections: ['confirmacion'],
      config: { confirmacion: {} },
    };
    return esPagoGratuito
      ? [pasoAporte, pasoConfirmacion]
      : [pasoAporte, pasoPago, pasoConfirmacion];
  }, [esPagoGratuito, asignarBecaAction]);

  // Compuerta de avance: el paso "Datos del pago" exige monto válido, método
  // seleccionado y campos del comprobante correctos (la validación vive en el hook).
  const onValidateBeforeNext = useCallback(
    (stepNumber) => {
      if (!esPagoGratuito && stepNumber === 2) {
        return validarPasoDatosPago();
      }
      return Promise.resolve();
    },
    [esPagoGratuito, validarPasoDatosPago]
  );

  // Al fallar la validación del paso, desplazar la vista al primer campo con error.
  const onValidationError = useCallback(
    (err) => {
      const firstErrorField = err?.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField, { behavior: 'smooth', block: 'center' });
      }
    },
    [form]
  );

  // Finalizar: validar el paso visible (Confirmación: observación) y delegar en
  // handleFinish del hook, que valida el flujo completo y arma el payload.
  const handleWizardFinish = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (err) {
      onValidationError(err);
      return;
    }
    await handleFinish(form.getFieldsValue(true));
  }, [form, handleFinish, onValidationError]);

  // Contenido custom por sección (la página construye cada panel del wizard)
  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, _section, formInstance) => {
      if (sectionKey === 'aporte') {
        // Panel único a ancho completo: la identidad del estudiante ya está en el
        // título de la página y en el resumen del paso Confirmación.
        return (
          <PagoEstadoAporteSection
            configuracionAporte={configuracionAporteActiva}
            becaActiva={becaActiva}
            estadoActualAporte={estadoActualAporte}
            error={configuracionAportes?.error}
          />
        );
      }
      if (sectionKey === 'pago') {
        // El organismo compone sus secciones del workspace con campos por config
        // (método → comprobante → monto), sin wrapper adicional.
        return (
          <PagoDatosPagoSection
            saldoPendiente={saldoPendiente}
            metodosPago={metodosPago}
            cuentasPago={cuentasPago}
            bancosAutorizados={bancosAutorizados}
            form={formInstance}
          />
        );
      }
      if (sectionKey === 'confirmacion') {
        return (
          <FormWorkspaceSection
            title="Resumen del pago"
            description="Revise los datos del pago y registre la observación si corresponde."
            form={formInstance}
          >
            <PagoConfirmacionResumen
              student={student}
              becaActiva={becaActiva}
              porcentajeBeca={porcentajeBeca}
              descuentoBeca={descuentoBeca}
              esPrimeraCuota={esPrimeraCuota}
              estadoActualAporte={estadoActualAporte}
              configuracionAporte={configuracionAporteActiva}
              esPagoGratuito={esPagoGratuito}
              montoCuota={montoCuota}
              selectedMetodoPago={metodosPago?.selectedMetodoPago ?? null}
              cuentasPago={cuentasPago}
              saldoRestante={saldoRestanteCompromiso}
              mostrarSelectorCompromiso={mostrarSelectorCompromiso}
              opcionesCompromiso={opcionesCompromiso}
              compromisoDias={compromisoDias}
              onChangeCompromisoDias={setCompromisoDias}
              fechaCompromiso={formatFechaLiteral(fechaCompromisoProyectada)}
              form={formInstance}
            />
          </FormWorkspaceSection>
        );
      }
      return null;
    },
    [
      student,
      configuracionAporteActiva,
      becaActiva,
      porcentajeBeca,
      descuentoBeca,
      esPrimeraCuota,
      estadoActualAporte,
      configuracionAportes?.error,
      montoCuota,
      saldoPendiente,
      metodosPago,
      cuentasPago,
      bancosAutorizados,
      esPagoGratuito,
      saldoRestanteCompromiso,
      mostrarSelectorCompromiso,
      opcionesCompromiso,
      compromisoDias,
      setCompromisoDias,
      fechaCompromisoProyectada,
    ]
  );

  // Sin estudiante: se redirige a la lista de origen (shell con aviso de carga)
  if (sinEstudiante) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Registrar pago" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Spin spinning tip="Redirigiendo a la lista anterior…">
              <div className="sd-spin-body" />
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  // Aporte ya cubierto: se redirige al detalle del pago (no hay nada que registrar)
  if (redirigiendoADetalle) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Registrar pago" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Spin spinning tip="El aporte ya está cubierto. Redirigiendo al detalle del pago…">
              <div className="sd-spin-body" />
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={backAction} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={cargandoDatosBase} tip="Cargando los datos del estudiante y del aporte…">
            {cargandoDatosBase ? (
              <div className="sd-spin-body" />
            ) : (
              <WizardForm
                variant="tabs"
                steps={wizardSteps}
                form={form}
                loading={isSubmitting}
                viewMode={false}
                resolveOptions={() => []}
                initialValues={{ montoCuota: 0 }}
                onFinish={handleWizardFinish}
                showSaveButton={false}
                renderSectionContent={renderSectionContent}
                onValidateBeforeNext={onValidateBeforeNext}
                onValidationError={onValidationError}
                strictForwardNavigation
                errorMessage={typeof submitError === 'string' ? submitError : ''}
                finishLabel="Registrar pago"
                nextLabel="Siguiente"
                prevLabel="Anterior"
              />
            )}
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PagosRegistrar;
