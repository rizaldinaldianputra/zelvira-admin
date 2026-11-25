export interface Supplier {
  id: number;
  code: string;
  name: string;
  picName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  paymentTerm: string; // CASH, NET_7, NET_14, NET_30, NET_60, TEMPO
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
}
