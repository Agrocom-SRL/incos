import { useContext } from 'react';
import { CompromisoContext } from '@application-finanzas/context/CompromisoContext';

export const useCompromisoContext = () => {
  const context = useContext(CompromisoContext);
  if (!context) {
    throw new Error('useCompromisoContext debe usarse dentro de CompromisoProvider');
  }
  return context;
};
