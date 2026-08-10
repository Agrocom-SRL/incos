/**
 * Ficha de empresa del catálogo de pasantías (Titulación · TIT · empresa·DETALLE).
 *
 * Cabecera de perfil + sección de información (sin tabs: la empresa no tiene
 * sub-entidades). Patrón `CursoCapacitacionDetail` simplificado. Acciones de
 * cabecera gated por permiso (ActionButton fail-closed): eliminar
 * (empresa·ELIMINAR, soft-delete). Página "dumb": la orquestación vive en
 * `usePasantiaEmpresaDetailPage`.
 */

import { Alert, Empty, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { usePermiso } from '@application-auth';
import { usePasantiaEmpresaDetailPage } from '@application-titulacion/pasantias/hooks/state/usePasantiaEmpresaDetailPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import PasantiaEmpresaFichaHeader from '@titulacion/pasantias/components/organisms/PasantiaEmpresaFichaHeader';
import PasantiaEmpresaInformacionSection from '@titulacion/pasantias/components/organisms/PasantiaEmpresaInformacionSection';
import '@presentation/styles/pages/detail-page.css';

const PasantiaEmpresaDetail = () => {
  const {
    empresa,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleEliminar,
    eliminando,
  } = usePasantiaEmpresaDetailPage();
  const puedeEditar = usePermiso(TITULACION_PERMISOS.pasantiaEmpresa, 'EDITAR');

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={TITULACION_PERMISOS.pasantiaEmpresa}
        accion="ELIMINAR"
        variant="danger"
        icon={<DeleteOutlined />}
        loading={eliminando}
        onClick={handleEliminar}
      >
        Eliminar empresa
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de empresa"
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
          {!loading && !error && !empresa && (
            <Empty
              description="No se encontró la empresa solicitada."
              style={{ marginTop: allSpacing.marginXL }}
            />
          )}
          {!loading && !error && empresa && (
            <>
              <PasantiaEmpresaFichaHeader
                empresa={empresa}
                puedeEditar={puedeEditar}
                onEditar={handleEditar}
              />
              <div className="sd-tabs-shell">
                <PasantiaEmpresaInformacionSection empresa={empresa} />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default PasantiaEmpresaDetail;
