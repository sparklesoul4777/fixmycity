import { useState, useEffect, useMemo } from "react";
import {
    Cpu,
    Sparkles,
    AlertTriangle,
    ChevronRight,
    Clock,
    Users,
    ShieldCheck,
    ArrowRight,
    Search,
    Filter,
    Layers,
    Activity,
    ArrowUpRight,
    Brain,
    BrainCircuit,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { issueService } from "@/services/issueService";
import { aiService, AIAnalysisResult } from "@/services/aiService";
import { Issue, IssueStatus, STATUS_LABELS } from "@/types";
import { mockOfficers } from "@/data/mockData";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSmartResponse() {
    const { user } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

    // Coordination State
    const [assignedDept, setAssignedDept] = useState("");
    const [assignedOfficer, setAssignedOfficer] = useState("");
    const [deadline, setDeadline] = useState("");

    useEffect(() => {
        const unsubscribe = issueService.subscribeToAllIssues((data) => {
            setIssues(data.sort((a, b) => {
                const dateA = new Date((a.createdAt as any)?.toDate?.() || a.createdAt).getTime();
                const dateB = new Date((b.createdAt as any)?.toDate?.() || b.createdAt).getTime();
                return dateB - dateA;
            }));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const unprioritizedIssues = useMemo(() =>
        issues.filter(i => i.status === 'reported'),
        [issues]);

    const activeCoordinations = useMemo(() =>
        issues.filter(i => i.status === 'acknowledged' || i.status === 'in-progress'),
        [issues]);

    const selectedIssue = useMemo(() =>
        issues.find(i => i.id === selectedIssueId),
        [issues, selectedIssueId]);

    const runAI = async (issue: Issue) => {
        setAnalyzingId(issue.id);
        try {
            const result = await aiService.analyzeIssue(issue.description, issue.category);
            await issueService.updateIssueStatus(
                issue.id,
                'reported',
                'AI Analysis Engine',
                `AI Strategy Applied: ${result.priority} priority recommended.`,
                {
                    priority: result.priority.toLowerCase() as any,
                    aiAnalysis: {
                        suggestedDept: result.suggestedDept,
                        analysis: result.analysis,
                        actionItems: result.actionItems
                    }
                }
            );
            toast.success("AI Strategy Synced for Node " + issue.id);
        } catch (error) {
            toast.error("AI Node Sync Failed");
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleAssign = async () => {
        if (!selectedIssueId || !assignedDept || !assignedOfficer || !deadline) {
            toast.error("Coordination parameters incomplete");
            return;
        }

        try {
            await issueService.assignOfficer(
                selectedIssueId,
                assignedOfficer,
                assignedDept,
                deadline,
                user?.name || "Admin"
            );
            toast.success("Deployment Orders Issued");
            setSelectedIssueId(null);
            setAssignedDept("");
            setAssignedOfficer("");
            setDeadline("");
        } catch (error) {
            toast.error("Deployment Order Failed");
        }
    };

    const handleEscalate = async () => {
        if (!selectedIssueId) return;
        try {
            await issueService.escalateIssue(
                selectedIssueId,
                "AI Priority requires specialized regional intervention.",
                "State Urban Monitoring Cell"
            );
            toast.success("Protocol Escalated to High Command");
            setSelectedIssueId(null);
        } catch (error) {
            toast.error("Escalation failed");
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p?.toLowerCase()) {
            case 'emergency': return 'bg-red-500 text-white border-red-200';
            case 'high': return 'bg-amber-500 text-white border-amber-200';
            case 'medium': return 'bg-blue-500 text-white border-blue-200';
            default: return 'bg-slate-400 text-white border-slate-200';
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Overlay */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Intelligence Node</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-none uppercase">Smart Response</h1>
                        <p className="text-slate-400 font-bold max-w-xl text-lg leading-relaxed">
                            Coordinate urban response assets with AI-driven prioritization and real-time resource allocation.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left Column: AI Inbox */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <BrainCircuit className="w-6 h-6 text-primary" />
                                AI Inbox
                            </h2>
                            <Badge className="bg-slate-100 text-slate-500 border-none font-black">{unprioritizedIssues.length}</Badge>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {unprioritizedIssues.map((issue) => (
                                <motion.div
                                    layout
                                    key={issue.id}
                                    className={`p-5 rounded-[2rem] border transition-all cursor-pointer group hover:bg-slate-50 ${selectedIssueId === issue.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-100'}`}
                                    onClick={() => setSelectedIssueId(issue.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">{issue.category.split(' ')[0]}</Badge>
                                        {issue.aiAnalysis ? (
                                            <Badge className={`text-[8px] font-black uppercase ${getPriorityColor(issue.priority)}`}>
                                                {issue.priority}
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-[8px] font-black uppercase tracking-widest gap-1 hover:bg-primary/10 hover:text-primary transition-all"
                                                onClick={(e) => { e.stopPropagation(); runAI(issue); }}
                                                disabled={analyzingId === issue.id}
                                            >
                                                {analyzingId === issue.id ? 'Analyzing...' : <><Sparkles className="w-2.5 h-2.5" /> Analyze</>}
                                            </Button>
                                        )}
                                    </div>
                                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">{issue.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 line-clamp-1">{issue.description}</p>
                                </motion.div>
                            ))}
                            {unprioritizedIssues.length === 0 && (
                                <div className="py-20 text-center space-y-4 opacity-30">
                                    <CheckCircle2 className="w-12 h-12 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Inbound Signals Clear</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Coordination Control */}
                <div className="lg:col-span-2 space-y-10">
                    <AnimatePresence mode="wait">
                        {selectedIssue ? (
                            <motion.div
                                key="orchestrator"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white rounded-[3rem] border-2 border-primary/20 p-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                                <div className="relative z-10 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Deployment Console</h3>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest italic">Node ID: {selectedIssue.id}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="rounded-full" onClick={() => setSelectedIssueId(null)}>×</Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Signal Details</h5>
                                                <h4 className="text-lg font-black text-slate-900 mb-2">{selectedIssue.title}</h4>
                                                <p className="text-sm font-bold text-slate-500 leading-relaxed">{selectedIssue.description}</p>
                                            </div>

                                            {selectedIssue.aiAnalysis && (
                                                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-2 h-full bg-primary/20" />
                                                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <Cpu className="w-3 h-3" /> AI Strategic Guidance
                                                    </h5>
                                                    <p className="text-sm font-black text-slate-700 leading-relaxed mb-4">{selectedIssue.aiAnalysis.analysis}</p>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recommended Actions</p>
                                                        {selectedIssue.aiAnalysis.actionItems.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                                <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                                                                {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-8 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
                                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Resource Allocation</h5>

                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase">Operational Sector</label>
                                                    <Select value={assignedDept} onValueChange={setAssignedDept}>
                                                        <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                                                            <SelectValue placeholder="Select Sector" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                                                            {['Public Works', 'Sanitation', 'Water Board', 'Electrical Dept', 'Public Safety', 'Traffic Control'].map(d => (
                                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase">Field Officer</label>
                                                    <Select value={assignedOfficer} onValueChange={setAssignedOfficer} disabled={!assignedDept}>
                                                        <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                                                            <SelectValue placeholder="Assign Officer" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                                                            {mockOfficers.filter(o => !assignedDept || o.department.includes(assignedDept)).map(o => (
                                                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase">Resolution Target</label>
                                                    <input
                                                        type="date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full h-14 px-4 rounded-2xl font-bold text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                                        style={{ colorScheme: 'dark' }}
                                                        value={deadline}
                                                        onChange={(e) => setDeadline(e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        variant="outline"
                                                        className="h-16 rounded-[1.5rem] border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-[0.2em]"
                                                        onClick={handleEscalate}
                                                    >
                                                        Escalate
                                                    </Button>
                                                    <Button
                                                        className="h-16 rounded-[1.5rem] bg-primary text-slate-900 font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                        onClick={handleAssign}
                                                    >
                                                        Authorize
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid md:grid-cols-2 gap-8"
                            >
                                <Card className="rounded-[3rem] border-none shadow-sm bg-gradient-to-br from-indigo-500/10 to-transparent">
                                    <CardHeader className="p-10">
                                        <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                                            <Activity className="w-7 h-7" />
                                        </div>
                                        <CardTitle className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">Orchestration Overview</CardTitle>
                                        <CardDescription className="font-bold text-slate-500 mt-2">Active coordinating deployment nodes across all sectors.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-10">
                                        <div className="space-y-4">
                                            {activeCoordinations.slice(0, 3).map(coord => (
                                                <div key={coord.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${coord.priority === 'emergency' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                        <span className="text-xs font-bold text-slate-700">{coord.title}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-[8px] border-slate-200">{STATUS_LABELS[coord.status]}</Badge>
                                                </div>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px]"
                                                onClick={() => window.location.href = '/admin-registry'}
                                            >
                                                View Active Registry
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[3rem] border-none shadow-sm bg-gradient-to-br from-teal-500/10 to-transparent">
                                    <CardHeader className="p-10">
                                        <div className="w-14 h-14 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <CardTitle className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">Priority Protocol</CardTitle>
                                        <CardDescription className="font-bold text-slate-500 mt-2">Policy rules governing strategic asset distribution.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-10">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest p-2">
                                                <span>Rule Instance</span>
                                                <span>Level</span>
                                            </div>
                                            {[
                                                { r: 'Traffic Signal Failure', l: 'High' },
                                                { r: 'Water Contamination', l: 'Emergency' },
                                                { r: 'Hazardous Dumping', l: 'Medium' }
                                            ].map((rule, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                                                    <span className="text-xs font-extrabold text-slate-700">{rule.r}</span>
                                                    <Badge className={getPriorityColor(rule.l)}>{rule.l}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
