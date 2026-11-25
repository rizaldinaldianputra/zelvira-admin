export type PricingCategory = 'PACKAGING' | 'OPERATIONAL' | 'MARKETING' | 'OTHER';
export type PricingCostType = 'FIXED_AMOUNT' | 'PERCENTAGE';
export type PricingRoundingRule = 'NONE' | 'ROUND_UP_100' | 'ROUND_UP_500' | 'ROUND_UP_1000' | 'CHARM_900' | 'CHARM_999';

export interface PricingCostItem {
  id: number;
  code: string;
  name: string;
  category: PricingCategory;
  costType: PricingCostType;
  defaultAmount: number;
  unit: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingCostItemRequest {
  code: string;
  name: string;
  category: PricingCategory;
  costType: PricingCostType;
  defaultAmount: number;
  unit: string;
  description?: string;
  isActive?: boolean;
}

export interface PricingFormula {
  id: number;
  name: string;
  code: string;
  description?: string;
  hppExpression: string;
  minPriceExpression: string;
  sellingPriceExpression: string;
  strikePriceExpression: string;
  roundingRule: PricingRoundingRule;
  defaultProfitPercent: number;
  defaultProfitNominal: number;
  defaultAdminFeePercent: number;
  defaultBufferDiskonPercent: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingFormulaRequest {
  name: string;
  code: string;
  description?: string;
  hppExpression?: string;
  minPriceExpression?: string;
  sellingPriceExpression?: string;
  strikePriceExpression?: string;
  roundingRule?: PricingRoundingRule;
  defaultProfitPercent?: number;
  defaultProfitNominal?: number;
  defaultAdminFeePercent?: number;
  defaultBufferDiskonPercent?: number;
  isDefault?: boolean;
}

export interface PriceCalculationRequest {
  productId?: number;
  variantId?: number;
  formulaId?: number;
  baseModal?: number;
  profitPercent?: number;
  profitNominal?: number;
  adminFeePercent?: number;
  bufferDiskonPercent?: number;
  roundingRule?: PricingRoundingRule;
  costOverrides?: Record<string, number>;
}

export interface PriceCalculationResponse {
  baseModal: number;
  packagingCost: number;
  operationalCost: number;
  marketingCost: number;
  otherCost: number;
  totalHpp: number;
  minSellingPrice: number;
  recommendedPrice: number;
  roundedPrice: number;
  strikePrice: number;
  profitNominal: number;
  marginPercent: number;
  estimatedAdminFeeNominal: number;
  roundingRule: string;
  variablesUsed: Record<string, number>;
  itemizedCosts: Record<string, number>;
}

export interface VariantPricingDto {
  id: number;
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  currentPrice: number;
  currentDiscountPrice?: number;
  currentCostPrice?: number;
  calculatedHpp?: number;
  calculatedSellingPrice?: number;
  calculatedStrikePrice?: number;
  profitMarginPercent?: number;
  isApplied?: boolean;
}

export interface ProductPricing {
  id: number;
  name: string;
  sku?: string;
  categoryName?: string;
  imageUrl?: string;
  totalStock: number;
  currentMinPrice: number;
  currentMaxPrice: number;
  currentCostPrice: number;
  calculatedHpp?: number;
  calculatedSellingPrice?: number;
  calculatedStrikePrice?: number;
  profitMarginPercent?: number;
  isApplied?: boolean;
  variants: VariantPricingDto[];
}

export interface ApplyPriceRequest {
  productId: number;
  variantId?: number;
  variantIds?: number[];
  sellingPrice?: number;
  discountPrice?: number;
  costPrice?: number;
}

export interface ProductProfitabilityDto {
  productId: number;
  productName: string;
  sku?: string;
  category?: string;
  imageUrl?: string;
  totalStock: number;
  currentSellingPrice: number;
  hppPerUnit: number;
  unitProfit: number;
  marginPercent: number;
  unitsSold: number;
  revenue: number;
  totalCost: number;
  totalProfit: number;
  performanceLabel: 'STAR' | 'VOLUME_DRIVER' | 'MODERATE' | 'LOW_PERFORMER';
}

export interface PricingAnalytics {
  totalInventoryHppValue: number;
  totalRevenue: number;
  totalEstimatedHppCost: number;
  totalGrossProfit: number;
  averageMarginPercent: number;
  totalProductsCount: number;
  profitableProductsCount: number;
  lowMarginProductsCount: number;
  products: ProductProfitabilityDto[];
}

