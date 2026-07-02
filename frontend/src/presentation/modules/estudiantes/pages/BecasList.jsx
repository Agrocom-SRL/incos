/**
 * BecasList - Página para listar becas
 * 
 * Single Responsibility: Orquestar la configuración específica de becas
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas, acciones y datos específicos de becas
 */

import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { CarreraTabsListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import { useBecasListContext } from '@application-estudiantes/hooks';
import { createBecasTableColumns } from '@estudiantes/config';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

/** Accessor de carrera para agrupar por tabs (carrera anidada del listado de becas). */
const getCarreraBeca = (record) => record.carrera || {};

/** Segundo nivel: paralelo asignado (filtro segmentado de chips dentro de cada carrera). */
const subGroupParalelo = {
  allLabel: 'Todos',
  sinLabel: 'Sin paralelo',
  getSubgrupo: (record) => {
    const paralelo = record.paralelo;
    if (!paralelo?.id && !paralelo?.nombre) return null;
    return {
      id: paralelo.id ?? null,
      nombre: [paralelo.nombre, paralelo.turno].filter(Boolean).join(' · ') || 'Paralelo',
      // Color por NOMBRE BASE (sin turno): "PRIMERO A" recibe el mismo color en toda carrera.
      colorKey: paralelo.nombre || null,
    };
  },
};

const BecasList = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        becas = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
        refetch,
        deleteBeca,
        tablePagination,
    } = useBecasListContext();

    const handleNuevaBeca = () => {
        navigate('/estudiantes/becas/asignar/seleccionar-estudiante', {
            state: {
                returnListPath: pathname,
                menuSidebarKey: 'MAT-BEC-LISTAR',
            },
        });
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () =>
            createBecasTableColumns(navigate, refetch, deleteBeca, {
                viewNavigateState: {
                    menuSidebarKey: 'MAT-BEC-LISTAR',
                    returnListPath: pathname,
                },
            }),
        [navigate, refetch, deleteBeca, pathname]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
      { title: 'Inicio', href: '/' },
      { title: 'Admisión', href: '/estudiantes/listar' },
      { title: 'Becas' },
    ], []);

    const nuevaBecaAction = (
        <ActionButton
            permiso="matricula.beca.asignar"
            accion="CREAR"
            variant="primary"
            icon={<PlusOutlined />}
            onClick={handleNuevaBeca}
        >
            Nueva Asignación de Beca
        </ActionButton>
    );

    return (
        <PageTemplate
            header={<PageHeader title="Lista de Becas" breadcrumbItems={breadcrumbItems} />}
            sidebar={null}
        >
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                <section className="cfg-academico-workspace">
                    <header className="cfg-academico-workspace__header">
                        <ListPanelHeader title="Lista de becas" actions={nuevaBecaAction} />
                        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                            Becas asignadas a los estudiantes: tipo, porcentaje de descuento,
                            vigencia y estado. Desde aquí registras nuevas asignaciones de beca.
                        </Paragraph>
                    </header>
                    <CarreraTabsListView
                        rows={becas}
                        getCarrera={getCarreraBeca}
                        subGroup={subGroupParalelo}
                        loading={loading}
                        error={error}
                        searchText={searchText}
                        onSearchChange={(e) => setSearchText(e.target.value)}
                        searchPlaceholder="Buscar por nombre, tipo, descripción..."
                        columns={tableColumns}
                        rowKey={(record) => record.id || Math.random()}
                        searchColSpan={10}
                        searchStyle={{ maxWidth: 520 }}
                        pagination={tablePagination}
                        defaultSort={{
                            field: 'nombre',
                            order: 'ascend',
                        }}
                        loadingTip="Cargando becas..."
                    />
                </section>
            </Flex>
        </PageTemplate>
    );
};

export default BecasList;
