/**
 * Pantalla CALENDARIO MENSUAL de asistencia (bimestre activo del curso).
 *
 * Días del bimestre con dot en los ya tomados; botón «Marcar asistencia» → planilla
 * semanal; «Habilitar fecha especial» (modal); «Cerrar / Reabrir registro» (permiso EDITAR).
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Skeleton } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCalendarioAsistenciaState } from '@application-academico/asistencia/hooks/state/useCalendarioAsistenciaState.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ESTADOS_REGISTRO } from '@application-academico/asistencia/utils/asistenciaEstados.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import CalendarioMensualAsistencia from '../components/CalendarioMensualAsistencia.jsx';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia.jsx';
import FechaEspecialModal from '../components/FechaEspecialModal.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/asistencia.css';

const CalendarioAsistenciaPage = () => {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const {
    curso,
    bimestre,
    dias,
    registroEstado,
    registroCerrado,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    volverPath,
    planillaPath,
    cerrarRegistro,
    reabrirRegistro,
    habilitarFechaEspecial,
    procesandoRegistro,
    creandoSesion,
  } = useCalendarioAsistenciaState();

  const [modalEspecial, setModalEspecial] = useState(false);

  const irAPlanilla = useCallback(
    (fecha) => navigate(planillaPath(fecha)),
    [navigate, planillaPath],
  );

  const confirmarCerrar = useCallback(() => {
    modal.confirm({
      title: 'Cerrar registro de asistencia',
      okText: 'Cerrar registro',
      okType: 'danger',
      cancelText: 'Cancelar',
      content:
        'La asistencia del bimestre quedará en solo lectura. Podrás reabrirla para corregir.',
      onOk: cerrarRegistro,
    });
  }, [modal, cerrarRegistro]);

  const confirmarReabrir = useCallback(() => {
    modal.confirm({
      title: 'Reabrir registro de asistencia',
      okText: 'Reabrir',
      cancelText: 'Cancelar',
      content: 'Volverás a poder editar la asistencia del bimestre en modo corrección.',
      onOk: reabrirRegistro,
    });
  }, [modal, reabrirRegistro]);

  const pageHeader = (
    <PageHeader
      title={
        <Flex align="center" gap={allSpacing.marginXS} wrap="wrap">
          <CalendarOutlined aria-hidden />
          <span>{curso?.materia ? `Asistencia · ${curso.materia}` : 'Calendario de asistencia'}</span>
        </Flex>
      }
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginXS} wrap="wrap">
          <ActionButton
            permiso={ASISTENCIA_PERMISOS.registroCuaderno}
            accion="EDITAR"
            variant="default"
            icon={<PlusOutlined />}
            onClick={() => setModalEspecial(true)}
            disabled={registroCerrado}
          >
            Habilitar fecha especial
          </ActionButton>
          {registroCerrado ? (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="warning"
              icon={<UnlockOutlined />}
              loading={procesandoRegistro}
              onClick={confirmarReabrir}
            >
              Reabrir registro
            </ActionButton>
          ) : (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="danger"
              icon={<LockOutlined />}
              loading={procesandoRegistro}
              onClick={confirmarCerrar}
            >
              Cerrar registro
            </ActionButton>
          )}
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
            aria-label="Volver a mis cursos"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  if (isLoading && dias.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Card {...asistenciaSectionCardProps}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </MainContent>
      </Flex>
    );
  }

  if (error && dias.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
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
        </MainContent>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>
      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} className="asi-calendario-page">
          {registroEstado === ESTADOS_REGISTRO.CERRADO ? (
            <Alert
              type="warning"
              showIcon
              title="Registro cerrado (solo lectura)"
              description="La asistencia de este bimestre está cerrada. Reabrí el registro para corregir."
            />
          ) : null}

          <Card {...asistenciaSectionCardProps}>
            <CursoContextoAsistencia
              curso={curso}
              bimestre={bimestre}
              registroEstado={registroEstado}
            />
          </Card>

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
              <CalendarioMensualAsistencia dias={dias} onElegirDia={irAPlanilla} />
            </Card>
          )}
        </Flex>
      </MainContent>

      <FechaEspecialModal
        open={modalEspecial}
        onClose={() => setModalEspecial(false)}
        onConfirmar={habilitarFechaEspecial}
        confirmando={creandoSesion}
      />
    </Flex>
  );
};

export default CalendarioAsistenciaPage;
