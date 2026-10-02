import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';

interface PageProps {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function AnalyzePage({ params, searchParams }: PageProps) {
  const { channelId: rawChannelId } = await params;
  const { demo } = await searchParams;
  let channelId = rawChannelId;
  try {
    channelId = decodeURIComponent(rawChannelId);
  } catch {
    channelId = rawChannelId;
  }
  return <AnalysisDashboard key={`${channelId}:${demo === 'true'}`} channelId={channelId} isDemo={demo === 'true'} />;
}
