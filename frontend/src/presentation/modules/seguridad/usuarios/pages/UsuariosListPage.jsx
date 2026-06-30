/**
 * Menú SEG → Usuarios: listado server-paginado separado por pestañas de
 * categoría de rol (sistema | estudiante | docente | personal).
 * URL: /seguridad/usuarios?categoria=...
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flex, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuariosListPageContext } from '@/application/modules/seguridad/hooks';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import {
  USUARIOS_CATEGORIA_TABS,
  resolveUsuariosCategoria,
} from '@modules/seguridad/usuarios/config/usuariosCategoriaTabs.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@modules/seguridad/usuarios/styles/usuarios.css';

export default function UsuariosListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    usuarios,
    loading,
    searchText,
    columns,
    breadcrumbItems,
    tablePagination,
    categoria,
    setCategoria,
    handleCreateUsuario,
    handleSearchChange,
  } = useSeguridadUsuariosListPageContext();

  const activeKey = useMemo(
    () => resolveUsuariosCategoria(searchParams.get('categoria')),
    [searchParams],
  );

  // La URL manda: el estado del hook (que alimenta el fetch) sigue al tab activo.
  useEffect(() => {
    if (categoria !== activeKey) setCategoria(activeKey);
  }, [activeKey, categoria, setCategoria]);

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ categoria: key }, { replace: true });
    },
    [setSearchParams],
  );

  const usuariosTable = useMemo(
    () => (
      <TableListView
        embedded
        data={usuarios}
        loading={loading}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por usuario o correo de ficha..."
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{
          ...tablePagination,
          showTotal: (total) => `Total: ${total} usuarios`,
        }}
        loadingTip="Cargando usuarios..."
      />
    ),
    [usuarios, loading, searchText, handleSearchChange, columns, tablePagination],
  );

  const tabItems = useMemo(
    () =>
      USUARIOS_CATEGORIA_TABS.map((tab) => {
        const Icon = tab.icon;
        return {
          key: tab.key,
          label: (
            <span className="sd-tab-label">
              <Icon /> {tab.label}
            </span>
          ),
          // Solo el tab activo monta la tabla (datos compartidos del contexto).
          children: (
            <div className="cfg-academico-tab-panel">
              {tab.key === activeKey ? usuariosTable : null}
            </div>
          ),
        };
      }),
    [activeKey, usuariosTable],
  );

  const activeMeta = USUARIOS_CATEGORIA_TABS.find((t) => t.key === activeKey);

  const panelActions = (
    <ActionButton
      permiso="seguridad.usuario.crear"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleCreateUsuario}
    >
      Nuevo Usuario
    </ActionButton>
  );

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="LISTAR"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Administración de Usuarios" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader
                  title={activeMeta?.title ?? 'Usuarios'}
                  actions={panelActions}
                />
                {activeMeta?.description ? (
                  <Typography.Paragraph type="secondary" className="cfg-academico-workspace__desc">
                    {activeMeta.description}
                  </Typography.Paragraph>
                ) : null}
              </header>

              <div className="sd-tabs-shell cfg-academico-tabs-shell">
                <Tabs
                  className="sd-tabs cfg-academico-workspace__tabs"
                  activeKey={activeKey}
                  items={tabItems}
                  onChange={onTabChange}
                  destroyOnHidden={false}
                />
              </div>
            </section>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
}
