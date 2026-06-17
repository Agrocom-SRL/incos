/**
 * Pantalla GRILLA SEMANAL de asistencia.
 *
 * Cabecera espejo del calendario (PageHeader + ficha del curso a todo el ancho) con el
 * resumen del bimestre embebido en la propia ficha (horario, días de clase y KPIs de
 * presentes/atrasados/faltantes/licencias). Grilla espejo del cuaderno: columnas fijas
 * + grupo "Semana" con sub-columnas día (lun–sáb). El botón de guardar vive en la
 * grilla; el botón + por día abre el drawer de sesión especial.
 */
import { useCallback, useMemo, useState } from 'react';
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
import { usePermiso } from '@application-auth';
import { usePlanillaAsistenciaState } from '@application-academico/asistencia/hooks/state/usePlanillaAsistenciaState.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import {
  calendarioCursoPath,
  planillaCursoPath,
  LICENCIA_SOLICITAR_PATH,
} from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { asistenciaSectionCardProps } from '../utils/asistenciaSectionCard.js';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia.jsx';
import SeparadorSemanaAsistencia from '../components/SeparadorSemanaAsistencia.jsx';
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
    asignacionId,
    curso,
    cursoFicha,
    bimestre,
    bimestreNombre,
    bimestreColor,
    gestion,
    anioCalendario,
    hoy,
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
    irAFecha,
    irHoy,
    esSemanaActual,
    habilitarFechaEspecial,
    creandoSesion,
  } = usePlanillaAsistenciaState();

  const ficha = cursoFicha ?? curso;

  // Permiso de crear licencia (mismo mecanismo que ActionButton: useAuthContext.hasPermiso).
  // Gobierna la visibilidad del icon button por estudiante dentro de la grilla.
  const puedeCrearLicencia = usePermiso(ASISTENCIA_PERMISOS.licenciaCrear, 'CREAR');

  // Solicitar licencia para un estudiante de la planilla: navega al formulario precargando
  // el estudiante (id/nombre/código) vía location.state para evitar volver a buscarlo.
  const handleSolicitarLicencia = useCallback(
    (row) => {
      navigate(LICENCIA_SOLICITAR_PATH, {
        state: {
          estudiante: {
            id: row.estudianteId,
            nombre: row.estudianteNombre,
            codigo: row.estudianteCodigo,
          },
          // Al venir desde la planilla, "Volver" y el envío regresan AQUÍ (no a la lista
          // de licencias): el docente sigue tomando asistencia donde estaba.
          returnListPath: planillaCursoPath(asignacionId, rangoSemana),
        },
      });
    },
    [navigate, asignacionId, rangoSemana]
  );

  // Búsqueda local de estudiantes (filtra las filas de la grilla, patrón del cuaderno).
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const filasFiltradas = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) =>
        (f.estudianteNombre ?? '').toLowerCase().includes(q) ||
        (f.estudianteCodigo ?? '').toLowerCase().includes(q)
    );
  }, [filas, busquedaEstudiante]);

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
          <span>
            {sigla
              ? `Planilla de asistencia : ${sigla}`
              : 'Planilla de asistencia'}
          </span>
        </Flex>
      }
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={allSpacing.marginXS} wrap="wrap" align="center">
          {/* Calendario = acción de administración (coordinación/admin); el ActionButton
              se auto-oculta para el docente, que solo tiene registro.*. */}
          <ActionButton
            permiso={ASISTENCIA_PERMISOS.coordinacion}
            accion="LISTAR"
            variant="warning"
            icon={<CalendarOutlined />}
            onClick={() => navigate(calendarioCursoPath(asignacionId))}
          >
            Calendario
          </ActionButton>
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
            aria-label="Volver a mis cursos"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  // La ficha del curso va DENTRO del shell, encima del contenido (el resumen del
  // bimestre se unificó con la navegación de semana en el separador de la grilla).
  const cabecera = ficha ? (
    <CursoContextoAsistencia
      curso={ficha}
      bimestre={bimestre}
      bimestreNombre={bimestreNombre}
      bimestreColor={bimestreColor}
      gestion={gestion}
      registroEstado={registroEstado}
    />
  ) : null;

  // Alertas de estado: van FUERA del MainContent (antes de la cabecera) para que un
  // aviso (registro cerrado / corrección / solo lectura) salte primero.
  const alertas = (
    <>
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
    </>
  );

  // Estructura: header + alertas (fuera de MainContent) + DashboardPageShell (cabecera + contenido).
  const renderPagina = (mainNode) => (
    <Flex
      vertical
      gap="large"
      className="page-container asi-calendario-shell"
      style={{ width: '100%' }}
    >
      <PageHeaderArea>{pageHeader}</PageHeaderArea>
      {alertas}
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
    <Card {...grillaCardProps}>
      <div className="asi-planilla-hoja">
        {/* Separador unificado: resumen del bimestre + navegación de semana (estilo
            cuaderno de Calificaciones), arriba de la grilla, dentro de la misma Card. */}
        <SeparadorSemanaAsistencia
          rango={rangoSemana}
          puedeAnterior={Boolean(semanaPrev)}
          puedeSiguiente={Boolean(semanaSig)}
          onAnterior={irSemanaAnterior}
          onSiguiente={irSemanaSiguiente}
          onIrAFecha={irAFecha}
          onHoy={irHoy}
          esSemanaActual={esSemanaActual}
          anioGestion={anioCalendario}
          resumen={resumen}
          horario={horario}
          busqueda={busquedaEstudiante}
          onBusquedaChange={setBusquedaEstudiante}
          totalEstudiantes={filas.length}
          filtrados={filasFiltradas.length}
        />

        {dias.length === 0 ? (
          <div className="asi-planilla-hoja__vacio">
            <Alert
              type="info"
              showIcon
              title="Semana sin días de clase"
              description="Esta semana no tiene días de clase. Probá con otra semana o usá «Ir a fecha»."
            />
          </div>
        ) : (
          <GrillaAsistenciaSemanal
            dias={dias}
            filas={filasFiltradas}
            hoy={hoy}
            rangoSemana={rangoSemana}
            registroCerrado={registroCerrado}
            puedeEditar={puedeEditar}
            estadoCelda={estadoCelda}
            onToggleCelda={toggleCelda}
            onHabilitarEspecial={abrirFechaEspecial}
            onSolicitarLicencia={
              puedeCrearLicencia ? handleSolicitarLicencia : undefined
            }
            onGuardar={
              puedeEditar && !registroCerrado ? guardarPlanilla : undefined
            }
            guardando={guardando}
            hayCambios={hayCambios}
          />
        )}
      </div>
    </Card>
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
