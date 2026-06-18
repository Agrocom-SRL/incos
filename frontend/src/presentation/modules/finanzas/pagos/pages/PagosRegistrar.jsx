/**
 * Registrar abono/pago de aporte (Finanzas) — flujo INLINE: seleccionar estudiante,
 * ver su estado de aporte y registrar la cuota.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 * No hace fetch ni orquesta (eso vive en provider + hooks/state). Reusa el shell de
 * formulario CFG Académico (`cfg-academico-workspace` / `cfg-academico-form-workspace`),
 * la referencia visual del CRUD del sistema.
 */

import { Alert, Flex, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { usePagosRegistrarPage } from '@application-finanzas/hooks/state/usePagosRegistrarPage';
import EstudianteSelector from '@finanzas/pagos/components/organisms/EstudianteSelector';
import EstadoAporteResumen from '@finanzas/pagos/components/organisms/EstadoAporteResumen';
import AbonoForm from '@finanzas/pagos/components/organisms/AbonoForm';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-registrar.css';

const { Paragraph } = Typography;

const PagosRegistrar = () => {
  const {
    breadcrumbItems,
    handleVolver,
    estudiantes,
    loadingBusqueda,
    errorBusqueda,
    buscarEstudiantes,
    estudianteSeleccionado,
    handleSeleccionarEstudiante,
    handleCambiarEstudiante,
    estado,
    loadingEstado,
    errorEstado,
    saldoPendiente,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    form,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    handleFinish,
    registrando,
  } = usePagosRegistrarPage();

  const volverAction = (
    <Button variant="back" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </Button>
  );

  return (
    <PageTemplate
      header={
        <PageHeader title="Registrar pago" breadcrumbItems={breadcrumbItems} actions={volverAction} />
      }
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {/* Paso 1: estudiante */}
        <section className="cfg-academico-workspace cfg-academico-form-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Busque y seleccione al estudiante para registrar su abono de aporte académico.
            </Paragraph>
          </header>
          <div className="cfg-academico-form-workspace__body">
            <EstudianteSelector
              estudiantes={estudiantes}
              loading={loadingBusqueda}
              error={errorBusqueda}
              onBuscar={buscarEstudiantes}
              estudianteSeleccionado={estudianteSeleccionado}
              onSeleccionar={handleSeleccionarEstudiante}
              onCambiar={handleCambiarEstudiante}
            />
          </div>
        </section>

        {/* Paso 2: estado del aporte */}
        {estudianteSeleccionado ? (
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Estado del aporte" />
            </header>
            <div className="cfg-academico-form-workspace__body">
              <EstadoAporteResumen estado={estado} loading={loadingEstado} error={errorEstado} />
            </div>
          </section>
        ) : null}

        {/* Paso 3: formulario de abono */}
        {estudianteSeleccionado && estado && !loadingEstado && !errorEstado ? (
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Datos del abono" />
            </header>
            <div className="cfg-academico-form-workspace__body">
              {errorCatalogos ? (
                <Alert
                  type="error"
                  showIcon
                  title="No se pudieron cargar los catálogos de pago"
                  description={errorCatalogos}
                  style={{ marginBottom: allSpacing.marginLG }}
                />
              ) : null}
              <AbonoForm
                form={form}
                metodosPago={metodosPago}
                cuentasPago={cuentasPago}
                loadingCatalogos={loadingCatalogos}
                metodoPagoId={metodoPagoId}
                reglasMetodo={reglasMetodo}
                saldoPendiente={saldoPendiente}
                onMetodoPagoChange={handleMetodoPagoChange}
                onFinish={handleFinish}
                onCancel={handleVolver}
                submitting={registrando}
              />
            </div>
          </section>
        ) : null}
      </Flex>
    </PageTemplate>
  );
};

export default PagosRegistrar;
