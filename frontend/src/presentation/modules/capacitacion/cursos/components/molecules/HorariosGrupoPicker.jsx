/**
 * Molécula: horarios de un grupo de capacitación.
 *
 * Un campo con el aspecto de los demás inputs (resumen de lo elegido + chevron) abre un popup propio
 * con la lista de horarios y una casilla por fila (cada uno con su `StatusPill` de color por día).
 * Al lado, «Agregar horario» abre el modal de creación. Los horarios elegidos se muestran debajo
 * como pills con su ✕ dentro, para verlos y quitarlos sin abrir el popup.
 *
 * `ocupados`: ids que no se ofrecen en la lista (los ya elegidos en el grupo sí). Opcional: el editor de
 * grupos no lo usa, porque dos grupos pueden repetir horario (el aula se asigna después).
 * Control de `Form.Item`: `value` = `[{ horarioId, ... }]`, `onChange(nuevaLista)`.
 */

import { useState } from 'react';
import '../../styles/horarios-grupo-picker.css';
import { Checkbox, Flex, Input, Popover, Typography } from 'antd';
import { CloseOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, StatusPill } from '@atoms';
import { claseDiaHorario } from '@application-capacitacion/utils/horarioCapacitacion';
import { reconciliarHorariosGrupo } from '@application-capacitacion/utils/gruposCapacitacion';

const { Text } = Typography;

const resumir = (cantidad) =>
  cantidad === 0 ? '' : cantidad === 1 ? '1 horario seleccionado' : `${cantidad} horarios seleccionados`;

const HorariosGrupoPicker = ({
  id,
  value,
  onChange,
  disabled = false,
  options = [],
  diaById = {},
  loading = false,
  ocupados = [],
  onCrear,
}) => {
  const [open, setOpen] = useState(false);
  const actuales = Array.isArray(value) ? value : [];
  const ids = actuales.map((h) => Number(h.horarioId));
  const porId = new Map(options.map((o) => [Number(o.value), o]));
  const libres = options.filter(
    (o) => ids.includes(Number(o.value)) || !ocupados.includes(Number(o.value)),
  );
  const claseDe = (opcion) => claseDiaHorario(diaById[Number(opcion.value)] ?? opcion.label);

  const cambiar = (nuevosIds) => onChange?.(reconciliarHorariosGrupo(actuales, nuevosIds));
  const alternar = (horarioId) =>
    cambiar(ids.includes(horarioId) ? ids.filter((x) => x !== horarioId) : [...ids, horarioId]);

  const lista = (
    <div className="horarios-grupo-picker__lista">
      {libres.length === 0 ? (
        <Text type="secondary">
          {options.length === 0
            ? 'No hay horarios registrados todavía.'
            : 'Todos los horarios ya están en otros grupos.'}
        </Text>
      ) : (
        libres.map((o) => (
          <Checkbox
            key={o.value}
            checked={ids.includes(Number(o.value))}
            onChange={() => alternar(Number(o.value))}
            className="horarios-grupo-picker__fila"
          >
            <StatusPill label={o.label} className={claseDe(o)} />
          </Checkbox>
        ))
      )}
    </div>
  );

  return (
    <Flex vertical gap={8} className="horarios-grupo-picker">
      <Flex gap={8} align="center">
        <Popover
          content={lista}
          trigger="click"
          open={open}
          onOpenChange={(next) => !disabled && setOpen(next)}
          placement="bottomLeft"
          arrow={false}
          styles={{ container: { maxHeight: 300, overflowY: 'auto' } }}
        >
          <Input
            id={id}
            readOnly
            disabled={disabled || loading}
            value={resumir(ids.length)}
            placeholder="Seleccione uno o más horarios"
            suffix={<DownOutlined style={{ fontSize: 12, opacity: 0.45 }} />}
            style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          />
        </Popover>
        <Button variant="alternative" icon={<PlusOutlined />} disabled={disabled} onClick={() => onCrear?.()}>
          Agregar horario
        </Button>
      </Flex>
      {ids.length === 0 ? (
        <Text type="secondary">Sin horarios asignados</Text>
      ) : (
        <Flex wrap="wrap" gap={8} align="center">
          {ids.map((horarioId) => {
            const opcion = porId.get(horarioId) ?? { value: horarioId, label: `Horario ${horarioId}` };
            return (
              <StatusPill
                key={horarioId}
                className={`${claseDe(opcion)} horarios-grupo-picker__pill`}
                label={
                  <>
                    {opcion.label}
                    {disabled ? null : (
                      <button
                        type="button"
                        aria-label={`Quitar ${opcion.label}`}
                        className="horarios-grupo-picker__quitar"
                        onClick={() => cambiar(ids.filter((x) => x !== horarioId))}
                      >
                        <CloseOutlined />
                      </button>
                    )}
                  </>
                }
              />
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};

export default HorariosGrupoPicker;
