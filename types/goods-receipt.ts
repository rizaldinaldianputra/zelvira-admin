export interface GoodsReceiptItem {
  id: number;
  purchaseOrderItemId?: number;
  variantId: number;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  quantityReceived: number;
  quantityRejected: number;
  unitCost?: number;
  notes?: string;
}

export interface GoodsReceipt {
  id: number;
  receiptNumber: string;
  purchaseOrderId?: number;
  poNumber?: string;
  supplierId: number;
  supplierCode?: string;
  supplierName: string;
  receiptDate: string;
  doNumber?: string;
  receivedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: string;
  notes?: string;
  totalItems: number;
  totalReceivedQty: number;
  totalRejectedQty: number;
  items: GoodsReceiptItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GoodsReceiptItemInput {
  purchaseOrderItemId?: number;
  variantId: number;
  quantityReceived: number;
  quantityRejected?: number;
  unitCost?: number;
  notes?: string;
}

export interface CreateGoodsReceiptInput {
  receiptNumber?: string;
  purchaseOrderId?: number;
  supplierId: number;
  receiptDate: string;
  doNumber?: string;
  notes?: string;
  updateCostPrice?: boolean;
  items: GoodsReceiptItemInput[];
}
