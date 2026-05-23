"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, ArrowRight } from "lucide-react";

const getRelativeTime = (dateString) => {
  if (!dateString) return null;
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const getProgress = (chapters) => {
  if (!chapters || chapters.length === 0) return 0;
  const completed = chapters.filter((ch) => ch.completed).length;
  return Math.round((completed / chapters.length) * 100);
};

const getResumeChapter = (course) => {
  const chapters = course.chapters || [];
  const lastIdx = course.lastAccessedChapter ?? -1;
  if (lastIdx >= 0 && lastIdx < chapters.length && !chapters[lastIdx]?.completed) {
    return lastIdx + 1;
  }
  const nextIdx = chapters.findIndex((ch) => !ch.completed);
  return nextIdx >= 0 ? nextIdx + 1 : chapters.length;
};

const getResumeHref = (course) => {
  const chapterNum = getResumeChapter(course);
  return `/chapter-test/${course.id}/${chapterNum}`;
};

export default function ContinueLearning({ courses }) {
  if (!courses || courses.length === 0) return null;

  const inProgress = courses.filter((c) => {
    const progress = getProgress(c.chapters);
    return progress > 0 && progress < 100;
  });

  if (inProgress.length === 0) return null;

  const sorted = [...inProgress].sort((a, b) => {
    const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return bTime - aTime;
  });

  const latest = sorted[0];
  if (!latest.lastAccessedAt) return null;

  const progress = getProgress(latest.chapters);
  const relativeTime = getRelativeTime(latest.lastAccessedAt);
  const completedChapters = latest.chapters?.filter((ch) => ch.completed).length || 0;
  const totalChapters = latest.chapters?.length || 0;

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center gap-2 mb-3">
        <Play className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Continue Learning
        </h2>
      </div>
      <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-blue-500/[0.02] to-transparent">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {completedChapters}/{totalChapters} chapters
                  {relativeTime && <span className="ml-2">&middot; {relativeTime}</span>}
                </span>
              </div>
              <h3 className="text-lg font-semibold truncate">{latest.courseTitle}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 max-w-xs">
                  <Progress value={progress} className="h-1.5" indicatorClassName={progress === 100 ? "bg-green-500" : "bg-blue-500"} />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/roadmap/${latest.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  View Course
                </Button>
              </Link>
              <Link href={getResumeHref(latest)}>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Continue
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
