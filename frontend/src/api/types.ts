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
  displayName?: string
}

export interface AuthPayload {
  accessToken: string
  refreshToken: string
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
  wizardId?: string
  budgetMin?: number
  budgetMax?: number
  priorityWeights?: string
  requirementProfile?: string
  status: string
  createdAt: string
  updatedAt: string
  answers: DecisionAnswer[]
}

export interface DecisionSummary {
  sessionTitle: string
  category: string
  recommendationCount: number
  topRecommendation: string | null
  keyReasons: string[]
  caveats: string[]
  aiGenerated: boolean
  generatedAt: string
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
  inStock?: boolean
}

export interface SpecValueResponse {
  specDefId: string
  keyName: string
  name: string
  dataType: string
  unit?: string
  explanation?: string
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
  displayValue?: string
}

export interface ReviewResponse {
  id: string
  reviewType?: string
  source?: string
  sourceUrl?: string
  authorName?: string
  rating?: number
  title?: string
  content?: string
  sentiment?: string
  sentimentScore?: number
  verifiedPurchase?: boolean
  helpfulCount?: number
  reviewDate?: string
  createdAt?: string
}

export interface PriceHistoryPoint {
  id: string
  sellerName: string
  price: number
  currency: string
  recordedAt: string
}

export interface ProductDetail extends ProductSummary {
  description?: string
  specifications: SpecValueResponse[]
  prices: PriceResponse[]
  reviews: ReviewResponse[]
}

export interface ComparisonCell {
  productId: string
  displayValue?: string
  value?: string
}

export interface ComparisonSpecRow {
  keyName: string
  name: string
  dataType?: string
  unit?: string
  cells: ComparisonCell[]
}

export interface ComparisonItem {
  productId: string
  product: ProductSummary
  rank?: number
  overallScore?: number
  budgetCategory?: string
  prices: PriceResponse[]
}

export interface ComparisonResponse {
  sessionId: string
  categorySlug: string
  categoryName: string
  items: ComparisonItem[]
  specRows: ComparisonSpecRow[]
}

export interface FeedItem {
  id: string
  type: string
  title: string
  body?: string
  icon?: string
  status?: string
  category?: string
  productName?: string
  productSlug?: string
  read?: boolean
  occurredAt: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  productId?: string
  productName?: string
  productSlug?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface DnaFactor {
  id: string
  factor: string
  score: number
  sampleSize: number
  updatedAt: string
}

export interface UserPreference {
  id: string
  experienceLevel?: string
  brandPreferences?: string
  osPreferences?: string
  defaultCurrency?: string
  notifyPriceDrops?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserPreferenceRequest {
  experienceLevel?: string
  brandPreferences?: string
  osPreferences?: string
  defaultCurrency?: string
  notifyPriceDrops?: boolean
}

export interface JournalEntry {
  id: string
  sessionId?: string
  productId?: string
  productName?: string
  title: string
  notes?: string
  outcome?: string
  outcomeNotes?: string
  satisfactionRating?: number
  wouldBuyAgain?: boolean
  tags?: string
  createdAt: string
  updatedAt?: string
}

export interface JournalEntryRequest {
  sessionId?: string
  productId?: string
  title: string
  notes?: string
  outcome?: string
  outcomeNotes?: string
  satisfactionRating?: number
  wouldBuyAgain?: boolean
  tags?: string
}

export interface BookmarkProduct {
  id: string
  name: string
  slug: string
  brand: string
  imageUrl?: string
  bestPrice?: number
  avgRating?: number
  reviewCount: number
}

export interface BookmarkSession {
  id: string
  title: string
  categorySlug: string
  status: string
  createdAt: string
}

export interface BookmarkItem {
  id: string
  bookmarkType: string
  product?: BookmarkProduct
  session?: BookmarkSession
  createdAt: string
}

export interface PriceAlert {
  id: string
  productId: string
  productName: string
  productSlug: string
  imageUrl?: string
  targetPrice: number
  currentBestPrice?: number
  status: string
  isActive: boolean
  createdAt: string
}

export interface DecisionSummaryResponse {
  sessionTitle: string
  category: string
  recommendationCount: number
  topRecommendation: string | null
  keyReasons: string[]
  caveats: string[]
  aiGenerated: boolean
  generatedAt: string
}

/** Shape of the parsed `explainability` JSON blob on a recommendation. */
export interface ExplainabilityDimension {
  score: number
  importance: number
  verdict: string
  detail: string
}

export interface Explainability {
  summary?: string
  bestFeatures?: string[]
  weaknesses?: string[]
  budgetNote?: string
  dealBreakers?: string[]
  dimensions?: Record<string, ExplainabilityDimension>
}
