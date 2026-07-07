/**
 * Organismo (aside): configuración del ciclo lectivo. Habilita el inicio de
 * clases y permite editar las fechas de cada periodo/etapa (con preview en vivo
 * sobre el calendario) además del alta/baja de etapas adicionales.
 */

import { useState } from 'react';
import { Card, Flex, Typography } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { TableActions } from '@molecules';
import { colorPeriodo } from '@application-institucional/actual/utils/periodosCalendario.js';
import PeriodoRangePicker from '@institucional/actual/components/atoms/PeriodoRangePicker';
import IniciarGestionCard from './IniciarGestionCard.jsx';
import EtapaFormModal from './EtapaFormModal.jsx';

const { Text } = Typography;
const PERMISO = 'institucional.gestion.actual';
const ESTRUCTURALES = ['BIMESTRE', 'PLANIFICACION', 'CLAUSURA'];

const BimestresConfigAside = ({
  iniciada,
  fase,
  iniciando,
  onIniciarGestion,
  periodos,
  dirtyCount,
  guardando,
  creando,
  setRangoPeriodo,
  guardarFechas,
  crearEtapa,
  eliminarEtapa,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCrear = async (payload) => {
    const ok = await crearEtapa(payload);
    if (ok) setModalOpen(false);
    return ok;
  };

  return (
    <Flex vertical gap="large">
      <IniciarGestionCard
        iniciada={iniciada}
        fase={fase}
        iniciando={iniciando}
        onIniciarGestion={onIniciarGestion}
      />

      <Card
        title="Fechas de bimestres y etapas"
        size="small"
        extra={
          <ActionButton
            permiso={PERMISO}
            accion="EDITAR"
            variant="secondary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Agregar etapa
          </ActionButton>
        }
      >
        <Flex vertical gap="middle">
          {periodos.map((p) => {
            const color = colorPeriodo(p);
            const eliminable = !ESTRUCTURALES.includes(p.division);
            return (
              <div key={p.id} className="bim-periodo-item">
                <Flex align="center" justify="space-between" gap="small">
                  <Flex align="center" gap="small" style={{ minWidth: 0 }}>
                    <span className="bim-periodo-item__dot" style={{ backgroundColor: color }} aria-hidden />
                    <Text strong ellipsis>{p.nombre}</Text>
                  </Flex>
                  {eliminable ? (
                    <TableActions
                      record={p}
                      deleteFn={() => eliminarEtapa(p)}
                      itemName={`la etapa ${p.nombre}`}
                      permisos={{ eliminar: { codigo: PERMISO, accion: 'EDITAR' } }}
                    />
                  ) : null}
                </Flex>
                <PeriodoRangePicker
                  fechaInicio={p.fechaInicio}
                  fechaFin={p.fechaFin}
                  onChange={(ini, fin) => setRangoPeriodo(p.id, ini, fin)}
                />
              </div>
            );
          })}

          <Flex justify="flex-end">
            <ActionButton
              permiso={PERMISO}
              accion="EDITAR"
              variant="primary"
              icon={<SaveOutlined />}
              loading={guardando}
              disabled={dirtyCount === 0}
              onClick={guardarFechas}
            >
              {dirtyCount > 0 ? `Guardar cambios (${dirtyCount})` : 'Guardar cambios'}
            </ActionButton>
          </Flex>
        </Flex>
      </Card>

      <EtapaFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCrear}
        confirmLoading={creando}
      />
    </Flex>
  );
};

export default BimestresConfigAside;
