import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EmployeeView, Role } from '@wfh/contracts';
import type { UpdateEmployeeDto } from '@wfh/contracts/dto';
import { useId, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';

import { authKeys } from '../../api/auth';
import { ApiError } from '../../api/client';
import { createEmployee, employeeKeys, updateEmployee } from '../../api/employees';
import { useToast } from '../../components/toast/toast-context';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { TextField } from '../../components/ui/TextField';
import { EMPLOYEE, ROLE_LABELS } from '../../lib/roles';

interface EmployeeFormValues {
  employeeCode: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
}

export interface EmployeeFormModalProps {
  /** `null` to create a new employee. */
  employee: EmployeeView | null;
  /** Editing your own account: role and active status are locked. */
  isSelf: boolean;
  onClose: () => void;
}

// Mirrors the contract DTOs so most mistakes are caught before a round trip; the server still
// validates everything.
const PASSWORD_MAX_BYTES = 72;
const encoder = new TextEncoder();

// Mounted only while open, so every open starts from fresh form state.
export function EmployeeFormModal({ employee, isSelf, onClose }: EmployeeFormModalProps) {
  const isEdit = employee !== null;
  const formId = useId();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<ApiError | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<EmployeeFormValues>({
    defaultValues: {
      employeeCode: employee?.employeeCode ?? '',
      name: employee?.name ?? '',
      email: employee?.email ?? '',
      password: '',
      role: employee?.role ?? EMPLOYEE,
      isActive: employee?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: EmployeeFormValues) =>
      isEdit
        ? updateEmployee(employee.id, changedFields(values, dirtyFields))
        : createEmployee({
            employeeCode: values.employeeCode,
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
          }),
    onSuccess: async (saved) => {
      toast.success(isEdit ? 'Employee updated' : 'Employee created', saved.name);
      if (isSelf) {
        queryClient.setQueryData(authKeys.me, saved);
      }
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      onClose();
    },
    onError: (error) => {
      const field = error instanceof ApiError ? conflictField(error) : undefined;
      if (field) {
        setError(field, { message: error.message }, { shouldFocus: true });
        setSubmitError(null);
      } else {
        setSubmitError(error instanceof ApiError ? error : new ApiError(error.message, 0));
      }
    },
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    mutation.mutate(values);
  });

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!mutation.isPending}
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={
        isEdit
          ? `${employee.name} · ${employee.employeeCode}`
          : 'They can sign in with this email and password straight away.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={isEdit && !isDirty}
          >
            {isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={onSubmit} className="flex flex-col gap-4 pb-2">
        {submitError && (
          <Alert tone="danger" title={submitError.message}>
            {submitError.details.length > 0 && (
              <ul className="list-disc pl-4">
                {submitError.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <TextField
            label="Employee code"
            autoComplete="off"
            disabled={isEdit}
            hint={isEdit ? "Can't be changed" : undefined}
            error={errors.employeeCode?.message}
            {...register('employeeCode', {
              required: 'Employee code is required',
              setValueAs: (value: string) => value.trim(),
              minLength: { value: 3, message: 'At least 3 characters' },
              maxLength: { value: 20, message: 'At most 20 characters' },
            })}
          />
          <TextField
            label="Full name"
            autoComplete="off"
            error={errors.name?.message}
            {...register('name', {
              setValueAs: (value: string) => value.trim(),
              required: 'Name is required',
              maxLength: { value: 100, message: 'At most 100 characters' },
            })}
          />
        </div>

        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          error={errors.email?.message}
          {...register('email', {
            setValueAs: (value: string) => value.trim().toLowerCase(),
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            maxLength: { value: 150, message: 'At most 150 characters' },
          })}
        />

        <TextField
          label={isEdit ? 'New password' : 'Password'}
          type="password"
          autoComplete="new-password"
          placeholder={isEdit ? 'Leave blank to keep the current password' : undefined}
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password', {
            required: isEdit ? false : 'Password is required',
            validate: (value) => {
              if (!value) {
                return true;
              }
              if (value.length < 8) {
                return 'At least 8 characters';
              }
              // bcrypt only reads the first 72 bytes, so longer passwords are rejected outright.
              return encoder.encode(value).length <= PASSWORD_MAX_BYTES || 'Password is too long';
            },
          })}
        />

        <Select
          label="Role"
          disabled={isSelf}
          hint={isSelf ? "You can't change your own role." : undefined}
          {...register('role')}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        {isEdit && (
          <Checkbox
            label="Active"
            disabled={isSelf}
            description={
              isSelf
                ? "You can't deactivate your own account."
                : 'Inactive employees cannot sign in or check in.'
            }
            {...register('isActive')}
          />
        )}
      </form>
    </Modal>
  );
}

// PATCH only what was edited, so an unchanged field never trips validation or overwrites a
// concurrent change made by someone else.
function changedFields(
  values: EmployeeFormValues,
  dirty: Partial<Record<keyof EmployeeFormValues, boolean | undefined>>,
): UpdateEmployeeDto {
  return {
    ...(dirty.name && { name: values.name }),
    ...(dirty.email && { email: values.email }),
    ...(dirty.role && { role: values.role }),
    ...(dirty.isActive && { isActive: values.isActive }),
    ...(values.password && { password: values.password }),
  };
}

function conflictField(error: ApiError): FieldPath<EmployeeFormValues> | undefined {
  if (error.status !== 409) {
    return undefined;
  }
  if (/email/i.test(error.message)) {
    return 'email';
  }
  if (/code/i.test(error.message)) {
    return 'employeeCode';
  }
  return undefined;
}
