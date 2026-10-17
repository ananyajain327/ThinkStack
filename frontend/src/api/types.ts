export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
  timestamp: number
}

export interface User {
  userId: string
  username: string
  email: string
  role: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentSlug?: string
}

export interface WizardQuestion {
  id: string
  questionKey: string
  questionText: string
  questionType: string
  options: string | null
  helpText?: string
  visibleIf?: string
  weight?: number
  displayOrder: number
  required: boolean
}

export interface Wizard {
  id: string
  name: string
  description?: string
  categorySlug: string
  categoryName: string
  questions: WizardQuestion[]
}

export interface DecisionAnswer {
  id: string
  questionKey: string
  questionText: string
  questionType: string
  answerValue: string
  createdAt: string
}

export interface DecisionSession {
  id: string
  title: string
  categorySlug: string
  categoryName: string
  wizardId: string
  budgetMin?: number
  budgetMax?: number
  priorityWeights?: string
  requirementProfile?: string
  status: string
  createdAt: string
  updatedAt: string
  answers: DecisionAnswer[]
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  brand: string
  model?: string
  categorySlug: string
  categoryName: string
  imageUrl?: string
  basePrice?: number
  bestPrice?: number
  currency: string
  avgRating?: number
  reviewCount: number
}

export interface Recommendation {
  id: string
  rankPosition: number
  product: ProductSummary
  overallScore: number
  confidenceRating: number
  budgetCategory?: string
  valueScore: number
  featureMatch: number
  performanceMatch: number
  reviewSentiment: number
  scoreBreakdown: string
  explainability: string
  advantages: string
  disadvantages: string
  dealBreakers: string
  tradeOffs: string
}

export interface PriceResponse {
  id: string
  sellerName: string
  sellerUrl: string
  price: number
  originalPrice?: number
  currency: string
  discountPercentage?: number
  availability?: string
  deliveryInformation?: string
  warrantyInformation?: string
  sellerRating?: number
}

export interface ComparisonItem {
  productId: string
  product: ProductSummary
  rank: number
  overallScore: number
  budgetCategory?: string
  sellers: PriceResponse[]
}

export interface ComparisonCell {
  productId: string
  displayValue: string
  textValue?: string
  numericValue?: number
  booleanValue?: boolean | null
}

export interface ComparisonSpecRow {
  specKey: string
  specName: string
  dataType?: string
  unit?: string
  cells: ComparisonCell[]
}

export interface ComparisonResponse {
  sessionId: string
  categorySlug: string
  categoryName: string
  generatedAt: string
  items: ComparisonItem[]
  specRows: ComparisonSpecRow[]
}

export interface FeedItem {
  id: string
  type: string
  title: string
  description?: string
  referenceId?: string
  createdAt: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface DnaFactor {
  factor: string
  weight: number
  confidence?: number
  sampleSize?: number
}

export interface JournalEntry {
  id: string
  sessionId?: string
  sessionTitle?: string
  productChosen?: string
  satisfactionRating?: number
  wouldRecommend?: boolean
  notes?: string
  createdAt: string
}

export interface BookmarkItem {
  id: string
  type: string
  productId?: string
  productName?: string
  sessionId?: string
  sessionTitle?: string
  createdAt: string
}

export interface PriceAlert {
  id: string
  productId: string
  productName: string
  targetPrice: number
  currentPrice?: number
  isActive: boolean
  createdAt: string
}
