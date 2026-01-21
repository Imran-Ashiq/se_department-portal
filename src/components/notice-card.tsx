'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, FileText, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoticeCardProps {
  notice: {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
    author?: {
      id: string;
      name: string | null;
      email: string | null;
      role: string;
    } | null;
  };
}

const CHAR_LIMIT = 400;

// Utility functions for badge colors
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'GENERAL':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'EXAMS':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'EVENTS':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getRoleBadgeColor = (role: string) => {
  if (role === 'SUPER_ADMIN') {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
};

export function NoticeCard({ notice }: NoticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = notice.content.length > CHAR_LIMIT;

  // Function to truncate at word boundary
  const getTruncatedContent = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    
    // Find the last space before the limit
    const truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    
    // If we found a space, cut there; otherwise use the full limit
    return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
  };

  const displayContent = shouldTruncate && !isExpanded
    ? getTruncatedContent(notice.content, CHAR_LIMIT)
    : notice.content;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        {/* Post Header - Author Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {notice.author?.name || 'Department Admin'}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleBadgeColor(notice.author?.role || 'ADMIN')}`}
                >
                  {notice.author?.role === 'SUPER_ADMIN' ? 'HOD' : 
                   notice.author?.role === 'TEACHER' ? 'Teacher' :
                   notice.author?.role === 'CLERK' ? 'Clerk' : 'Admin'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          {/* Category Badge */}
          <Badge className={`${getCategoryColor(notice.category)} text-xs`}>
            {notice.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Notice Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {notice.title}
        </h3>
        
        {/* Notice Content with Read More/Less */}
        <div className="space-y-2">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {displayContent}
            {shouldTruncate && !isExpanded && <span className="text-slate-400">...</span>}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {isExpanded ? 'See Less' : 'See More'}
            </Button>
          )}
        </div>

        {/* Attachment Link */}
        {notice.attachmentUrl && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            {notice.attachmentType === 'image' ? (
              <div className="space-y-2">
                <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={notice.attachmentUrl}
                    alt="Notice attachment"
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority={false}
                  />
                </div>
              </div>
            ) : notice.attachmentType === 'pdf' ? (
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">View PDF Document</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                View Attachment
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
