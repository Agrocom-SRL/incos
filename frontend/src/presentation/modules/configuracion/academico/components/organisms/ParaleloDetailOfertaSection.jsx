/**
 * Tab Oferta académica — instancias del paralelo maestro en gestiones.
 */
import { Alert, Empty, Flex, Spin } from 'antd';
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
        <Spin tip="Cargando instancias en gestión…" />
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
