"use client";

import { useEffect, useState, useCallback } from "react";
import { ActivityFilters, ActivityFilterState } from "./ActivityFilters";
import { ActivityTimelineGlobal } from "./ActivityTimelineGlobal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityClient() {
  const [filters, setFilters] = useState<ActivityFilterState>({
    action_type: "",
    user_id: "",
    date_from: undefined,
    date_to: undefined,
  });

  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = useCallback(async (currentPage: number, currentFilters: ActivityFilterState, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "50");

      if (currentFilters.action_type) params.append("action_type", currentFilters.action_type);
      if (currentFilters.user_id) params.append("user_id", currentFilters.user_id);
      if (currentFilters.date_from) params.append("date_from", currentFilters.date_from.toISOString().split("T")[0]);
      if (currentFilters.date_to) params.append("date_to", currentFilters.date_to.toISOString().split("T")[0]);

      const res = await fetch(`/api/activity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setActivities(prev => [...prev, ...data.data]);
        } else {
          setActivities(data.data);
        }
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch on initial load or when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivities(1, filters, false);
  }, [filters, fetchActivities]);

  const handleFilterChange = (newFilters: Partial<ActivityFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      action_type: "",
      user_id: "",
      date_from: undefined,
      date_to: undefined,
    });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, filters, true);
  };

  const hasMore = activities.length < total;

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Global Activity Log</h1>
        <p className="text-slate-400">A complete, immutable audit trail of all actions across the platform.</p>
      </div>

      <ActivityFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onClearFilters={handleClearFilters} 
      />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
        </div>
      ) : (
        <>
          <ActivityTimelineGlobal activities={activities} />
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 w-full sm:w-auto min-w-[200px]"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
