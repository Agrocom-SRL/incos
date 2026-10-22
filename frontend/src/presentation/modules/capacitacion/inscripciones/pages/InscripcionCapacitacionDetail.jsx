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
 */

import { Alert, Empty, Flex, Popconfirm, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, DollarOutlined, FilePdfOutlined, StopOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useInscripcionCapacitacionDetailPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapacitacionDetailPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { usePermiso } from '@application-auth';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import InscripcionDatosSection from '@capacitacion/inscripciones/components/organisms/InscripcionDatosSection';
import InscripcionResumenPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionResumenPagosSection';
import InscripcionRequisitosSection from '@capacitacion/inscripciones/components/organisms/InscripcionRequisitosSection';
import InscripcionPagosSection from '@capacitacion/inscripciones/components/organisms/InscripcionPagosSection';
import '@presentation/styles/pages/detail-page.css';

const InscripcionCapacitacionDetail = () => {
  const {
    inscripcion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleIrARegistrarPago,
    puedeAnular,
    handleAnular,
    anulando,
    pendientes,
    requisitosDraft,
    requisitosDirty,
    guardandoRequisitos,
    handleToggleRequisito,
    handleGuardarRequisitos,
    handleDescartarRequisitos,
    subiendoComprobante,
    handleAdjuntarComprobante,
    handleDescargarComprobante,
    descargandoFormulario,
    handleDescargarFormulario,
    reciboDescargandoId,
    handleDescargarRecibo,
  } = useInscripcionCapacitacionDetailPage();
  const puedeEditarInscripcion = usePermiso(CAPACITACION_PERMISOS.inscripcion, 'EDITAR');
  const comprobante = {
    puedeDescargar: usePermiso(CAPACITACION_PERMISOS.inscripcion, 'DETALLE'),
    puedeAdjuntar: usePermiso(CAPACITACION_PERMISOS.pago, 'CREAR'),
    subiendo: subiendoComprobante,
    onDescargar: handleDescargarComprobante,
    onAdjuntar: handleAdjuntarComprobante,
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
          label: `Requisitos (${requisitosDraft.length})`,
          children: (
            <div className="sd-tab-body">
              <InscripcionRequisitosSection
                requisitos={requisitosDraft}
                dirty={requisitosDirty}
                saving={guardandoRequisitos}
                editable={puedeEditarInscripcion}
                onToggle={handleToggleRequisito}
                onGuardar={handleGuardarRequisitos}
                onDescartar={handleDescartarRequisitos}
              />
            </div>
          ),
        },
        {
          key: 'pagos',
          label: 'Pagos',
          children: (
            <div className="sd-tab-body">
              <InscripcionResumenPagosSection inscripcion={inscripcion} />
              <InscripcionPagosSection inscripcion={inscripcion} comprobante={comprobante} />
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
              <div className="sd-tabs-shell">
                {pendientes.length > 0 ? (
                  <Alert
                    type="warning"
                    showIcon
                    title="La inscripción está pendiente: falta para pasar a «Inscrito»"
                    description={
                      <ul>
                        {pendientes.map((p) => (
                          <li key={p.key}>{p.label}</li>
                        ))}
                      </ul>
                    }
                    style={{ marginBottom: allSpacing.margin }}
                  />
                ) : null}
                <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default InscripcionCapacitacionDetail;
