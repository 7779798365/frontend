
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Dispute {
  dispute_id: string;
  status: string;
  reason: string;
  reason_label: string;
  amount: number;
  currency: string;
  deadline: string;
  days_left: number | null;
  win_chance: number | null;
  advice: string;
  draft_status: string;
  items: number;
  gaps: number;
  outcome: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const data = await api.getDisputes();
        setDisputes(data.disputes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDisputes();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading disputes...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dispute Inbox</h1>
        <Link
          href="/results"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Performance Dashboard &rarr;
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Deadline</TableHead>
                <TableHead className="text-center">Win Chance</TableHead>
                <TableHead className="text-center">Draft</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No disputes found in the inbox.
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
                  <TableRow key={d.dispute_id}>
                    <TableCell className="font-medium">{d.dispute_id}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "RESOLVED" ? "default" : "outline"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{d.reason_label}</span>
                        <span className="text-xs text-muted-foreground">{d.reason}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {d.amount} {d.currency}
                    </TableCell>
                    <TableCell className="text-center">
                      {d.days_left !== null ? (
                        <Badge variant={d.days_left < 3 ? "destructive" : "secondary"}>
                          {d.days_left} days left
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${d.win_chance && d.win_chance > 60 ? 'text-green-600' : d.win_chance && d.win_chance < 40 ? 'text-red-600' : ''}`}>
                          {d.win_chance !== null ? `${d.win_chance}%` : "-"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {d.advice || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={d.draft_status === "approved" || d.draft_status === "submitted" ? "default" : "outline"}>
                        {d.draft_status || "no draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/disputes/${d.dispute_id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Manage Case &rarr;
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
