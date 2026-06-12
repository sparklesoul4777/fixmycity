import { useState, useEffect, useMemo, useRef } from "react";
import {
    Brain,
    Sparkles,
    ArrowRight,
    MessageSquare,
    Zap,
    History,
    Search,
    Lightbulb,
    Info,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { issueService } from "@/services/issueService";
import { aiService } from "@/services/aiService";
import { useAuth } from "@/contexts/AuthContext";
import { Issue, STATUS_LABELS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Priority helpers
const PRIORITY_ORDER: Record<string, number> = { emergency: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_COLORS: Record<string, string> = {
    emergency: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-amber-400 text-slate-900',
    low: 'bg-green-400 text-slate-900',
};
const PRIORITY_DOT: Record<string, string> = {
    emergency: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-400',
    low: 'bg-green-400',
};
const PRIORITY_WEIGHTS: Record<string, number> = { emergency: 4, high: 3, medium: 2, low: 1 };

// Normalize AI service's "High" → "high" for consistent storage/display
const normalizePriority = (p: string | undefined): string => (p ?? 'medium').toLowerCase();

export default function CitizenSmartResponse() {
    const { user } = useAuth();
    const [myIssues, setMyIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
    const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
    // Track which IDs we have already queued for analysis in this session
    const queuedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        const unsubscribe = issueService.subscribeToUserIssues(user.id, async (data) => {
            // Sort by priority first, then by date within each priority group
            const sorted = [...data].sort((a, b) => {
                const pa = PRIORITY_ORDER[normalizePriority(a.priority)] ?? 3;
                const pb = PRIORITY_ORDER[normalizePriority(b.priority)] ?? 3;
                if (pa !== pb) return pa - pb;
                const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
                const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
                return dateB - dateA;
            });
            setMyIssues(sorted);
            setLoading(false);

            // Auto-backfill AI analysis for legacy issues that don't have it yet
            const needsAnalysis = sorted.filter(i => !i.aiAnalysis && !queuedRef.current.has(i.id));
            if (needsAnalysis.length === 0) return;

            for (const issue of needsAnalysis) {
                queuedRef.current.add(issue.id);
                setAnalyzingIds(prev => new Set(prev).add(issue.id));

                try {
                    const result = await aiService.analyzeIssue(issue.description, issue.category);
                    const normalizedPriority = normalizePriority(result.priority);
                    // Persist analysis back to Firestore
                    await updateDoc(doc(db, 'issues', issue.id), {
                        aiAnalysis: result,
                        priority: normalizedPriority,
                    });
                } catch (err) {
                    console.error(`AI Backfill failed for issue ${issue.id}:`, err);
                } finally {
                    setAnalyzingIds(prev => {
                        const next = new Set(prev);
                        next.delete(issue.id);
                        return next;
                    });
                }
            }
        });
        return () => unsubscribe();
    }, [user]);

    const activeIssue = useMemo(() =>
        myIssues.find(i => i.id === selectedMsgId) || myIssues[0],
        [myIssues, selectedMsgId]);

    const stats = useMemo(() => {
        const total = myIssues.length;
        const resolved = myIssues.filter(i => i.status === 'resolved').length;
        let weightedResolved = 0;
        let weightedTotal = 0;
        myIssues.forEach(i => {
            const w = PRIORITY_WEIGHTS[normalizePriority(i.priority)] ?? 1;
            weightedTotal += w;
            if (i.status === 'resolved') weightedResolved += w;
        });
        const health = weightedTotal > 0 ? Math.round((weightedResolved / weightedTotal) * 100) : 0;
        const aiCoverage = total > 0 ? Math.round((myIssues.filter(i => i.aiAnalysis).length / total) * 100) : 0;
        return { total, resolved, health, aiCoverage };
    }, [myIssues]);

    const scoreColor = stats.health >= 70 ? 'text-green-600' : stats.health >= 40 ? 'text-amber-500' : stats.total > 0 ? 'text-red-500' : 'text-indigo-600';
    const signalLabel = stats.health >= 70 ? '🟢 Strong' : stats.health >= 40 ? '🟡 Moderate' : stats.total > 0 ? '🔴 Low' : 'N/A';

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* AI Assistant Banner */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-indigo-600 p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-40 h-40 shrink-0 bg-white/10 rounded-[3rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent rounded-[3rem] animate-pulse" />
                        <Brain className="w-20 h-20 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            AI Urban Assistant
                            {analyzingIds.size > 0 && (
                                <span className="flex items-center gap-1 ml-2 text-yellow-200">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Analyzing {analyzingIds.size} issues…
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-loose uppercase">Civic Intelligence</h1>
                        <p className="text-indigo-100 font-bold max-w-2xl text-lg leading-relaxed opacity-80">
                            Your issues are analyzed by Gemini AI to ensure optimal prioritization and department routing. Track the "Why" behind the resolution.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Insights Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="rounded-[3rem] border-none shadow-xl bg-white p-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                Impact Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-4">
                                <span className={`text-7xl font-black ${scoreColor}`}>{stats.health}</span>
                                <span className="text-xl font-bold text-slate-400">/100</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Priority-Weighted Resolution</p>
                                <p className="text-[9px] text-slate-400 mt-1">{stats.resolved}/{stats.total} issues resolved</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Resolution Signal</span>
                                    <span>{signalLabel}</span>
                                </div>
                                <Progress value={stats.health} className="h-4 rounded-full bg-slate-100" />
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 pt-2">
                                    <span>AI Coverage</span>
                                    <span>{stats.aiCoverage}%</span>
                                </div>
                                <Progress value={stats.aiCoverage} className="h-2 rounded-full bg-slate-100" />
                                {analyzingIds.size > 0 && (
                                    <p className="text-[9px] text-indigo-500 font-bold flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        AI is analyzing {analyzingIds.size} legacy issue{analyzingIds.size > 1 ? 's' : ''}…
                                    </p>
                                )}
                            </div>
                            <div className="space-y-4 pt-2">
                                <Button
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => toast.success("Priority Audit Request Logged. Verification node active.")}
                                >
                                    Apply for High-Priority Audit
                                </Button>
                                <p className="text-[10px] text-center font-bold text-slate-400">Escalate cases with immediate community impact.</p>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-12 rounded-xl group border-slate-100 hover:border-indigo-200"
                                    onClick={() => toast.info("Opening Urban FAQ Node...")}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Resource Coordination FAQ</span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[3rem] border-none shadow-xl bg-slate-900 text-white p-4">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Lightbulb className="w-6 h-6 text-primary" />
                                Reporting Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "Use clear photos for faster AI analysis",
                                "Specify the impact (e.g. 'Safety risk')",
                                "Link issues to nearby infrastructure"
                            ].map((tip, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    <p className="text-xs font-bold text-slate-300">{tip}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* AI Status Sync Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-indigo-500" />
                                AI Status Sync
                            </h3>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="rounded-full px-4 border-slate-200 text-slate-500 font-black">{myIssues.length} Reports</Badge>
                                {analyzingIds.size > 0 && (
                                    <Badge className="rounded-full px-4 bg-indigo-100 text-indigo-600 font-black border-none">
                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        Analyzing…
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex">
                            {/* Issue List — sorted by priority */}
                            <div className="w-1/3 border-r border-slate-100 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                                {myIssues.length === 0 && !loading && (
                                    <div className="py-20 text-center space-y-4 opacity-30">
                                        <History className="w-10 h-10 mx-auto" />
                                        <p className="text-[8px] font-black uppercase tracking-widest leading-loose">No Transmission Data Found</p>
                                    </div>
                                )}
                                {myIssues.map((i, idx) => {
                                    const np = normalizePriority(i.priority);
                                    const isAnalyzing = analyzingIds.has(i.id);
                                    return (
                                        <button
                                            key={i.id}
                                            onClick={() => setSelectedMsgId(i.id)}
                                            className={`w-full text-left p-5 rounded-[2rem] transition-all relative group ${activeIssue?.id === i.id ? 'bg-white shadow-lg border-2 border-primary/20 ring-4 ring-primary/5' : 'hover:bg-white/60 border border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    {isAnalyzing ? (
                                                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                                    ) : (
                                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY_DOT[np] ?? 'bg-slate-300'}`} />
                                                    )}
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${PRIORITY_COLORS[np] ?? 'bg-slate-100 text-slate-500'}`}>
                                                        {np}
                                                    </span>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${i.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                                            </div>
                                            <h5 className="font-extrabold text-xs text-slate-800 line-clamp-1">{i.title}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                                                #{idx + 1} · {new Date((i.createdAt as any)?.toDate?.() || i.createdAt).toLocaleDateString()}
                                            </p>
                                            {isAnalyzing && (
                                                <p className="text-[9px] text-indigo-400 font-bold mt-1">AI analyzing…</p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Detail / Conversation */}
                            <div className="flex-1 overflow-y-auto p-10 bg-white">
                                <AnimatePresence mode="wait">
                                    {activeIssue ? (
                                        <motion.div
                                            key={activeIssue.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-10"
                                        >
                                            <div className="space-y-4">
                                                {/* Priority badge — always shows a value */}
                                                <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${PRIORITY_COLORS[normalizePriority(activeIssue.priority)] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    Priority: {normalizePriority(activeIssue.priority)}
                                                </span>
                                                <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{activeIssue.title}</h2>
                                                <div className="flex gap-4">
                                                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">{STATUS_LABELS[activeIssue.status]}</Badge>
                                                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">{activeIssue.category}</Badge>
                                                </div>
                                            </div>

                                            {analyzingIds.has(activeIssue.id) ? (
                                                <div className="p-12 text-center space-y-6 bg-indigo-50 rounded-[3rem] border border-dashed border-indigo-200">
                                                    <Loader2 className="w-16 h-16 text-indigo-400 mx-auto animate-spin" />
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Gemini AI Analyzing…</p>
                                                        <p className="text-xs font-bold text-indigo-400 max-w-xs mx-auto">Processing your report to determine priority and route to the right department.</p>
                                                    </div>
                                                </div>
                                            ) : activeIssue.aiAnalysis ? (
                                                <div className="space-y-8">
                                                    <div className="p-8 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100 relative overflow-hidden">
                                                        <Sparkles className="absolute top-6 right-6 w-12 h-12 text-indigo-200/50" />
                                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                                            <Brain className="w-4 h-4" /> AI Strategic Insights
                                                        </h4>
                                                        <p className="text-base font-bold text-slate-700 leading-relaxed mb-8 italic">
                                                            "{activeIssue.aiAnalysis.analysis}"
                                                        </p>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Routed to Sector</p>
                                                                <p className="text-sm font-black text-indigo-600">{activeIssue.aiAnalysis.suggestedDept}</p>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100/50">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Priority</p>
                                                                <p className={`text-sm font-black uppercase ${PRIORITY_COLORS[normalizePriority(activeIssue.priority)]?.includes('red') ? 'text-red-600' : 'text-amber-600'}`}>
                                                                    {normalizePriority(activeIssue.priority)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {activeIssue.aiAnalysis.actionItems?.length > 0 && (
                                                            <div className="mt-6 space-y-2">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Action Items</p>
                                                                {activeIssue.aiAnalysis.actionItems.map((item: string, i: number) => (
                                                                    <div key={i} className="flex items-start gap-2">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                                                        <p className="text-xs font-bold text-slate-600">{item}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                            <Info className="w-4 h-4" /> Why this priority?
                                                        </h4>
                                                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                                            Gemini AI evaluated your report against city-wide safety standards. Since this issue involves {activeIssue.category.toLowerCase()}, it was flagged as <strong>{normalizePriority(activeIssue.priority)}</strong> priority so that {activeIssue.aiAnalysis.suggestedDept} can allocate resources efficiently.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                                    <Brain className="w-16 h-16 text-slate-200 mx-auto" />
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Analysis Yet</p>
                                                        <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">AI analysis will run automatically. Please check back shortly.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 text-center py-40">
                                            <Search className="w-16 h-16" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">Select a report to sync insights</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
