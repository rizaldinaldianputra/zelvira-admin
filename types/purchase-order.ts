import { Supplier } from './supplier';

export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'PARTIAL' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface PurchaseOrderItem {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  currentStock?: number;
  quantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  subtotal: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierCode?: string;
  supplierName: string;
  supplierPhone?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  paymentStatus: PaymentStatus;
  paymentTerm: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  totalItems: number;
  totalOrderedQty: number;
  totalReceivedQty: number;
  items: PurchaseOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItemInput {
  variantId: number;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface CreatePurchaseOrderInput {
  poNumber?: string;
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: string;
  paymentStatus?: string;
  paymentTerm?: string;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  notes?: string;
  items: PurchaseOrderItemInput[];
}

export interface PurchaseOrderStats {
  total: number;
  draft: number;
  ordered: number;
  partiallyReceived: number;
  received: number;
  cancelled: number;
}
