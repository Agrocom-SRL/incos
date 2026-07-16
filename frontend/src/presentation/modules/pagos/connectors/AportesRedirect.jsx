/**
 * AportesRedirect — al entrar a "Aportes" (ítem de menú Matrícula), el ESTUDIANTE
 * se redirige al detalle de SU propio aporte: `/pagos/:cabeceraId`, reutilizando la
 * pantalla PagosDetail (mismo patrón que Admisión → `/estudiantes/:id`).
 *
 * Resuelve la cabecera vía `GET /pagos-aportes/mis-aportes` (el estudiante se resuelve
 * en servidor). El backend blinda `/pagos-aportes/:id` a la propia cabecera (anti-IDOR).
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Alert, Empty } from 'antd';
import PagoAporteRepository from '@infrastructure/repositories/PagoAporteRepository.js';

const AportesRedirect = () => {
  const [estado, setEstado] = useState({ loading: true, cabeceraId: null, error: null });

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const result = await PagoAporteRepository.obtenerMisAportes();
        if (!activo) return;
        if (!result?.success) {
          setEstado({ loading: false, cabeceraId: null, error: result?.error || 'No se pudo cargar su aporte' });
          return;
        }
        const aportes = result?.data?.aportes ?? result?.aportes ?? [];
        const cabeceraId = aportes[0]?.id ?? null;
        setEstado({ loading: false, cabeceraId, error: null });
      } catch (err) {
        if (activo) setEstado({ loading: false, cabeceraId: null, error: err?.message || 'No se pudo cargar su aporte' });
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  if (estado.cabeceraId) {
    return <Navigate to={`/pagos/${estado.cabeceraId}`} replace />;
  }

  if (estado.loading) {
    return (
      <Spin spinning tip="Abriendo sus aportes…">
        <div style={{ minHeight: 160 }} aria-hidden />
      </Spin>
    );
  }

  if (estado.error) {
    return <Alert type="warning" showIcon title="No se pudieron abrir sus aportes" description={estado.error} />;
  }

  return <Empty description="Aún no tiene aportes registrados en la gestión vigente." />;
};

export default AportesRedirect;
