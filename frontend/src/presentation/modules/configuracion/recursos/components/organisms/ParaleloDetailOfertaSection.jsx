/**
 * Tab Oferta académica — instancias del paralelo maestro en gestiones.
 */
import { Alert, Empty, Flex } from 'antd';
import { Spinner } from '@atoms';
import ParaleloDetalleInstanciaCard from './ParaleloDetalleInstanciaCard';

const ParaleloDetailOfertaSection = ({
  instancias = [],
  loading = false,
  paralelo,
  carrera,
}) => {
  if (loading) {
    return (
      <Flex justify="center" className="cfg-paralelo-detalle-oferta__loading">
        {/* `Spinner` activa el modo anidado de Spin: sin hijos `tip` no se pinta (AntD 6). */}
        <Spinner size="default" text="Cargando instancias en gestión…" />
      </Flex>
    );
  }

  if (!instancias.length) {
    return (
      <Empty
        description={
          <>
            Este paralelo maestro aún no fue copiado a ninguna gestión en{' '}
            <strong>Institucional → Oferta académica</strong>.
          </>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Flex vertical gap={16} className="cfg-paralelo-detalle-oferta">
      <Alert
        type="info"
        showIcon
        title="Instancias en gestión"
        description={`Plantilla maestro «${paralelo?.nombre || '—'}»${
          carrera?.nombre ? ` (${carrera.nombre})` : ''
        }. Cada tarjeta es un paralelo en gestión con su turno, aula y horario semanal si fue armado.`}
      />
      {instancias.map((inst) => (
        <ParaleloDetalleInstanciaCard
          key={inst.id}
          instancia={inst}
          paraleloNombre={paralelo?.nombre}
        />
      ))}
    </Flex>
  );
};

export default ParaleloDetailOfertaSection;
