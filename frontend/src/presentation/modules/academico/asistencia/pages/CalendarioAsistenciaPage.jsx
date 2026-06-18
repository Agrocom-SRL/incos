/**
 * Pantalla CALENDARIO de asistencia (bimestre activo del curso).
 *
 * Layout de ficha (PageTemplate header + content + sidebar):
 *  - Header: ficha del curso con swatch del color del bimestre + acción "Marcar asistencia".
 *  - Content: calendario anual (días del bimestre, días de clase, sin clase) + lista de
 *    actividades que explican los días sin clase.
 *  - Sidebar: KPIs del resumen de asistencia + contexto (turno, rango, fecha actual).
 *
 * Interacción del calendario:
 *  - día de clase → arma esa semana en la planilla.
 *  - día del bimestre sin horario → abre el drawer de fecha especial precargado.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Skeleton } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useCalendarioAsistenciaState } from '@application-academico/asistencia/hooks/state/useCalendarioAsistenciaState.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ESTADOS_REGISTRO } from '@application-academico/asistencia/utils/asistenciaEstados.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import CalendarioMensualAsistencia from '../components/CalendarioMensualAsistencia.jsx';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia.jsx';
import ActividadesSinClaseList from '../components/ActividadesSinClaseList.jsx';
import ResumenAsistenciaSidebar from '../components/ResumenAsistenciaSidebar.jsx';
import FechaEspecialDrawer from '../components/FechaEspecialDrawer.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/asistencia.css';

const CalendarioAsistenciaPage = () => {
  const navigate = useNavigate();
  const {
    curso,
    bimestre,
    bimestreNombre,
    bimestreColor,
    gestion,
    anioCalendario,
    hoy,
    resumen,
    horario,
    dias,
    actividadesSinClase,
    rango,
    registroEstado,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    volverPath,
    planillaPath,
    habilitarFechaEspecial,
    eliminarFechaEspecial,
    creandoSesion,
    eliminandoSesion,
    fechaEspecial,
    abrirFechaEspecial,
    abrirEditarFechaEspecial,
    cerrarFechaEspecial,
  } = useCalendarioAsistenciaState();

  const irAPlanilla = useCallback(
    (fecha) => navigate(planillaPath(fecha)),
    [navigate, planillaPath]
  );

  const sigla = curso?.materiaSigla ?? null;

  const pageHeader = (
    <PageHeader
      title={
        <Flex align="center" gap={allSpacing.marginXS} wrap="wrap">
          <CalendarOutlined aria-hidden />
          <span>
            {sigla ? `Calendario · ${sigla}` : 'Calendario de asistencia'}
          </span>
        </Flex>
      }
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginXS} wrap="wrap">
          <ActionButton
            permiso={ASISTENCIA_PERMISOS.registroCuaderno}
            accion="LISTAR"
            variant="primary"
            icon={<EditOutlined />}
            onClick={() => irAPlanilla()}
          >
            Marcar asistencia
          </ActionButton>
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(volverPath)}
            aria-label="Volver a la planilla"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  // La ficha del curso va DENTRO del shell, encima del contenido principal.
  const cabecera = curso ? (
    <CursoContextoAsistencia
      curso={curso}
      bimestre={bimestre}
      bimestreNombre={bimestreNombre}
      bimestreColor={bimestreColor}
      gestion={gestion}
      registroEstado={registroEstado}
    />
  ) : null;

  // Estructura común: header de página + DashboardPageShell (cabecera + content + sidebar).
  const renderPagina = (mainNode, sidebarNode = null) => (
    <Flex
      vertical
      gap="large"
      className="page-container asi-calendario-shell"
      style={{ width: '100%' }}
    >
      <PageHeaderArea>{pageHeader}</PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex
            vertical
            gap={allSpacing.marginLG}
            style={{ width: '100%', minWidth: 0 }}
          >
            {cabecera}
            {mainNode}
          </Flex>
        </MainContent>
        {sidebarNode ? <InfoSidebar>{sidebarNode}</InfoSidebar> : null}
      </DashboardPageShell>
    </Flex>
  );

  if (isLoading && dias.length === 0) {
    return renderPagina(
      <Card {...asistenciaSectionCardProps}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (error && dias.length === 0) {
    return renderPagina(
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar el calendario"
        description={typeof error === 'string' ? error : String(error)}
        action={
          <Button size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      />
    );
  }

  const content = (
    <Flex vertical gap={allSpacing.marginLG} className="asi-calendario-page">
      {registroEstado === ESTADOS_REGISTRO.CERRADO ? (
        <Alert
          type="warning"
          showIcon
          title="Registro cerrado (solo lectura)"
          description="La asistencia de este bimestre está cerrada. Reabrila desde la planilla para corregir."
        />
      ) : null}

      {dias.length === 0 ? (
        <Card {...asistenciaSectionCardProps}>
          <Alert
            type="info"
            showIcon
            title="Sin días de clase en el bimestre"
            description="Todavía no hay días de clase configurados para este curso en el bimestre vigente."
          />
        </Card>
      ) : (
        <Card {...asistenciaSectionCardProps}>
          <CalendarioMensualAsistencia
            dias={dias}
            rango={rango}
            actividadesSinClase={actividadesSinClase}
            bimestreColor={bimestreColor}
            anioCalendario={anioCalendario}
            hoy={hoy}
            onElegirDia={irAPlanilla}
            onDiaEspecial={abrirFechaEspecial}
            onEditarEspecial={abrirEditarFechaEspecial}
          />
        </Card>
      )}

      <Card {...asistenciaSectionCardProps} title="Días sin clase del bimestre">
        <ActividadesSinClaseList actividades={actividadesSinClase} />
      </Card>
    </Flex>
  );

  const sidebar = (
    <ResumenAsistenciaSidebar
      resumen={resumen}
      turno={curso?.turno}
      horario={horario}
      rango={rango}
      hoy={hoy}
    />
  );

  return (
    <>
      {renderPagina(content, sidebar)}

      <FechaEspecialDrawer
        abierto={fechaEspecial.abierto}
        fechaInicial={fechaEspecial.fecha}
        sesion={fechaEspecial.sesion}
        confirmando={creandoSesion}
        eliminando={eliminandoSesion}
        onCerrar={cerrarFechaEspecial}
        onConfirmar={habilitarFechaEspecial}
        onEliminar={eliminarFechaEspecial}
      />
    </>
  );
};

export default CalendarioAsistenciaPage;
