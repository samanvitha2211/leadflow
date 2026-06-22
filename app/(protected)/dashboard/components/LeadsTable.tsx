"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { getColumns, Lead, UserOption } from "./columns";
import { createClient } from "@/lib/supabase/client";
import { TableFilters, FilterState } from "./TableFilters";
import { Pagination } from "./Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LeadsTable() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [usersList, setUsersList] = useState<UserOption[]>([]);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const limit = 50;
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  // Filtering State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    priority: "",
    category: "",
    source: "",
  });

  // Debounced Search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (sorting.length > 0) {
        params.append("sort_by", sorting[0].id);
        params.append("sort_dir", sorting[0].desc ? "desc" : "asc");
      }

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);
      if (filters.source) params.append("source", filters.source);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await fetch(`/api/leads?${params.toString()}`);
      const result = await response.json();
      
      if (result.data) {
        setData(result.data);
        setTotalItems(result.total);
      }

      // Fetch users list and admin status once
      if (usersList.length === 0) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: currentUser } = await supabase.from('users').select('role').eq('id', user.id).single();
          setIsAdmin(currentUser?.role === 'admin');
        }

        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        if (usersData.users) {
          setUsersList(usersData.users);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sorting, filters.status, filters.priority, filters.category, filters.source, debouncedSearch, usersList.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== "search") setPage(1); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      category: "",
      source: "",
    });
    setPage(1);
  };

  const table = useReactTable({
    data,
    columns: getColumns({ isAdmin, users: usersList, onUpdate: fetchData }),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalItems / limit),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Leads</h2>
          <p className="text-sm text-slate-400">Manage and track your incoming leads</p>
        </div>
      </div>

      <TableFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onClearFilters={handleClearFilters} 
      />

      <div className="rounded-xl border border-white/10 overflow-hidden flex-1 flex flex-col">
        <Table>
          <TableHeader className="bg-black/40 hover:bg-black/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10">
                {headerGroup.headers.map((header) => {
                  const isSortable = ["created_at", "current_priority", "status"].includes(header.column.id);
                  return (
                    <TableHead 
                      key={header.id} 
                      className="text-slate-300 font-semibold"
                    >
                      {header.isPlaceholder ? null : (
                        <div 
                          className={`flex items-center gap-1 ${isSortable ? "cursor-pointer select-none hover:text-white" : ""}`}
                          onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ArrowUp className="w-4 h-4 text-primary ml-1" />,
                            desc: <ArrowDown className="w-4 h-4 text-primary ml-1" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-white/5">
                  {getColumns({ isAdmin, users: usersList, onUpdate: fetchData }).map((col, j) => (
                    <TableCell key={`cell-${i}-${j}`}>
                      <Skeleton className="h-6 w-full bg-white/5" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length ? (
              <AnimatePresence>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }} // Stagger
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getColumns({ isAdmin, users: usersList, onUpdate: fetchData }).length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Inbox className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-white mb-1">No leads found</p>
                    <p className="text-sm mb-4">
                      {Object.values(filters).some(val => val !== "") || debouncedSearch
                        ? "Try adjusting your filters or search term."
                        : "Import your first leads or create one manually to get started."}
                    </p>
                    {Object.values(filters).some(val => val !== "") || debouncedSearch ? (
                      <Button variant="outline" className="border-white/10 text-white" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <div className="flex gap-4">
                        <Link href="/leads/new">
                          <Button variant="outline" className="border-white/10 text-white">Manual Entry</Button>
                        </Link>
                        <Link href="/import">
                          <Button className="btn-primary">Import CSV</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        totalItems={totalItems} 
        limit={limit} 
        onPageChange={setPage} 
      />
    </div>
  );
}
