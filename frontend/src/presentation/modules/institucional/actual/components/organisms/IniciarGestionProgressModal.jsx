/**
 * Organismo: modal de progreso (bloqueante) del inicio de gestión académica.
 *
 * El backend ejecuta la activación en UNA transacción atómica (matrículas →
 * CURSANDO + apertura de bimestres por estudiante). Este modal NO orquesta
 * etapas reales: bloquea la UI para impedir doble envío y comunica las fases
 * que ocurren en el servidor. El cierre del modal (open=false) = fin real.
 */

import { useEffect, useState } from 'react';
import { Modal, Steps, Flex, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PASOS = [
  { title: 'Activando matrículas', description: 'Pasando las matrículas a CURSANDO…' },
  { title: 'Creando bimestres', description: 'Registros de bimestre por estudiante matriculado…' },
  { title: 'Habilitando la gestión', description: 'Finalizando la activación del cursado…' },
];

const IniciarGestionProgressModal = ({ open }) => {
  const [step, setStep] = useState(0);

  // El padre remonta este modal vía `key` al abrir/cerrar, por lo que `step`
  // arranca siempre en 0; aquí solo avanzamos el indicador mientras está abierto.
  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, PASOS.length - 1));
    }, 1300);
    return () => clearInterval(id);
  }, [open]);

  return (
    <Modal
      open={open}
      title="Iniciando gestión académica"
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
    >
      <Flex vertical gap="large" style={{ paddingTop: 8 }}>
        <Steps
          orientation="vertical"
          size="small"
          current={step}
          items={PASOS.map((p, i) => ({
            title: p.title,
            content: p.description,
            icon: i === step ? <LoadingOutlined /> : undefined,
          }))}
        />
        <Text type="secondary">
          Esto puede tardar según la cantidad de estudiantes matriculados. No cierres esta ventana
          hasta que el proceso termine.
        </Text>
      </Flex>
    </Modal>
  );
};

export default IniciarGestionProgressModal;
