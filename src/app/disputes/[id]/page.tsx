"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { AlertTriangle, CheckCircle2, XCircle, Save, Send, ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export default function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSentences, setEditingSentences] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  async function fetchCase() {
    setLoading(true);
    try {
      const data = await api.getCase(id);
      setCaseData(data);
      if (data.draft && data.draft.sentences) {
        setEditingSentences([...data.draft.sentences]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await api.editDraft(id, {
        sentences: editingSentences,
        edited_by: "merchant@example.com",
      });
      await fetchCase();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApprove() {
    setIsApproving(true);
    try {
      await api.approveDraft(id, { approved_by: "merchant@example.com" });
      await fetchCase();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsApproving(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await api.submitDispute(id, { submitted_by: "merchant@example.com" });
      await fetchCase();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading case details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!caseData) return <div className="p-8 text-center">Case not found.</div>;

  const { pack, score, draft, safety, submission } = caseData;
  const isApproved = draft?.status === "approved";
  const isSubmitted = draft?.status === "submitted";

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/disputes"
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Case {id}</h1>
            <p className="text-muted-foreground">Manage evidence, score, and draft reply</p>
          </div>
        </div>
        <div className="flex gap-3">
          {!isSubmitted && !isApproved && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Draft</>}
            </Button>
          )}
          {!isSubmitted && (
            <Button
              variant={isApproved ? "default" : "outline"}
              onClick={handleApprove}
              disabled={isApproving || isSubmitted}
            >
              {isApproving ? "Approving..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>}
            </Button>
          )}
          {isApproved && !isSubmitted && (
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit to PayPal</>}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="draft" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draft">AI Draft</TabsTrigger>
              <TabsTrigger value="evidence">Evidence Pack</TabsTrigger>
              <TabsTrigger value="safety">Safety Report</TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Draft Reply
                  </CardTitle>
                  <CardDescription>
                    Review and edit the AI-generated reply. Each sentence is backed by evidence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSubmitted ? (
                    <div className="p-4 bg-zinc-50 rounded-lg border italic text-muted-foreground">
                      This draft has been submitted to PayPal and can no longer be edited.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editingSentences.map((s, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border bg-white hover:border-blue-200 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <Input
                              value={s.text}
                              onChange={(e) => {
                                const newSents = [...editingSentences];
                                newSents[i].text = e.target.value;
                                setEditingSentences(newSents);
                              }}
                              className="flex-1 text-base py-2"
                              disabled={isSubmitted}
                            />
                            <div className="flex gap-1">
                              {s.citations?.map((cit: string) => (
                                <Badge key={cit} variant="secondary" className="text-[10px]">
                                  {cit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Evidence Pack
                  </CardTitle>
                  <CardDescription>All verified information collected for this case.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {pack?.items?.map((item: any) => (
                        <div key={item.id} className="p-4 rounded-lg border bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="font-mono">ID: {item.id}</Badge>
                            <span className="text-xs font-semibold uppercase text-muted-foreground">{item.kind}</span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap font-mono bg-zinc-50 p-2 rounded border">
                            {JSON.stringify(item.data, null, 2)}
                          </div>
                        </div>
                      ))}
                      {pack?.gaps?.map((gap: string) => (
                        <div key={gap} className="p-4 rounded-lg border border-red-100 bg-red-50/50">
                          <div className="flex items-center gap-2 text-red-700 mb-1">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Missing Proof</span>
                          </div>
                          <div className="text-sm text-red-600">{gap}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Safety Report
                  </CardTitle>
                  <CardDescription>Hallucination check results for the current draft.</CardDescription>
                </CardHeader>
                <CardContent>
                  {safety?.status === "PASS" ? (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Draft is Safe</AlertTitle>
                      <AlertDescription>
                        All citations and values were verified against the evidence pack.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Safety Violations Found</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap font-mono text-xs mt-2">
                        {safety?.report || "No report available."}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <span className={`text-5xl font-bold ${score?.win_chance && score.win_chance > 60 ? 'text-green-600' : score?.win_chance && score.win_chance < 40 ? 'text-red-600' : 'text-zinc-600'}`}>
                  {score?.win_chance !== null ? `${score.win_chance}%` : "N/A"}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Win Probability
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 border text-sm font-medium text-center">
                {score?.advice || "No advice available."}
              </div>
              <div className="space-y-2">
                {score?.factors?.map((f: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs border-b pb-1">
                    <span className="text-muted-foreground">{f.factor}</span>
                    <span className="font-mono font-bold">{f.impact > 0 ? `+${f.impact}%` : `${f.impact}%`}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {submission && (
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900 text-sm">Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-blue-800">
                  Submitted by <span className="font-bold">{submission.submitted_by}</span> on {new Date(submission.submitted_at || submission.timestamp || Date.now()).toLocaleString()}
                </div>
                <div className="mt-2 p-2 bg-white rounded border border-blue-200 text-[10px] font-mono truncate">
                  PayPal Response: {JSON.stringify(submission.response)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
