/**
 * Organismo: tab "Informes" de la ficha-hub del trámite de pasantía (TIT ·
 * P11-P14).
 *
 * DetailInfoCard + tabla de informes institucionales (verificación de empresa
 * / convalidación de trabajo). "Emitir informe" ya vive en la cabecera de la
 * ficha (`informeVerificacion`, único informe posible por trámite — primer
 * paso legal); esta tab NO repite ese botón (extensión 2026-08-11, pedido
 * explícito del usuario), solo edita (informe·EDITAR) y descarga el PDF
 * (pasantia·EXPORTAR) en las columnas. Estados carga/vacío/error cubiertos.
 * Con `readOnly` (portal del estudiante) la tabla es de solo lectura.
 */

import { Alert, Empty, Table } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { createInformesPasantiaTableColumns } from '@titulacion/pasantias/config/informesPasantiaTableColumns';

const PasantiaInformesSection = ({
  informes,
  loading,
  error,
  descargandoId,
  onEditarInforme,
  onDescargar,
  readOnly = false,
}) => {
  const columns = createInformesPasantiaTableColumns({
    onEditar: onEditarInforme,
    onDescargar,
    descargandoId,
    readOnly,
  });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard title={`Informes (${informes.length})`} icon={<FilePdfOutlined />} cols={1}>
        {error ? (
          <Alert type="error" showIcon title="No se pudieron cargar los informes" description={error} />
        ) : informes.length === 0 && !loading ? (
          <Empty description="El trámite aún no tiene informes emitidos." />
        ) : (
          <Table
            dataSource={informes}
            columns={columns}
            rowKey={(record) => record.id}
            size="small"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default PasantiaInformesSection;
