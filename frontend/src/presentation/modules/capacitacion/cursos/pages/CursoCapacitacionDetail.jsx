/**
 * Ficha de curso de capacitación (Capacitación · CAP · DETALLE) — cabecera con
 * resumen + tabs "Información" y "Horarios".
 *
 * Página "dumb": compone template + organismos y consume el hook de pantalla
 * (espejo de `PagosDetail`). Shell de detalle `sd-*` compartido.
 */

import { Alert, Empty, Flex, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { usePermiso } from '@application-auth';
import { useCursoCapacitacionDetailPage } from '@application-capacitacion/cursos/hooks/state/useCursoCapacitacionDetailPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import CursoCapacitacionFichaHeader from '@capacitacion/cursos/components/organisms/CursoCapacitacionFichaHeader';
import CursoInformacionSection from '@capacitacion/cursos/components/organisms/CursoInformacionSection';
import CursoHorariosSection from '@capacitacion/cursos/components/organisms/CursoHorariosSection';
import '@presentation/styles/pages/detail-page.css';

const CursoCapacitacionDetail = () => {
  const {
    curso,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    puedeAbrir,
    puedeCancelar,
    handleAbrirInscripciones,
    handleCancelarCurso,
    procesandoTransicion,
  } = useCursoCapacitacionDetailPage();
  const puedeEditar = usePermiso(CAPACITACION_PERMISOS.curso, 'EDITAR');

  const headerActions = (
    <Flex gap="small" wrap>
      {puedeAbrir && (
        <ActionButton
          permiso={CAPACITACION_PERMISOS.curso}
          accion="EDITAR"
          variant="success"
          icon={<PlayCircleOutlined />}
          loading={procesandoTransicion}
          onClick={handleAbrirInscripciones}
        >
          Abrir inscripciones
        </ActionButton>
      )}
      {puedeCancelar && (
        <ActionButton
          permiso={CAPACITACION_PERMISOS.curso}
          accion="EDITAR"
          variant="danger"
          icon={<StopOutlined />}
          loading={procesandoTransicion}
          onClick={handleCancelarCurso}
        >
          Cancelar curso
        </ActionButton>
      )}
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  const tabItems = curso
    ? [
        {
          key: 'informacion',
          label: 'Información',
          children: <CursoInformacionSection curso={curso} />,
        },
        {
          key: 'horarios',
          label: `Horarios (${curso.horarios.length})`,
          children: <CursoHorariosSection horarios={curso.horarios} />,
        },
      ]
    : [];

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de curso"
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
          {!loading && !error && !curso && (
            <Empty
              description="No se encontró el curso solicitado."
              style={{ marginTop: allSpacing.marginXL }}
            />
          )}
          {!loading && !error && curso && (
            <>
              <CursoCapacitacionFichaHeader
                curso={curso}
                puedeEditar={puedeEditar}
                onEditar={handleEditar}
              />
              <div className="sd-tabs-shell">
                <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default CursoCapacitacionDetail;
