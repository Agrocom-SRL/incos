/**
 * Registrar pago de una inscripción de capacitación (CAP · pago CREAR) —
 * página completa, workspace alineado a CFG Académico. Gemelo de
 * `ParticipanteFormPage`: una sola sección no-declarativa
 * (`PagoCapacitacionFormFields` va en `beforeFields`), sin modal ni drawer.
 *
 * Página "dumb": la orquestación vive en `useInscripcionCapRegistrarPagoPage`.
 */

import { Alert, Empty, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { allSpacing } from '@theme/tokens';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useInscripcionCapRegistrarPagoPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapRegistrarPagoPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import PagoCapacitacionFormFields from '@capacitacion/inscripciones/components/organisms/PagoCapacitacionFormFields';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const InscripcionCapRegistrarPagoPage = () => {
  const {
    inscripcion,
    loading,
    error,
    isInvalidInscripcionId,
    pageTitle,
    breadcrumbItems,
    handleVolver,
    handleSubmit,
    submitLoading,
    form,
    reglasMetodo,
    handleMetodoPagoChange,
    saldosPorConcepto,
    conceptoOptions,
    cursoExterno,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapRegistrarPagoPage();

  const backAction = (
    <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </BackButton>
  );

  const saveButton = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.pago}
      accion="CREAR"
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Registrar pago
    </ActionButton>
  );

  if (isInvalidInscripcionId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={backAction} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="error" showIcon title="Identificador de inscripción inválido" />
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
          <Spin spinning={loading} tip="Cargando inscripción…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              {!loading && !error && !inscripcion ? (
                <Empty description="No se encontró la inscripción solicitada." />
              ) : null}

              {!loading && inscripcion ? (
                // `sd` aporta las variables de la ficha (`.sd-profile`); la clase semántica nombra el bloque.
                <section className="sd inscripcion-cap-ficha" aria-label="Datos de la inscripción">
                  <InscripcionFichaHeader inscripcion={inscripcion} />
                </section>
              ) : null}

              {!loading && inscripcion ? (
                <Form
                  form={form}
                  layout="vertical"
                  className="cfg-academico-form"
                  disabled={loading || submitLoading}
                >
                  <CfgFormWorkspace
                    title="Datos del pago"
                    description="Elija el concepto, el monto, la fecha y el método de pago. El comprobante de depósito es opcional. La cuenta de pago se habilita según el método elegido."
                    fields={[]}
                    form={form}
                    footer={saveButton}
                    beforeFields={
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
                          reglasMetodo={reglasMetodo}
                          saldosPorConcepto={saldosPorConcepto}
                          conceptoOptions={conceptoOptions}
                          cursoExterno={cursoExterno}
                          permiteComprobante
                          onMetodoPagoChange={handleMetodoPagoChange}
                          disabled={loading || submitLoading}
                        />
                      </>
                    }
                  />
                </Form>
              ) : null}
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default InscripcionCapRegistrarPagoPage;
