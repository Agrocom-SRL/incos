/**
 * Pantalla GRILLA SEMANAL de asistencia.
 *
 * Cabecera espejo del calendario (PageHeader + ficha del curso a todo el ancho) con el
 * resumen del bimestre embebido en la propia ficha (horario, días de clase y KPIs de
 * presentes/atrasados/faltantes/licencias). Grilla espejo del cuaderno: columnas fijas
 * + grupo "Semana" con sub-columnas día (lun–sáb). El botón de guardar vive en la
 * grilla; el botón + por día abre el drawer de sesión especial.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Skeleton } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { usePlanillaAsistenciaState } from '@application-academico/asistencia/hooks/state/usePlanillaAsistenciaState.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia.jsx';
import ResumenCabeceraAsistencia from '../components/ResumenCabeceraAsistencia.jsx';
import CabeceraSemanaAsistencia from '../components/CabeceraSemanaAsistencia.jsx';
import GrillaAsistenciaSemanal from '../components/GrillaAsistenciaSemanal.jsx';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import FechaEspecialDrawer from '../components/FechaEspecialDrawer.jsx';
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
    cursoFicha,
    bimestre,
    bimestreNombre,
    bimestreColor,
    gestion,
    resumen,
    horario,
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
    cerrarRegistro,
    reabrirYcorregir,
    procesandoCierre,
    semanaPrev,
    semanaSig,
    irSemanaAnterior,
    irSemanaSiguiente,
    habilitarFechaEspecial,
    creandoSesion,
  } = usePlanillaAsistenciaState();

  const ficha = cursoFicha ?? curso;

  const { modal } = App.useApp();
  const [fechaEspecial, setFechaEspecial] = useState({
    abierto: false,
    fecha: null,
  });

  const abrirFechaEspecial = useCallback((fecha) => {
    setFechaEspecial({ abierto: true, fecha: fecha ?? null });
  }, []);

  const cerrarFechaEspecial = useCallback(() => {
    setFechaEspecial((prev) => ({ ...prev, abierto: false }));
  }, []);

  const handleVolver = useCallback(() => {
    if (hayCambios) {
      descartarCambios();
    }
    navigate(volverPath);
  }, [hayCambios, descartarCambios, navigate, volverPath]);

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

  const sigla = ficha?.materiaSigla ?? null;

  const pageHeader = (
    <PageHeader
      title={
        <Flex align="center" gap={allSpacing.marginSM} wrap="wrap">
          <CabeceraSemanaAsistencia
            puedeAnterior={Boolean(semanaPrev)}
            puedeSiguiente={Boolean(semanaSig)}
            onAnterior={irSemanaAnterior}
            onSiguiente={irSemanaSiguiente}
          />
          <CalendarOutlined aria-hidden />
          <span>
            {sigla
              ? `Planilla de asistencia · ${sigla}`
              : 'Planilla de asistencia'}
          </span>
        </Flex>
      }
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginXS} wrap="wrap" align="center">
          {registroCerrado ? (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="warning"
              icon={<UnlockOutlined />}
              loading={procesandoCierre}
              onClick={reabrirYcorregir}
            >
              Reabrir para corregir
            </ActionButton>
          ) : (
            <ActionButton
              permiso={ASISTENCIA_PERMISOS.registroCuaderno}
              accion="EDITAR"
              variant="danger"
              icon={<LockOutlined />}
              loading={procesandoCierre}
              onClick={confirmarCerrar}
            >
              Cerrar registro
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

  // La ficha del curso + el resumen del bimestre van DENTRO del shell, encima del contenido.
  const cabecera = (
    <>
      {ficha ? (
        <CursoContextoAsistencia
          curso={ficha}
          bimestre={bimestre}
          bimestreNombre={bimestreNombre}
          bimestreColor={bimestreColor}
          gestion={gestion}
          registroEstado={registroEstado}
        />
      ) : null}
      <ResumenCabeceraAsistencia resumen={resumen} horario={horario} />
    </>
  );

  // Estructura: header de página + DashboardPageShell con la cabecera y el contenido.
  const renderPagina = (mainNode) => (
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
      </DashboardPageShell>
    </Flex>
  );

  if (isLoading && filas.length === 0) {
    return renderPagina(
      <Card {...asistenciaSectionCardProps}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (error && filas.length === 0) {
    return renderPagina(
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
    );
  }

  const content = (
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
          description="Tocá una falta para registrar un atraso (—); volvé a tocar para marcar presente."
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

      {dias.length === 0 ? (
        <Card {...asistenciaSectionCardProps}>
          <Alert
            type="info"
            showIcon
            title="Semana fuera del bimestre"
            description="Esta semana no tiene días dentro del bimestre. Probá con otra semana."
          />
        </Card>
      ) : (
        <Card {...grillaCardProps}>
          <GrillaAsistenciaSemanal
            dias={dias}
            filas={filas}
            rangoSemana={rangoSemana}
            registroCerrado={registroCerrado}
            puedeEditar={puedeEditar}
            estadoCelda={estadoCelda}
            onToggleCelda={toggleCelda}
            onHabilitarEspecial={abrirFechaEspecial}
            onGuardar={
              puedeEditar && !registroCerrado ? guardarPlanilla : undefined
            }
            guardando={guardando}
            hayCambios={hayCambios}
          />
        </Card>
      )}
    </Flex>
  );

  return (
    <>
      {renderPagina(content)}

      <FechaEspecialDrawer
        abierto={fechaEspecial.abierto}
        fechaInicial={fechaEspecial.fecha}
        confirmando={creandoSesion}
        onCerrar={cerrarFechaEspecial}
        onConfirmar={habilitarFechaEspecial}
      />
    </>
  );
};

export default PlanillaAsistenciaSemanalPage;
