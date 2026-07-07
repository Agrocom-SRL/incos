import { useContext } from 'react';
import { AulaContext } from '../../context/AulaContext';

export const useAulaContext = () => {
  const context = useContext(AulaContext);
  if (!context) {
    throw new Error('useAulaContext must be used within AulaProvider');
  }
  return context;
};
