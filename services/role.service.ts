import { SystemRole, MenuDefinition, SystemRoleInput } from '@/types/role';
import { BaseService } from './base.service';
import { apiClient } from './api.client';

class RoleServiceClass extends BaseService<SystemRole> {
  constructor() {
    super('/admin/roles');
  }

  async getAllRoles(): Promise<SystemRole[]> {
    const response = await apiClient.get<any>(this.endpoint);
    return response?.data ?? response;
  }

  async getRoleById(id: number): Promise<SystemRole> {
    const response = await apiClient.get<any>(`${this.endpoint}/${id}`);
    return response?.data ?? response;
  }

  async getMenus(): Promise<MenuDefinition[]> {
    const response = await apiClient.get<any>(`${this.endpoint}/menus`);
    return response?.data ?? response;
  }

  override async create(data: SystemRoleInput | Partial<SystemRole>): Promise<SystemRole> {
    const response = await apiClient.post<any>(this.endpoint, data);
    return response?.data ?? response;
  }

  override async update(id: number, data: SystemRoleInput | Partial<SystemRole>): Promise<SystemRole> {
    const response = await apiClient.put<any>(`${this.endpoint}/${id}`, data);
    return response?.data ?? response;
  }

  override async delete(id: number): Promise<any> {
    const response = await apiClient.delete<any>(`${this.endpoint}/${id}`);
    return response?.data ?? response;
  }
}

export const RoleService = new RoleServiceClass();
