export interface WorkflowTaskVariables {
  orderId?: number;
  orderNumber?: string;
  totalAmount?: number;
  totalQty?: number;
  paymentMethod?: string;
  status?: string;
  customerName?: string;
  customerUsername?: string;
  shippingRecipient?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  [key: string]: any;
}

export interface WorkflowTask {
  id: string;
  name: string;
  processInstanceId: string;
  createTime: string;
  variables: WorkflowTaskVariables;
}
