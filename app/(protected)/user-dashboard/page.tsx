"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { UserContactForm } from "./components/UserContactForm";

interface UserLead {
  id: string;
  name: string;
  source: string;
  created_at: string;
  status: string;
  raw_text: string;
  suggested_reply?: string | null;
}

export default function UserDashboard() {
  const [data, setData] = useState<UserLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads`);
      const result = await response.json();
      
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Under Review</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-amber-500/10 text-amber-400 border-amber-500/20">In Progress</Badge>;
      case "closed":
        return <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Inquiries</h1>
          <p className="text-slate-400 mt-1">Submit new requests and track their status below</p>
        </div>
      </div>

      <UserContactForm onSuccess={fetchData} />

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[500px]">
        <Table>
          <TableHeader className="bg-black/40 hover:bg-black/40">
            <TableRow className="border-white/10">
              <TableHead className="text-slate-300 font-semibold w-[20%]">Date Submitted</TableHead>
              <TableHead className="text-slate-300 font-semibold w-[40%]">Message Preview</TableHead>
              <TableHead className="text-slate-300 font-semibold w-[20%]">Status</TableHead>
              <TableHead className="text-slate-300 font-semibold text-right w-[20%]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-white/5">
                  <TableCell><Skeleton className="h-6 w-24 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-full bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-white/5" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 bg-white/5 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              <AnimatePresence>
                {data.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="py-4 text-slate-300">
                      {format(new Date(lead.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="py-4 text-slate-300">
                      <div className="truncate max-w-[300px] md:max-w-[400px]">
                        {lead.raw_text}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <Link href={`/user-dashboard/${lead.id}`}>
                        <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Inbox className="w-12 h-12 mb-4 opacity-50 text-cyan-400" />
                    <p className="text-lg font-medium text-white mb-1">No inquiries yet</p>
                    <p className="text-sm mb-4">Submit a request using the form above to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
