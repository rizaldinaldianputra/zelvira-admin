export interface RoleMenuPermission {
  id?: number;
  menuKey: string;
  menuTitle: string;
  canView: boolean;
  canRead: boolean;
  canWrite: boolean;
}

export interface SystemRole {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount?: number;
  permissions: RoleMenuPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuDefinition {
  group: string;
  menuKey: string;
  menuTitle: string;
  defaultPath: string;
}

export interface SystemRoleInput {
  name: string;
  description?: string;
  permissions: {
    menuKey: string;
    menuTitle: string;
    canView: boolean;
    canRead: boolean;
    canWrite: boolean;
  }[];
}
