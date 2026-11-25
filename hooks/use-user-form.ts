'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { RoleService } from '@/services/role.service';
import { SystemRole } from '@/types/role';

export const userSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  taskGroup: z.string().optional(),
  systemRoleId: z.number().optional(),
  roleNames: z.array(z.string()).default(['ROLE_USER']),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function useUserForm(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{ id: number; name: string }[]>([]);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>([]);
  const isNew = id === 'new';

  const form = useForm<any>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      taskGroup: '',
      systemRoleId: 0,
      roleNames: ['ROLE_USER'],
    },
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [roles, sysRoles] = await Promise.all([
          UserService.getAllRoles(),
          RoleService.getAllRoles(),
        ]);
        setAvailableRoles(roles);
        setSystemRoles(sysRoles || []);

        if (!isNew) {
          const user = await UserService.getById(Number(id));
          form.reset({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            taskGroup: user.taskGroup || '',
            systemRoleId: user.systemRole ? user.systemRole.id : 0,
            roleNames: user.roles?.map((r: any) => r.name) || ['ROLE_USER'],
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load user permissions', variant: 'destructive' });
      }
    };
    init();
  }, [id, isNew, form]);

  const toggleRole = (roleName: string) => {
    const currentRoles: string[] = form.getValues('roleNames') || [];
    if (currentRoles.includes(roleName)) {
      form.setValue('roleNames', currentRoles.filter((r) => r !== roleName));
    } else {
      form.setValue('roleNames', [...currentRoles, roleName]);
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      if (isNew) {
        await UserService.create({
          ...values,
          password: values.password || 'Default123!',
          systemRoleId: values.systemRoleId && values.systemRoleId > 0 ? values.systemRoleId : undefined,
        });
        toast({ title: 'Success', description: 'User account created successfully' });
      } else {
        await UserService.update(Number(id), {
          ...values,
          systemRoleId: values.systemRoleId && values.systemRoleId > 0 ? values.systemRoleId : undefined,
        });
        await UserService.updateRolesAndGroups(Number(id), {
          taskGroup: values.taskGroup || '',
          roleNames: values.roleNames,
          systemRoleId: values.systemRoleId && values.systemRoleId > 0 ? values.systemRoleId : undefined,
        });
        toast({ title: 'Success', description: 'User permissions saved' });
      }
      router.push('/admin/users');
    } catch {
      toast({ title: 'Error', description: 'Failed to save user account', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isNew,
    availableRoles,
    systemRoles,
    toggleRole,
    onSubmit,
  };
}
