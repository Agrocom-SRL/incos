/**
 * Pantalla GRILLA SEMANAL de asistencia.
 *
 * Columnas = días válidos de la semana; filas = estudiantes (orden del backend).
 * Marca de faltas (ciclo según modo normal / corrección), navegación de semanas
 * dentro del bimestre y guardado del lote (PUT). Banner cuando el registro está cerrado.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Flex, Skeleton } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UnlockOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { usePlanillaAsistenciaState } from '@application-academico/asistencia/hooks/state/usePlanillaAsistenciaState.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia.jsx';
import CabeceraSemanaAsistencia from '../components/CabeceraSemanaAsistencia.jsx';
import GrillaAsistenciaSemanal from '../components/GrillaAsistenciaSemanal.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/asistencia.css';

// Card que aloja la grilla a sangre: mismo contrato del sistema, body sin padding.
const grillaCardProps = {
  ...asistenciaSectionCardProps,
  styles: { body: { padding: 0 } },
};

const PlanillaAsistenciaSemanalPage = () => {
  const navigate = useNavigate();
  const {
    curso,
    bimestre,
    filas,
    dias,
    rangoSemana,
    registroEstado,
    registroCerrado,
    modoCorreccion,
    puedeEditar,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
    volverPath,
    estadoCelda,
    toggleCelda,
    hayCambios,
    descartarCambios,
    guardarPlanilla,
    guardando,
    reabrirYcorregir,
    reabriendo,
    semanaPrev,
    semanaSig,
    irSemanaAnterior,
    irSemanaSiguiente,
  } = usePlanillaAsistenciaState();

  const handleVolver = useCallback(() => {
    if (hayCambios) {
      descartarCambios();
    }
    navigate(volverPath);
  }, [hayCambios, descartarCambios, navigate, volverPath]);

  const pageHeader = (
    <PageHeader
      title={
        <span>{curso?.materia ? `Asistencia · ${curso.materia}` : 'Planilla de asistencia'}</span>
      }
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginXS} wrap="wrap" align="center">
          <CabeceraSemanaAsistencia
            rangoSemana={rangoSemana}
            puedeAnterior={Boolean(semanaPrev)}
            puedeSiguiente={Boolean(semanaSig)}
            onAnterior={irSemanaAnterior}
            onSiguiente={irSemanaSiguiente}
          />
          {registroCerrado ? (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="warning"
              icon={<UnlockOutlined />}
              loading={reabriendo}
              onClick={reabrirYcorregir}
            >
              Reabrir para corregir
            </ActionButton>
          ) : (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="primary"
              icon={<SaveOutlined />}
              loading={guardando}
              disabled={!hayCambios}
              onClick={guardarPlanilla}
            >
              Guardar
            </ActionButton>
          )}
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={handleVolver}
            aria-label="Volver al calendario"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  if (isLoading && filas.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Card {...asistenciaSectionCardProps}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Card>
        </MainContent>
      </Flex>
    );
  }

  if (error && filas.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar la planilla"
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
        <Flex vertical gap={allSpacing.marginLG} className="asi-planilla-page">
          {registroCerrado ? (
            <Alert
              type="warning"
              showIcon
              title="Registro cerrado (solo lectura)"
              description="Reabrí el registro para marcar atrasos o corregir faltas de este bimestre."
            />
          ) : modoCorreccion ? (
            <Alert
              type="info"
              showIcon
              title="Modo corrección activo"
              description="Tocá una falta para registrar un atraso (R); volvé a tocar para marcar presente."
            />
          ) : null}

          {!puedeEditar ? (
            <Alert
              type="info"
              showIcon
              title="Solo lectura"
              description="No tenés permiso para editar la asistencia de este curso."
            />
          ) : null}

          <Card {...asistenciaSectionCardProps}>
            <CursoContextoAsistencia curso={curso} bimestre={bimestre} registroEstado={registroEstado} />
          </Card>

          {dias.length === 0 ? (
            <Card {...asistenciaSectionCardProps}>
              <Alert
                type="info"
                showIcon
                title="Sin días de clase en la semana"
                description="Esta semana no tiene días de clase para tomar asistencia. Probá con otra semana."
              />
            </Card>
          ) : (
            <Card {...grillaCardProps}>
              <GrillaAsistenciaSemanal
                dias={dias}
                filas={filas}
                registroCerrado={registroCerrado}
                estadoCelda={estadoCelda}
                onToggleCelda={toggleCelda}
              />
            </Card>
          )}
        </Flex>
      </MainContent>
    </Flex>
  );
};

export default PlanillaAsistenciaSemanalPage;
