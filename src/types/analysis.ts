export interface VideoData {
  videoId: string;
  title: string;
  views: number;
  viewsFormatted: string;
  publishedDate: string;
  relativeDate?: string;
  length: string;
  lengthSeconds: number;
  thumbnail: string;
  url: string;
}

export interface ChannelData {
  name: string;
  handle: string;
  channelId: string;
  avatar: string;
  subscribers: string;
  subscriberCount: number;
  description: string;
  totalVideosAnalyzed: number;
}

export interface ChannelAnalytics {
  avgViews: number;
  avgViewsFormatted: string;
  medianViews: number;
  totalViews: number;
  totalViewsFormatted: string;
  publishingFrequency: string;
  avgVideoLength: string;
  mostActiveDay: string;
  viewsGrowthTrend: 'rising' | 'stable' | 'declining';
}

export interface ContentTheme {
  theme: string;
  percentage: number;
  videoCount: number;
}

export interface TitlePatterns {
  avgLength: number;
  commonPatterns: string[];
  emotionalTriggers: string[];
  useOfNumbers: string;
}

export interface PublishingStrategy {
  frequency: string;
  peakDays: string[];
  consistency: string;
  seasonalPatterns: string;
}

export interface PerformanceInsights {
  topPerformingTraits: string[];
  underperformingTraits: string[];
  viralFactors: string[];
}

export interface AIAnalysis {
  contentThemes: ContentTheme[];
  titlePatterns: TitlePatterns;
  publishingStrategy: PublishingStrategy;
  performanceInsights: PerformanceInsights;
  recommendations: string[];
  summary: string;
}

export interface FullAnalysisResponse {
  channel: ChannelData;
  videos: VideoData[];
  analytics: ChannelAnalytics;
  aiAnalysis: AIAnalysis;
  chartData: {
    viewsDistribution: any;
    publishingTimeline: any;
    contentThemes: any;
    lengthVsViews: any;
  };
}
