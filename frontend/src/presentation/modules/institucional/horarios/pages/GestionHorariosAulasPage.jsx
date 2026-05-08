import { useMemo, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Flex } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
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
    const [enModoEdicion, setEnModoEdicion] = useState(false);
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
    } = useHorariosAulasContext();

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
            <Card className="horarios-gestion-planificacion" {...sectionCardProps}>
                <Flex vertical gap={allSpacing.marginLG}>
                    <HorariosFiltersBar
                        filters={filters}
                        options={options}
                        onFilterChange={onFilterChange}
                        onClearFilters={clearFilters}
                        title="Aulas y planificación semanal"
                        visibleFields={['carrera', 'periodo']}
                        disabled={enModoEdicion}
                    />
                    <GestionHorariosAulasAsignarSection
                        diaActivo={diaActivo}
                        setDiaActivo={setDiaActivo}
                        bloques={bloques}
                        bloquesFiltrados={bloquesFiltrados}
                        aulas={aulas}
                        onAsignarAula={onAsignarAula}
                        patchLoading={patchLoading}
                        onEditModeChange={setEnModoEdicion}
                    />
                </Flex>
            </Card>
        </PageTemplate>
    );
};

export default GestionHorariosAulasPage;
