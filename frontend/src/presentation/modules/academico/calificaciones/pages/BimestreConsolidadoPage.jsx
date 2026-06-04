/**
 * Bimestre cerrado — resumen práctico / teórico / total (solo lectura; edición administrativa opcional).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Spin, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useAcciones } from '@application/modules/shared/hooks/useAcciones.js';
import { useBimestreConsolidado } from '@application-academico/calificaciones/hooks/useBimestreConsolidado.js';
import { useBimestrePagerTeclado } from '@application-academico/calificaciones/hooks/useBimestrePagerTeclado.js';
import { useNavegacionBimestres } from '@application-academico/calificaciones/hooks/useNavegacionBimestres.js';
import { useCalificacionesVistaContext } from '@application-academico/calificaciones/hooks/useCalificacionesVistaContext.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import CuadernoContextoPanel from '../components/CuadernoContextoPanel.jsx';
import BimestreConsolidadoSeparador from '../components/BimestreConsolidadoSeparador.jsx';
import BimestreConsolidadoGrid from '../components/BimestreConsolidadoGrid.jsx';
import BimestreConsolidadoBimestrePager from '../components/BimestreConsolidadoBimestrePager.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const hojaCardProps = {
  ...calificacionesSectionCardProps,
  styles: {
    body: { padding: 0 },
  },
};

const normalizarComponente = (v) => {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

const BimestreConsolidadoPage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { docenteNombreCoordinacion } = useCalificacionesVistaContext();
  const ajusteAdmin = useAcciones(CALIFICACIONES_PERMISOS.bimestreAjusteAdmin);
  const puedeEdicionAdmin = ajusteAdmin.puedeEditar;
  const {
    curso,
    docente,
    estudiantes,
    evaluaciones,
    cuotaTeorico,
    cuotaPractico,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    periodoConsolidado,
    isLoading,
    isRefetching,
    error,
    breadcrumbItems,
    tituloPagina,
    volverPath,
    cursoId,
    esVistaCoordinacion,
    guardarConsolidado,
  } = useBimestreConsolidado();

  const navegacionBimestres = useNavegacionBimestres(cursoId, bimestreActivo, bimestreVigente);
  useBimestrePagerTeclado({
    habilitado: Boolean(cursoId) && !isLoading,
    puedeAnterior: navegacionBimestres.puedeAnterior,
    puedeSiguiente: navegacionBimestres.puedeSiguiente,
    onAnterior: navegacionBimestres.irAnterior,
    onSiguiente: navegacionBimestres.irSiguiente,
  });

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [modoAdmin, setModoAdmin] = useState(false);
  const [valoresEdit, setValoresEdit] = useState({});
  const [guardando, setGuardando] = useState(false);

  const estudiantesFiltrados = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((e) => {
      const nombre = (e.nombre ?? '').toLowerCase();
      const codigo = (e.codigo ?? '').toLowerCase();
      const nro = String(e.nro ?? '');
      return nombre.includes(q) || codigo.includes(q) || nro.includes(q);
    });
  }, [estudiantes, busquedaEstudiante]);

  const handleCambioComponente = useCallback((estudianteId, campo, valor) => {
    setValoresEdit((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [campo]: valor,
      },
    }));
  }, []);

  const handleToggleAdmin = useCallback((checked) => {
    setModoAdmin(checked);
    if (!checked) setValoresEdit({});
  }, []);

  const hayCambios = useMemo(() => Object.keys(valoresEdit).length > 0, [valoresEdit]);

  const handleGuardar = useCallback(async () => {
    const filas = estudiantes
      .map((e) => {
        const edit = valoresEdit[e.id];
        if (!edit) return null;
        const patch = { estudianteId: e.id };
        if (edit.teorico !== undefined) {
          patch.teorico = normalizarComponente(edit.teorico);
        }
        if (edit.practico !== undefined) {
          patch.practico = normalizarComponente(edit.practico);
        }
        if (patch.teorico === undefined && patch.practico === undefined) return null;

        const origT =
          e.habilitacionTeorico != null
            ? normalizarComponente(e.habilitacionTeorico)
            : normalizarComponente(e.notaTeorico ?? e.teorico);
        const origP =
          e.habilitacionPractico != null
            ? normalizarComponente(e.habilitacionPractico)
            : normalizarComponente(e.notaPractico ?? e.practico);
        if (
          (patch.teorico === undefined || patch.teorico === origT) &&
          (patch.practico === undefined || patch.practico === origP)
        ) {
          return null;
        }
        return patch;
      })
      .filter(Boolean);

    if (filas.length === 0) {
      notification.info({
        title: 'Sin cambios',
        description: 'No hay notas modificadas para guardar.',
      });
      return;
    }

    const fueraDeRango = filas.some(
      (f) =>
        (f.teorico != null && (f.teorico > cuotaTeorico || f.teorico < 0)) ||
        (f.practico != null && (f.practico > cuotaPractico || f.practico < 0)),
    );
    if (fueraDeRango) {
      notification.error({
        title: 'Notas fuera de cuota',
        description: `Teórico ≤ ${cuotaTeorico}, práctico ≤ ${cuotaPractico}. Corregí las celdas en rojo.`,
      });
      return;
    }

    setGuardando(true);
    try {
      await guardarConsolidado(filas);
      setValoresEdit({});
      notification.success({
        title: 'Consolidado guardado',
        description: 'Se registró la habilitación del bimestre y se actualizó la nota final del curso.',
      });
    } catch (err) {
      notification.error({
        title: 'Error al guardar',
        description: typeof err?.message === 'string' ? err.message : 'Reintentá en unos segundos.',
      });
    } finally {
      setGuardando(false);
    }
  }, [
    estudiantes,
    valoresEdit,
    cuotaTeorico,
    cuotaPractico,
    guardarConsolidado,
    notification,
  ]);

  const tituloHeader = (
    <Flex align="center" wrap="wrap" gap={8} className="cal-cuaderno-page-title">
      <BimestreConsolidadoBimestrePager
        asignacionId={cursoId}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
      />
      <span>{tituloPagina}</span>
    </Flex>
  );

  const pageHeader = (
    <PageHeader
      title={tituloHeader}
      breadcrumbItems={breadcrumbItems}
      actions={
        <BackButton
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(volverPath)}
          aria-label="Volver al registro académico"
        >
          Volver
        </BackButton>
      }
    />
  );

  const cardContexto = (
    <Card className="cal-cuaderno-contexto-card" {...calificacionesSectionCardProps}>
      <CuadernoContextoPanel
        curso={curso}
        docente={docente}
        bimestreTitulo={bimestreTitulo}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
        modoEdicion={modoAdmin}
        esVistaCoordinacion={esVistaCoordinacion}
        docenteNombre={docenteNombreCoordinacion}
      />
    </Card>
  );

  const toolbarAdmin = puedeEdicionAdmin ? (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={12}
      className="cal-bimestre-consolidado-toolbar"
    >
      <Flex align="center" gap={8}>
        <Switch checked={modoAdmin} onChange={handleToggleAdmin} aria-label="Modo edición administrativa" />
        <span className="cal-bimestre-consolidado-toolbar__label">
          Edición administrativa (registra habilitación teórico / práctico)
        </span>
      </Flex>
      {modoAdmin && hayCambios ? (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={guardando}
          onClick={handleGuardar}
        >
          Guardar consolidado
        </Button>
      ) : null}
    </Flex>
  ) : null;

  const cardGrilla = (
    <Card className="cal-cuaderno-hoja-card cal-bimestre-consolidado-card" {...hojaCardProps}>
      <div className="cal-cuaderno-hoja cal-bimestre-consolidado">
        {toolbarAdmin}
        <BimestreConsolidadoSeparador
          bimestreTitulo={bimestreTitulo}
          fechaInicio={periodoConsolidado?.fechaInicio}
          fechaFin={periodoConsolidado?.fechaFin}
          busqueda={busquedaEstudiante}
          onBusquedaChange={setBusquedaEstudiante}
          totalEstudiantes={estudiantes.length}
          filtrados={estudiantesFiltrados.length}
        />
        <BimestreConsolidadoGrid
          estudiantes={estudiantesFiltrados}
          bimestreTitulo={bimestreTitulo}
          cuotaTeorico={cuotaTeorico}
          cuotaPractico={cuotaPractico}
          soloLectura={!modoAdmin}
          valoresEdit={valoresEdit}
          onCambioComponente={modoAdmin ? handleCambioComponente : undefined}
          evaluacionesCount={evaluaciones.length}
        />
        <p className="cal-bimestre-consolidado-leyenda" role="note">
          Se muestra habilitación si existe; si no, la nota bimestral del cuaderno. Al guardar en modo
          administrativo se registran puntos de habilitación y se actualiza la nota cerrada del bimestre
          (máx. {cuotaPractico + cuotaTeorico} pts = práctico + teórico).
        </p>
      </div>
    </Card>
  );

  if (isLoading && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <CuadernoSkeleton />
        </MainContent>
      </Flex>
    );
  }

  if (error && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el consolidado"
            description={typeof error === 'string' ? error : String(error)}
            action={
              <Button size="small" onClick={() => window.location.reload()}>
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
        <Spin spinning={isRefetching} tip="Actualizando consolidado…">
          <Flex vertical gap={allSpacing.marginLG} className="sd cal-cuaderno cal-bimestre-consolidado-page">
            {error ? (
              <Alert
                type="error"
                showIcon
                title="Error al actualizar"
                description={typeof error === 'string' ? error : String(error)}
              />
            ) : null}
            {cardContexto}
            {cardGrilla}
          </Flex>
        </Spin>
      </MainContent>
    </Flex>
  );
};

export default BimestreConsolidadoPage;
