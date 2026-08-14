export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  subtitle: string;
  tierNumber: string;
  priceMonthly: number;
  priceQuarterly: number;
  popular?: boolean;
  features: string[];
  recommendedFor: string;
  color: string;
}

export interface MetricComparison {
  label: string;
  before: number;
  after: number;
  growth: string;
  unit: string;
  iconName: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  deliverables: string[];
  badge: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  category: 'Restaurant' | 'Hospital' | 'Real Estate' | 'Showroom' | 'School' | 'Manufacturing' | 'Retail';
  rating: number;
  comment: string;
  result: string;
  date: string;
  avatar: string;
  verified: boolean;
}

export interface VisitorNotification {
  id: string;
  type: 'visitor_entry' | 'inquiry_submitted' | 'payment_completed' | 'whatsapp_click';
  timestamp: string;
  title: string;
  details: string;
  recipientEmail: string;
  visitorData?: {
    city?: string;
    device?: string;
    referrer?: string;
    page?: string;
  };
  inquiryData?: {
    name: string;
    phone: string;
    businessName: string;
    service: string;
  };
  paymentData?: {
    tierName: string;
    amount: number;
    transactionId: string;
  };
}

export interface AiStrategyRequest {
  businessName: string;
  businessType: string;
  location: string;
  monthlyGoal: string;
  currentBottlenecks: string;
  budgetRange: string;
}

export interface AiStrategyResponse {
  executiveSummary: string;
  targetAudienceProfile: string;
  recommendedFunnel: {
    attract: string[];
    engage: string[];
    convert: string[];
    analysis: string[];
  };
  estimated30DayMetrics: {
    estimatedReach: string;
    estimatedEnquiries: string;
    estimatedRoi: string;
  };
  actionableQuickWins: string[];
  recommendedPackage: string;
}
