'use client';

import { useState } from 'react';
import { NoticeCard } from '@/components/notice-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Loader2 } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  thumbnailUrl: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface NoticeFeedProps {
  initialNotices: Notice[];
  initialHasMore: boolean;
}

export function NoticeFeed({ initialNotices, initialHasMore }: NoticeFeedProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/notices?page=${nextPage}&limit=5&public=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();
      
      // Serialize dates
      const serializedNotices = data.notices.map((notice: any) => ({
        ...notice,
        createdAt: typeof notice.createdAt === 'string' ? notice.createdAt : new Date(notice.createdAt).toISOString(),
      }));
      
      setNotices((prev) => [...prev, ...serializedNotices]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (notices.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Updates Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            There are no department notices at the moment. Check back later for updates and announcements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
          />
        ))}
      </div>

      {/* Load More Section */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {hasMore && (
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Notices'
            )}
          </Button>
        )}
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {hasMore 
            ? `Showing ${notices.length} notices • More available`
            : `All ${notices.length} ${notices.length === 1 ? 'notice' : 'notices'} loaded`
          }
        </p>
      </div>
    </>
  );
}
