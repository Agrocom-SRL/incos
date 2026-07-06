import { useContext } from 'react';
import { DocumentacionContext } from '../../context/DocumentacionContext';

export const useDocumentacionContext = () => {
  const context = useContext(DocumentacionContext);
  if (!context) {
    throw new Error('useDocumentacionContext must be used within DocumentacionProvider');
  }
  return context;
};
