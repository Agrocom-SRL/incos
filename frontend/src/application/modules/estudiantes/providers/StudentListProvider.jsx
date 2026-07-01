/**
 * Provider: lista de estudiantes con paginación y búsqueda en servidor.
 */

import { useMemo } from 'react';
import { useEstudiantesApi } from '@application-estudiantes/hooks/api/useEstudiantesApi';
import { useDeleteStudent } from '@application-estudiantes/hooks/api/useDeleteStudent';
import { useServerPaginatedList } from '@application/utils';
import { StudentListContext } from '@application-estudiantes/context/StudentListContext';

export const StudentListProvider = ({ children }) => {
  const { fetch: fetchEstudiantes } = useEstudiantesApi();
  const { deleteStudent: deleteStudentApi, loading: deleting } = useDeleteStudent();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    loadAll: true,
    fetch: fetchEstudiantes,
    buildRequest: ({ page, limit, search }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        sort: 'created_at:DESC',
      },
    }),
  });

  const deleteStudent = useMemo(
    () => async (studentId) => {
      const result = await deleteStudentApi(studentId);
      if (result.success) await refetch();
      return result;
    },
    [deleteStudentApi, refetch],
  );

  const value = useMemo(
    () => ({
      estudiantes: rows,
      loading: loading || deleting,
      error,
      refetch,
      deleteStudent,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, deleting, error, refetch, deleteStudent, searchText, setSearchText, tablePagination],
  );

  return <StudentListContext.Provider value={value}>{children}</StudentListContext.Provider>;
};
