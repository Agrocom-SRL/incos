import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined, CompressOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { IconButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosAulasContext } from '@application-institucional/horarios';
import { HorariosFiltersBar } from '../components';
import { GestionHorariosAulasAsignarSection } from '../components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const sectionCardProps = {
    style: {
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
    },
    styles: {
        body: { padding: `${componentConfig.Card.paddingLG}px` },
    },
};

const GestionHorariosAulasPage = () => {
    const [searchParams] = useSearchParams();
    const [enModoEdicion, setEnModoEdicion] = useState(false);
    const [vistaExpandida, setVistaExpandida] = useState(false);

    useEffect(() => {
        if (!vistaExpandida) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [vistaExpandida]);
    const {
        breadcrumbItems,
        handleVolver,
        diaActivo,
        filters,
        options,
        onFilterChange,
        clearFilters,
        setDiaActivo,
        bloques,
        bloquesFiltrados,
        aulas,
        onAsignarAula,
        patchLoading,
        bloquesLoading,
    } = useHorariosAulasContext();

    const initialForzarEdicion = searchParams.get('edicion') === '1';

    const headerActions = useMemo(
        () => (
            <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
                <ArrowLeftOutlined /> Volver
            </button>
        ),
        [handleVolver],
    );

    return (
        <PageTemplate
            header={
                <PageHeader title="Horarios en aulas" breadcrumbItems={breadcrumbItems} actions={headerActions} />
            }
            sidebar={null}
        >
            <div
                className={[
                    'horarios-aulas-page-root',
                    vistaExpandida ? 'horarios-aulas-page-root--expanded' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <Card
                    className={[
                        'horarios-gestion-planificacion',
                        vistaExpandida ? 'horarios-gestion-planificacion--expanded' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    {...sectionCardProps}
                    styles={{
                        ...sectionCardProps.styles,
                        body: {
                            ...sectionCardProps.styles.body,
                            ...(vistaExpandida
                                ? {
                                    flex: 1,
                                    minHeight: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }
                                : {}),
                        },
                    }}
                >
                    <Flex
                        vertical
                        gap={allSpacing.marginLG}
                        className={[
                            'horarios-aulas-page__inner-flex',
                            vistaExpandida ? 'horarios-aulas-page__inner-flex--expanded' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <HorariosFiltersBar
                            filters={filters}
                            options={options}
                            onFilterChange={onFilterChange}
                            onClearFilters={clearFilters}
                            title="Aulas y planificación semanal"
                            visibleFields={['carrera', 'periodo']}
                            disabled={enModoEdicion}
                            ocultarSelectoresFiltro={enModoEdicion}
                            headerTrailing={
                                <IconButton
                                    variant="info"
                                    icon={vistaExpandida ? <CompressOutlined /> : <ExpandOutlined />}
                                    onClick={() => setVistaExpandida((v) => !v)}
                                    size="middle"
                                    circle={true}
                                    aria-label={vistaExpandida ? 'Salir de pantalla completa' : 'Expandir planificación a pantalla completa'}
                                    title={vistaExpandida ? 'Restaurar vista' : 'Pantalla completa'}
                                />
                            }
                        />
                        <GestionHorariosAulasAsignarSection
                            diaActivo={diaActivo}
                            setDiaActivo={setDiaActivo}
                            bloques={bloques}
                            bloquesFiltrados={bloquesFiltrados}
                            aulas={aulas}
                            onAsignarAula={onAsignarAula}
                            patchLoading={patchLoading}
                            bloquesLoading={bloquesLoading}
                            initialForzarEdicion={initialForzarEdicion}
                            onEditModeChange={setEnModoEdicion}
                            vistaExpandida={vistaExpandida}
                        />
                    </Flex>
                </Card>
            </div>
        </PageTemplate>
    );
};

export default GestionHorariosAulasPage;
