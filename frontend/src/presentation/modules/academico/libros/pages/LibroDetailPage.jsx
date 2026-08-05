/**
 * Ficha del libro de registro (P2) — cabecera (`sd-profile`) + tabla de folios.
 * Página "dumb": solo compone template + organismos y consume `useLibroDetail`.
 */

import { Alert, Popconfirm } from 'antd';
import { FileAddOutlined, LockOutlined, ProfileOutlined, UnlockOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, StatusPill } from '@atoms';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useLibroDetail } from '@application-academico/libros/hooks';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import { formatLibroEstado, getLibroEstadoPillClass } from '@application-academico/libros/utils/librosEstados';
import LibroFoliosSection from '../components/organisms/LibroFoliosSection.jsx';
import '@presentation/styles/pages/detail-page.css';

const LibroDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    libro,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    tableColumns,
    handleVolver,
    refetch,

    handleGenerarTodosFolios,
    generandoTodosFolios,

    handleCerrarLibro,
    handleReabrirLibro,
    actualizando,

    handleExportar,
    exportando,
  } = useLibroDetail();

  const puedeGenerar = hasPermiso(LIBROS_PERMISOS.libro, 'CREAR');
  const puedeEditar = hasPermiso(LIBROS_PERMISOS.libro, 'EDITAR');

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate header={<PageHeader title="Ficha del libro" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <Alert type="error" showIcon title="Identificador de libro inválido" />
      </PageTemplate>
    );
  }

  const estaAbierto = libro?.estado === 'ABIERTO';

  const acciones = libro ? (
    <>
      {puedeGenerar ? (
        <ActionButton
          permiso={LIBROS_PERMISOS.libro}
          accion="CREAR"
          variant="alternative"
          icon={<FileAddOutlined />}
          loading={generandoTodosFolios}
          onClick={handleGenerarTodosFolios}
          disabled={!estaAbierto}
          title={!estaAbierto ? 'El libro está cerrado: no admite nuevos folios' : undefined}
        >
          Generar todos los folios
        </ActionButton>
      ) : null}

      {puedeEditar && estaAbierto ? (
        <Popconfirm
          title="Cerrar libro de registro"
          description="El libro dejará de admitir nuevos folios. Puede reabrirlo después si es necesario."
          okText="Cerrar libro"
          cancelText="Cancelar"
          onConfirm={handleCerrarLibro}
        >
          <ActionButton
            permiso={LIBROS_PERMISOS.libro}
            accion="EDITAR"
            variant="warning"
            icon={<LockOutlined />}
            loading={actualizando}
          >
            Cerrar libro
          </ActionButton>
        </Popconfirm>
      ) : null}

      {puedeEditar && !estaAbierto ? (
        <ActionButton
          permiso={LIBROS_PERMISOS.libro}
          accion="EDITAR"
          variant="alternative"
          icon={<UnlockOutlined />}
          loading={actualizando}
          onClick={handleReabrirLibro}
        >
          Reabrir libro
        </ActionButton>
      ) : null}
    </>
  ) : null;

  return (
    <PageTemplate
      header={<PageHeader title="Ficha del libro" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      sidebar={null}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando libro de registro…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !libro}
        emptyDescription="No se encontró el libro de registro solicitado"
      >
        {libro ? (
          <>
            <DetailProfileCard
              avatarInitials={<ProfileOutlined />}
              active={estaAbierto}
              title={libro.libroLabel}
              subtitle={`${libro.gestionNombre || libro.gestionAnio || '—'} · Código ${libro.codigoRegistro || '—'}${
                libro.carrerasConFolio ? ` · ${libro.carrerasConFolio}` : ''
              }`}
              metaExtra={
                <StatusPill label={formatLibroEstado(libro.estado)} className={getLibroEstadoPillClass(libro.estado)} />
              }
              stats={[
                { label: 'Folios', value: libro.totalFolios ?? 0, primary: true },
                { label: 'Firmados', value: libro.foliosFirmados ?? 0 },
                { label: 'Anulados', value: libro.foliosAnulados ?? 0 },
                { label: 'Estudiantes', value: libro.totalEstudiantes ?? 0 },
              ]}
              actions={acciones}
            />

            <LibroFoliosSection
              folios={libro.folios ?? []}
              columns={tableColumns}
              onExportar={handleExportar}
              exportando={exportando}
            />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default LibroDetailPage;
