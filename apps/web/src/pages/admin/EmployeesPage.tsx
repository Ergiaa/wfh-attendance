import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EmployeeView } from '@wfh/contracts';
import { ClipboardList, Pencil, Search, Trash2, UserCheck, UserPlus, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { deleteEmployee, employeeKeys, fetchEmployees, updateEmployee } from '../../api/employees';
import { useCurrentUser } from '../../auth/auth-context';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { useToast } from '../../components/toast/toast-context';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { buttonClassName } from '../../components/ui/button-styles';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Table, type Column } from '../../components/ui/Table';
import { paths } from '../../lib/paths';
import { isHrdAdmin, ROLE_LABELS } from '../../lib/roles';
import { useListParams } from '../../lib/use-list-params';
import { formatDate } from '../../lib/work-date';
import { EmployeeFormModal } from './EmployeeFormModal';

const PAGE_SIZE = 10;

type PendingAction = { kind: 'delete' | 'deactivate'; employee: EmployeeView };

export function EmployeesPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { page, get, update, setPage } = useListParams();
  const search = get('search');

  // `undefined` = closed, `null` = creating, an employee = editing.
  const [editing, setEditing] = useState<EmployeeView | null | undefined>(undefined);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const query = { page, limit: PAGE_SIZE, search: search || undefined };
  const employees = useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: ({ signal }) => fetchEmployees(query, signal),
    placeholderData: keepPreviousData,
  });

  const onActionSettled = async () => {
    setPending(null);
    await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  const setActive = useMutation({
    mutationFn: ({ employee, isActive }: { employee: EmployeeView; isActive: boolean }) =>
      updateEmployee(employee.id, { isActive }),
    onSuccess: (saved) =>
      toast.success(saved.isActive ? 'Employee activated' : 'Employee deactivated', saved.name),
    onError: (error) => toast.error("Couldn't update the employee", error.message),
    onSettled: onActionSettled,
  });

  const remove = useMutation({
    mutationFn: (employee: EmployeeView) => deleteEmployee(employee.id),
    onSuccess: (deleted) => toast.success('Employee deleted', deleted.name),
    onError: (error) => toast.error("Couldn't delete the employee", error.message),
    onSettled: onActionSettled,
  });

  const columns: Column<EmployeeView>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => (
        <div className="flex max-w-48 flex-col sm:max-w-none">
          <span className="flex items-center gap-2 font-medium">
            <span className="truncate">{row.name}</span>
            {row.id === currentUser.id && <Badge tone="primary">You</Badge>}
          </span>
          <span className="truncate text-xs text-fg-muted">{row.email}</span>
          {/* Phones drop the code, role and status columns so the actions stay on screen. */}
          <span className="mt-1 flex items-center gap-1.5 sm:hidden">
            <span className="font-mono text-xs text-fg-muted">{row.employeeCode}</span>
            {isHrdAdmin(row) && <Badge tone="primary">{ROLE_LABELS[row.role]}</Badge>}
            {!row.isActive && <Badge>Inactive</Badge>}
          </span>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      className: 'hidden sm:table-cell',
      cell: (row) => <span className="font-mono text-xs">{row.employeeCode}</span>,
    },
    {
      id: 'role',
      header: 'Role',
      className: 'hidden sm:table-cell',
      cell: (row) => (
        <Badge tone={isHrdAdmin(row) ? 'primary' : 'neutral'}>{ROLE_LABELS[row.role]}</Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      className: 'hidden sm:table-cell',
      cell: (row) =>
        row.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
    },
    {
      id: 'added',
      header: 'Added',
      className: 'hidden lg:table-cell',
      cell: (row) => <span className="text-fg-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (row) => {
        const isSelf = row.id === currentUser.id;
        return (
          <div className="flex justify-end gap-1">
            <Link
              to={`${paths.attendance}?employeeId=${row.id}`}
              aria-label={`View attendance for ${row.name}`}
              title="View attendance"
              className={buttonClassName({ variant: 'ghost', size: 'icon' })}
            >
              <ClipboardList aria-hidden />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${row.name}`}
              title="Edit"
              onClick={() => setEditing(row)}
            >
              <Pencil aria-hidden />
            </Button>
            {!isSelf &&
              (row.isActive ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Deactivate ${row.name}`}
                  title="Deactivate"
                  onClick={() => setPending({ kind: 'deactivate', employee: row })}
                >
                  <UserX aria-hidden />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Activate ${row.name}`}
                  title="Activate"
                  disabled={setActive.isPending}
                  onClick={() => setActive.mutate({ employee: row, isActive: true })}
                >
                  <UserCheck aria-hidden />
                </Button>
              ))}
            {!isSelf && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${row.name}`}
                title="Delete"
                onClick={() => setPending({ kind: 'delete', employee: row })}
                className="hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 aria-hidden />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const clearSearch = () => update({ search: '' });

  return (
    <>
      <PageHeader
        title="Employees"
        description="Add employees, update their details and control who can sign in."
        actions={
          <Button onClick={() => setEditing(null)}>
            <UserPlus aria-hidden />
            Add employee
          </Button>
        }
      />

      <SearchInput
        value={search}
        onSearch={(value) => update({ search: value })}
        label="Search employees"
        placeholder="Search name, email or code"
        className="mb-4 max-w-sm"
      />

      {employees.isError && !employees.data ? (
        <Alert tone="danger" title="Couldn't load employees">
          <p>{employees.error.message}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => void employees.refetch()}
          >
            Try again
          </Button>
        </Alert>
      ) : (
        <Table
          caption="Employees"
          columns={columns}
          rows={employees.data?.items}
          getRowId={(row) => row.id}
          loading={employees.isPending}
          stale={employees.isPlaceholderData}
          empty={
            search ? (
              <EmptyState
                icon={Search}
                title={`No employees match “${search}”`}
                action={
                  <Button variant="secondary" onClick={clearSearch}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState title="No employees yet" />
            )
          }
          footer={
            employees.data && (
              <Pagination
                page={employees.data.page}
                limit={employees.data.limit}
                total={employees.data.total}
                onPageChange={setPage}
                disabled={employees.isPlaceholderData}
              />
            )
          }
        />
      )}

      {editing !== undefined && (
        <EmployeeFormModal
          employee={editing}
          isSelf={editing?.id === currentUser.id}
          onClose={() => setEditing(undefined)}
        />
      )}

      <ConfirmDialog
        open={pending?.kind === 'deactivate'}
        title="Deactivate employee?"
        description={
          <>
            <strong className="font-medium text-fg">{pending?.employee.name}</strong> won't be able
            to sign in or check in until reactivated. Their attendance history is kept.
          </>
        }
        confirmLabel="Deactivate"
        tone="danger"
        loading={setActive.isPending}
        onConfirm={() =>
          pending && setActive.mutate({ employee: pending.employee, isActive: false })
        }
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Delete employee?"
        description={
          <>
            <strong className="font-medium text-fg">{pending?.employee.name}</strong> will be
            removed from the employee list and can no longer sign in. Their attendance history is
            kept, and their code and email stay reserved.
          </>
        }
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => pending && remove.mutate(pending.employee)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
