import { useState, useEffect } from "react";
import {
    ShieldAlert,
    ShieldCheck,
    Activity,
    UserX,
    Globe,
    AlertTriangle,
    ChevronRight,
    Search,
    Filter,
    Lock as LockIcon
} from "lucide-react";
import { securityService } from "@/services/securityService";
import { SecurityLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminSecurity() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "suspicious">("suspicious");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        if (filter === "suspicious") {
            unsubscribe = securityService.subscribeToSuspiciousActivity((data) => {
                setLogs(data);
                setLoading(false);
            });
        } else {
            unsubscribe = securityService.subscribeToAllLogs((data) => {
                setLogs(data);
                setLoading(false);
            });
        }

        return () => unsubscribe && unsubscribe();
    }, [filter]);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const OFFICIAL_AUTHORITY = 'sujith';

    const isSujith = (log: SecurityLog) =>
        (log.userName || '').toLowerCase().trim() === OFFICIAL_AUTHORITY;

    const getSeverityColor = (log: SecurityLog) => {
        if (isSujith(log)) return 'bg-green-600 text-white';
        switch (log.severity) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-green-600 text-white';
            default: return 'bg-slate-200 text-slate-700';
        }
    };

    const getRiskNodeLabel = (log: SecurityLog): string => {
        if (isSujith(log)) return 'Low Risk \u2014 Legal Admin';
        if (log.severity === 'medium') return 'Moderate Risk';
        if (log.severity === 'high') return 'High Risk';
        if (log.severity === 'critical') return 'Critical';
        return String(log.severity).toUpperCase();
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <LockIcon className="w-10 h-10 text-primary" />
                        Security Sentinel
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Real-time Threat Intelligence & Access Monitoring
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setFilter("suspicious")}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "suspicious" ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Suspicious
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "all" ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Logs
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Active Alerts</p>
                        <p className="text-3xl font-black text-red-900">{logs.filter(l => l.isSuspicious).length}</p>
                    </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Global Signals</p>
                        <p className="text-3xl font-black text-indigo-900">{logs.length}+</p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] flex items-center gap-5 shadow-inner">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Integrity</p>
                        <p className="text-1xl font-black text-slate-900 uppercase">Verifying...</p>
                    </div>
                </div>
            </div>

            {/* Operations Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by node, identity or operation..."
                            className="pl-12 h-14 bg-white border-slate-200 rounded-2xl font-bold placeholder:text-slate-300 focus:ring-primary/10 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            variant="destructive"
                            className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest gap-2 shadow-lg shadow-red-100"
                            onClick={() => {
                                securityService.logActivity({
                                    userId: user?.id || 'anon',
                                    userName: user?.name || 'System',
                                    action: 'simulated_threat_detection',
                                    category: 'system',
                                    severity: 'critical',
                                    details: 'Manual security protocol simulation initiated by administrator',
                                    isSuspicious: true
                                });
                                toast.error('Security Threat Simulated');
                            }}
                        >
                            <ShieldAlert className="w-4 h-4" /> Simulate Threat
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 rounded-2xl px-8 font-black uppercase tracking-widest gap-2 bg-white border-slate-200"
                            onClick={() => {
                                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
                                const downloadAnchorNode = document.createElement('a');
                                downloadAnchorNode.setAttribute("href", dataStr);
                                downloadAnchorNode.setAttribute("download", `security_audit_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
                                document.body.appendChild(downloadAnchorNode);
                                downloadAnchorNode.click();
                                downloadAnchorNode.remove();
                                toast.success('Audit Log exported successfully');
                            }}
                        >
                            <Filter className="w-4 h-4" /> Export Audit
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Operation</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Node</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Context</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-50">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4 animate-pulse">
                                            <LockIcon className="w-12 h-12 text-slate-200" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Synchronizing with Security Grid...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 opacity-40">
                                        <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Zero Security Anomalies Detected</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <TableCell className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-900">
                                                {log.timestamp ? format(log.timestamp.toDate(), "HH:mm:ss") : "--:--:--"}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {log.timestamp ? format(log.timestamp.toDate(), "MMM dd, yyyy") : "N/A"}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:scale-110 transition-all">
                                                    <Activity className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{log.userName || "System Process"}</p>
                                                    <p className="text-[10px] font-bold text-primary italic">ID: {log.userId?.slice(0, 8) || "ANON"}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] font-medium text-slate-400 max-w-xs truncate">{log.details}</p>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge className={`tracking-tighter font-black text-[9px] px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-1.5 w-fit ${getSeverityColor(log)}`}>
                                                {isSujith(log) && <ShieldCheck className="w-3 h-3 shrink-0" />}
                                                {getRiskNodeLabel(log)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <Button
                                                variant="ghost"
                                                className="h-10 w-10 p-0 rounded-xl text-slate-300 group-hover:text-primary hover:bg-white hover:shadow-md transition-all"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-primary" />
                            Security Detail
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                                    <Badge className={`uppercase tracking-tighter font-black text-[9px] px-3 py-1 rounded-lg ${getSeverityColor(selectedLog.severity)}`}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signal Type</p>
                                    <p className="text-xs font-black text-slate-900 uppercase">{selectedLog.action.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Analysis Logs</label>
                                <div className="p-4 rounded-2xl bg-slate-900 text-green-400 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner">
                                    <p className="opacity-50 mb-2">// BEGIN SECURITY TRACE</p>
                                    <p>TIMESTAMP: {selectedLog.timestamp?.toDate().toISOString() || 'N/A'}</p>
                                    <p>ID_NODE: {selectedLog.userId}</p>
                                    <p>IDENTITY: {selectedLog.userName}</p>
                                    <p>CONTEXT: {selectedLog.details}</p>
                                    <p className="opacity-50 mt-2">// END SECURITY TRACE</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setSelectedLog(null)}>Dismiss</Button>
                                <Button className="h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => toast.info('Protocol Escalated to High Command')}>Escalate</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
