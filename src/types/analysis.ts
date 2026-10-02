import type { NumericChartData, ScatterChartData } from './chart';

export interface VideoData {
  videoId: string;
  title: string;
  views: number;
  viewsFormatted: string;
  /** False means the numeric compatibility value is excluded from calculations. */
  viewsAvailable?: boolean;
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
  subscriberCount?: number;
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
  medianVideoLength: string;
  mostActiveDay: string;
  viewsGrowthTrend: 'rising' | 'stable' | 'declining' | 'unknown';
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
    viewsDistribution: NumericChartData;
    publishingTimeline: NumericChartData;
    contentThemes: NumericChartData;
    lengthVsViews: ScatterChartData;
  };
  meta: {
    dataSource: 'live' | 'sample';
    analysisSource: 'gemini' | 'computed';
    generatedAt: string;
    notice?: string;
  };
}

export interface ChannelSearchResult {
  name: string;
  channelId: string;
  handle: string;
  avatar: string;
  subscribers: string;
  description: string;
}

export interface ChannelSearchResponse {
  channels: ChannelSearchResult[];
  error?: string;
}
