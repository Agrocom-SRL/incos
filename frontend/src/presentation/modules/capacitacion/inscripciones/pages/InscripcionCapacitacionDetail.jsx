/**
 * Ficha de inscripción de capacitación (CAP · DETALLE) — participante + curso
 * + historial de pagos + acceso a "Registrar pago" (≈ PagosDetail de Finanzas).
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla.
 * El botón "Registrar pago" navega a su propia página y valida
 * `capacitacion.pago CREAR` (fail-closed). No se muestra si no hay saldo
 * pendiente (matrícula y curso saldados): no hay nada que cobrar.
 *
 * "Anular inscripción" (capacitacion.inscripcion ACCIÓN EDITAR — no existe
 * ANULAR en el vocabulario cerrado de acciones RBAC; se reutiliza EDITAR en
 * vez de ELIMINAR para no mezclarla con el "retiro" voluntario, que ya usa
 * ELIMINAR) es una decisión administrativa sensible: vive en la ficha (con
 * todo el contexto de la inscripción a la vista), no en la tabla de listado.
 * Confirmación con `Popconfirm` que deja explícito que el monto ya pagado no
 * se devuelve; solo se ofrece si la inscripción sigue PENDIENTE o INSCRITA.
 *
 * Correcciones (capacitacion.inscripcion EDITAR): «Editar» en la cabecera abre
 * la página de edición de la inscripción (solo grupo); en la pestaña Pagos
 * cada fila permite «Editar pago» (página propia) y «Anular pago» (`useInscripcionPagoAcciones`,
 * modal propio). Los pagos anulados se muestran marcados y sin acciones.
 */

import { Alert, Empty, Flex, Popconfirm, Spin, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  EditOutlined,
  FilePdfOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useInscripcionCapacitacionDetailPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapacitacionDetailPage';
import { useInscripcionPagoAcciones } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionPagoAcciones';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { usePermiso } from '@application-auth';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import InscripcionDatosSection from '@capacitacion/inscripciones/components/organisms/InscripcionDatosSection';
import InscripcionResumenPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionResumenPagosSection';
import InscripcionRequisitosSection from '@capacitacion/inscripciones/components/organisms/InscripcionRequisitosSection';
import InscripcionPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionPagosSection';
import PagoAnularModal from '@capacitacion/inscripciones/components/organisms/PagoAnularModal';
import '@presentation/styles/pages/detail-page.css';

const InscripcionCapacitacionDetail = () => {
  const {
    inscripcion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleIrARegistrarPago,
    handleIrAEditar,
    puedeAnular,
    handleAnular,
    anulando,
    pendientes,
    handleDescargarComprobante,
    descargandoFormulario,
    handleDescargarFormulario,
    reciboDescargandoId,
    handleDescargarRecibo,
  } = useInscripcionCapacitacionDetailPage();
  const pagoAcciones = useInscripcionPagoAcciones();
  const comprobante = {
    puedeDescargar: usePermiso(CAPACITACION_PERMISOS.inscripcion, 'DETALLE'),
    onDescargar: handleDescargarComprobante,
    puedeDescargarRecibo: usePermiso(CAPACITACION_PERMISOS.inscripcion, 'DETALLE'),
    reciboDescargandoId,
    onDescargarRecibo: handleDescargarRecibo,
  };

  const tabItems = inscripcion
    ? [
        {
          key: 'informacion',
          label: 'Información',
          children: (
            <div className="sd-tab-body">
              <InscripcionDatosSection inscripcion={inscripcion} />
            </div>
          ),
        },
        {
          key: 'requisitos',
          label: `Requisitos (${inscripcion.requisitos?.length ?? 0})`,
          children: (
            <div className="sd-tab-body">
              <InscripcionRequisitosSection requisitos={inscripcion.requisitos ?? []} />
            </div>
          ),
        },
        {
          key: 'pagos',
          label: 'Pagos',
          children: (
            <div className="sd-tab-body">
              <InscripcionResumenPagosSection inscripcion={inscripcion} />
              <InscripcionPagosSection
                inscripcion={inscripcion}
                comprobante={comprobante}
                acciones={{
                  evaluarPago: pagoAcciones.evaluarPago,
                  onEditar: pagoAcciones.irAEditar,
                  onAnular: pagoAcciones.abrirAnular,
                }}
              />
            </div>
          ),
        },
      ]
    : [];

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={CAPACITACION_PERMISOS.inscripcion}
        accion="DETALLE"
        variant="view"
        icon={<FilePdfOutlined />}
        loading={descargandoFormulario}
        onClick={handleDescargarFormulario}
        disabled={!inscripcion}
      >
        Formulario PDF
      </ActionButton>
      <ActionButton
        permiso={CAPACITACION_PERMISOS.inscripcion}
        accion="EDITAR"
        variant="warning"
        icon={<EditOutlined />}
        onClick={handleIrAEditar}
        disabled={!inscripcion}
      >
        Editar
      </ActionButton>
      {inscripcion?.saldoTotal > 0 ? (
        <ActionButton
          permiso={CAPACITACION_PERMISOS.pago}
          accion="CREAR"
          variant="primary"
          icon={<DollarOutlined />}
          onClick={handleIrARegistrarPago}
          disabled={!inscripcion}
        >
          Registrar pago
        </ActionButton>
      ) : null}
      {puedeAnular ? (
        <Popconfirm
          title="Anular esta inscripción"
          description="El monto ya pagado no se devuelve. ¿Confirma que desea anular la inscripción?"
          okText="Anular inscripción"
          okButtonProps={{ danger: true, loading: anulando }}
          cancelText="Cancelar"
          onConfirm={handleAnular}
        >
          <ActionButton
            permiso={CAPACITACION_PERMISOS.inscripcion}
            accion="EDITAR"
            variant="danger"
            icon={<StopOutlined />}
            loading={anulando}
            disabled={!inscripcion}
          >
            Anular inscripción
          </ActionButton>
        </Popconfirm>
      ) : null}
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de inscripción"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando ficha…">
        <div className="sd sd-spin-body">
          {!loading && error && (
            <Alert
              type="error"
              title="No se pudo cargar la ficha"
              description={error}
              showIcon
              style={{ marginBottom: allSpacing.margin }}
            />
          )}
          {!loading && !error && !inscripcion && (
            <Empty
              description="No se encontró la inscripción solicitada."
              style={{ marginTop: allSpacing.marginXL }}
            />
          )}
          {!loading && !error && inscripcion && (
            <>
              <InscripcionFichaHeader inscripcion={inscripcion} />
              {pendientes.length > 0 ? (
                <Alert
                  className="sd-pendientes"
                  type="warning"
                  showIcon
                  title="La inscripción está pendiente: falta para pasar a «Inscrito»"
                  description={
                    <ul className="sd-pendientes__lista">
                      {pendientes.map((p) => (
                        <li key={p.key}>{p.label}</li>
                      ))}
                    </ul>
                  }
                />
              ) : null}
              <div className="sd-tabs-shell">
                <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>

      {inscripcion ? (
        <>
          <PagoAnularModal
            pago={pagoAcciones.pagoAnulando}
            form={pagoAcciones.formAnular}
            anulando={pagoAcciones.anulandoPagoEnCurso}
            error={pagoAcciones.errorAnular}
            onConfirmar={pagoAcciones.confirmarAnulacion}
            onCancel={pagoAcciones.cerrarAnular}
          />
        </>
      ) : null}
    </PageTemplate>
  );
};

export default InscripcionCapacitacionDetail;
