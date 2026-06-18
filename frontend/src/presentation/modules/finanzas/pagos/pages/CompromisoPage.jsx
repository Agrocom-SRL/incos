/**
 * Compromiso de pago (Finanzas) — flujo INLINE: seleccionar estudiante, ver su
 * estado de aporte y registrar/actualizar/eliminar su compromiso de pago vigente.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 * No hace fetch ni orquesta (eso vive en provider + hooks/state). Reusa el shell de
 * formulario CFG Académico (`cfg-academico-workspace` / `cfg-academico-form-workspace`),
 * la referencia visual del CRUD del sistema, y los organismos de Fase 2
 * (EstudianteSelector, EstadoAporteResumen).
 */

import { Alert, Empty, Flex, Form, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCompromisoPage } from '@application-finanzas/hooks/state/useCompromisoPage';
import EstudianteSelector from '@finanzas/pagos/components/organisms/EstudianteSelector';
import EstadoAporteResumen from '@finanzas/pagos/components/organisms/EstadoAporteResumen';
import CompromisoForm from '@finanzas/pagos/components/organisms/CompromisoForm';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-registrar.css';

const { Paragraph } = Typography;

const CompromisoPage = () => {
  const [form] = Form.useForm();

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
    cabeceraId,
    compromiso,
    loadingCompromiso,
    errorCompromiso,
    handleGuardar,
    guardando,
    handleEliminar,
    eliminando,
  } = useCompromisoPage();

  const volverAction = (
    <Button variant="back" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </Button>
  );

  // El estado del aporte cargó pero el estudiante no tiene cabecera de aporte:
  // no hay sobre qué comprometer un pago.
  const sinCabecera = Boolean(estudianteSeleccionado) && !loadingEstado && !errorEstado && estado && !cabeceraId;

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Compromiso de pago"
          breadcrumbItems={breadcrumbItems}
          actions={volverAction}
        />
      }
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {/* Paso 1: estudiante */}
        <section className="cfg-academico-workspace cfg-academico-form-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Estudiante" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Busque y seleccione al estudiante para gestionar su compromiso de pago del aporte
              académico.
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

        {/* Mensaje: estudiante sin cabecera de aporte en la gestión vigente */}
        {sinCabecera ? (
          <Alert
            type="warning"
            showIcon
            title="El estudiante no tiene un aporte registrado"
            description="No hay una cabecera de aporte en la gestión vigente sobre la cual registrar un compromiso de pago. Registre primero un pago de aporte para este estudiante."
          />
        ) : null}

        {/* Paso 3: formulario de compromiso */}
        {estudianteSeleccionado && cabeceraId && !loadingEstado && !errorEstado ? (
          <section className="cfg-academico-workspace cfg-academico-form-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Compromiso de pago" />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                {compromiso?.id
                  ? 'El estudiante tiene un compromiso vigente. Puede actualizarlo o eliminarlo.'
                  : 'Registre la fecha en que el estudiante se compromete a regularizar su aporte.'}
              </Paragraph>
            </header>
            <div className="cfg-academico-form-workspace__body">
              {errorCompromiso ? (
                <Alert
                  type="error"
                  showIcon
                  title="No se pudo cargar el compromiso de pago"
                  description={errorCompromiso}
                  style={{ marginBottom: allSpacing.marginLG }}
                />
              ) : null}

              {loadingCompromiso ? (
                <Flex justify="center" style={{ width: '100%' }}>
                  <Spin />
                </Flex>
              ) : (
                <CompromisoForm
                  form={form}
                  compromiso={compromiso}
                  onGuardar={handleGuardar}
                  onEliminar={handleEliminar}
                  guardando={guardando}
                  eliminando={eliminando}
                />
              )}
            </div>
          </section>
        ) : null}

        {/* Estado inicial sin estudiante (refuerzo visual del primer paso) */}
        {!estudianteSeleccionado && estudiantes.length === 0 && !loadingBusqueda ? (
          <Empty description="Seleccione un estudiante para comenzar" />
        ) : null}
      </Flex>
    </PageTemplate>
  );
};

export default CompromisoPage;
