import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A valid search query string is required' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();

    // Check for demo shortcuts
    const lower = cleanQuery.toLowerCase().replace(/^@/, '');
    if (lower === 'mkbhd' || lower === 'marques brownlee') {
      return NextResponse.json({
        channels: [
          {
            name: 'Marques Brownlee',
            handle: '@mkbhd',
            channelId: 'UCBcRF18a7Qf58cCRy5xuWwQ',
            subscribers: '19.5M subscribers',
            avatar:
              'https://yt3.googleusercontent.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHqqd8EM522QDcGQVcxDR52W6oQ=s176-c-k-c0x00ffffff-no-rj',
            description: 'Quality Tech Videos | YouTuber | Geek | Consumer Electronics',
          },
        ],
      });
    }

    if (lower === 'fireship') {
      return NextResponse.json({
        channels: [
          {
            name: 'Fireship',
            handle: '@fireship',
            channelId: 'UCsBjURrPoezykLs9EqgamOA',
            subscribers: '3.4M subscribers',
            avatar:
              'https://yt3.googleusercontent.com/ytc/AIdro_kX4QZqQYIuB9_2r_v_8nE1u00vQ=s176-c-k-c0x00ffffff-no-rj',
            description: 'High-intensity code tutorials and tech news.',
          },
        ],
      });
    }

    // Call SerpApi if key is configured
    if (process.env.SERPAPI_API_KEY) {
      const searchRes = (await serpApiService.searchChannels(cleanQuery)) as {
        channel_results?: Array<{
          title?: string;
          link?: string;
          channel_id?: string;
          thumbnail?: string;
          subscribers?: string;
          description?: string;
        }>;
      };

      const results = (searchRes?.channel_results || []).map((c) => ({
        name: c.title || cleanQuery,
        handle: c.title ? `@${c.title.toLowerCase().replace(/\s+/g, '')}` : cleanQuery,
        channelId: c.channel_id || cleanQuery,
        subscribers: c.subscribers || 'Creator Channel',
        avatar:
          c.thumbnail ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        description: c.description || 'YouTube Channel',
      }));

      return NextResponse.json({ channels: results });
    }

    // Fallback search response
    return NextResponse.json({
      channels: [
        {
          name: cleanQuery,
          handle: cleanQuery.startsWith('@') ? cleanQuery : `@${cleanQuery}`,
          channelId: cleanQuery.replace(/^@/, ''),
          subscribers: 'Creator',
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          description: `YouTube Channel matching ${cleanQuery}`,
        },
      ],
    });
  } catch (error) {
    console.error('[API /search]', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube channels. Please try again.' },
      { status: 500 }
    );
  }
}
