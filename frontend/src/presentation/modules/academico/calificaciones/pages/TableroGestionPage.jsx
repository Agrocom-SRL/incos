/**
 * Tablero de coordinación — control de bimestres (Nivel 2).
 */

import { useCallback, useState } from 'react';
import { Alert, Button, Modal, Typography, notification } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useTableroGestion } from '@application-academico/calificaciones/hooks/useTableroGestion.js';
import CalificacionesAcciones, { AccionVolverCoordinacion } from '../components/CalificacionesAcciones.jsx';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import TableroMetricas from '../components/TableroMetricas.jsx';
import BimestreGestionCard from '../components/BimestreGestionCard.jsx';
import CerrarBimestreModal from '../components/CerrarBimestreModal.jsx';
import '../styles/calificaciones.css';
import '../styles/tablero.css';

const { Paragraph, Title } = Typography;

const TableroGestionPage = () => {
  const {
    tablero,
    isLoading,
    isAccionando,
    error,
    refetch,
    iniciarGestion,
    validarCierre,
    cerrarBimestre,
    breadcrumbItems,
  } = useTableroGestion();

  const [cerrarNumero, setCerrarNumero] = useState(null);

  const confirmarIniciarGestion = useCallback(() => {
    Modal.confirm({
      title: 'Iniciar gestión académica',
      content: (
        <span>
          Se iniciará el <strong>Bimestre 1</strong> y todas las matrículas en estado INSCRITO
          pasarán a <strong>CURSANDO</strong> en la gestión vigente. ¿Continuar?
        </span>
      ),
      okText: 'Iniciar Bimestre 1',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const res = await iniciarGestion();
          notification.success({
            message: 'Gestión iniciada',
            description: `${res.matriculasInscritoACursando} matrículas actualizadas a CURSANDO.`,
          });
        } catch (err) {
          if (err?.code === 'GESTION_YA_INICIADA') {
            notification.warning({ message: 'La gestión ya fue iniciada.' });
          } else {
            notification.error({ message: 'No se pudo iniciar la gestión.' });
          }
        }
      },
    });
  }, [iniciarGestion]);

  const handleCerrarConfirmado = useCallback(
    async (numero) => {
      try {
        const res = await cerrarBimestre(numero);
        setCerrarNumero(null);
        notification.success({
          message: `Bimestre ${numero} cerrado`,
          description: res.bimestreSiguiente
            ? `Bimestre ${res.bimestreSiguiente} habilitado para carga docente.`
            : 'Gestión de bimestres completada.',
        });
      } catch (err) {
        if (err?.code === 'CIERRE_BLOQUEADO' && err.validacion?.bloqueos?.length) {
          notification.error({
            message: 'Cierre bloqueado',
            description: err.validacion.bloqueos[0],
          });
        } else {
          notification.error({ message: 'No se pudo cerrar el bimestre.' });
        }
      }
    },
    [cerrarBimestre],
  );

  const header = (
    <PageHeader
      title="Tablero de gestión"
      breadcrumbItems={breadcrumbItems}
      className="tablero-page-header"
    />
  );

  const puedeIniciarGestion = tablero && !tablero.gestionIniciada;

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="tablero-gestion sd">
        <CalificacionesAcciones>
          <AccionVolverCoordinacion to={CALIFICACIONES_PATH} />
        </CalificacionesAcciones>

        {tablero ? (
          <Paragraph className="tablero-gestion__contexto">
            Gestión <strong>{tablero.gestion.nombre}</strong>
            {tablero.bimestreVigente
              ? ` · Bimestre vigente: ${tablero.bimestreVigente}`
              : ''}
          </Paragraph>
        ) : null}

        {error ? (
          <Alert
            type="error"
            showIcon
            message="No se pudo cargar el tablero"
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {!isLoading && tablero ? (
          <>
            <TableroMetricas metricas={tablero.metricas} />

            <Title level={5} className="tablero-gestion__seccion-titulo">
              Bimestres del año
            </Title>
            <p className="tablero-gestion__seccion-desc">
              Solo un bimestre vigente a la vez. El cierre lo realiza Coordinación; los docentes
              cargan notas en el cuaderno del bimestre abierto.
            </p>

            <div className="tablero-gestion__bimestres">
              {tablero.bimestres.map((bim) => (
                <BimestreGestionCard
                  key={bim.numero}
                  bimestre={bim}
                  esVigente={bim.numero === tablero.bimestreVigente && bim.estado === 'EN_CURSO'}
                  puedeIniciarGestion={puedeIniciarGestion}
                  onIniciarGestion={confirmarIniciarGestion}
                  onCerrar={setCerrarNumero}
                  accionando={isAccionando}
                />
              ))}
            </div>
          </>
        ) : null}

        {isLoading ? (
          <div className="tablero-gestion__loading">Cargando tablero…</div>
        ) : null}

        <CerrarBimestreModal
          abierto={cerrarNumero != null}
          numero={cerrarNumero}
          onValidar={validarCierre}
          onConfirmar={handleCerrarConfirmado}
          onCancelar={() => setCerrarNumero(null)}
          accionando={isAccionando}
        />
      </div>
    </PageTemplate>
  );
};

export default TableroGestionPage;
