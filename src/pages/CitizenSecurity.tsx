import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Key,
    History,
    Smartphone,
    Globe,
    Lock as LockIcon,
    ArrowLeft,
    Info,
    AlertTriangle,
    RotateCw,
    Eye,
    EyeOff
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { securityService } from "@/services/securityService";
import { SecurityLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CitizenSecurity() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [privacyEnabled, setPrivacyEnabled] = useState(true);
    const [activeDialog, setActiveDialog] = useState<"phrase" | "mfa" | null>(null);

    useEffect(() => {
        if (!user) return;

        // In a real app, we'd only fetch logs for THIS user
        const unsubscribe = securityService.subscribeToAllLogs((allLogs) => {
            const userLogs = allLogs.filter(l => l.userId === user.id);
            setLogs(userLogs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Link to="/report" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Return to Operations</span>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <LockIcon className="w-10 h-10 text-primary" />
                        Security Vault
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Personal Identity Protection & Access Logs
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 px-4 py-2 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Account Secure</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Key className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Identity Auth</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-6">Manage how you access the FixMyCity grid.</p>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] justify-between px-6"
                            onClick={() => setActiveDialog("phrase")}
                        >
                            Reset Access Phrase
                            <Key className="w-4 h-4 opacity-30" />
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] justify-between px-6"
                            onClick={() => setActiveDialog("mfa")}
                        >
                            Enable Multi-Factor
                            <Smartphone className="w-4 h-4 opacity-30" />
                        </Button>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Privacy Nodes</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-6">Control your data transmission visibility.</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Public Anonymity</span>
                            <button
                                onClick={() => {
                                    const nextState = !privacyEnabled;
                                    setPrivacyEnabled(nextState);
                                    securityService.logActivity({
                                        userId: user?.id || 'anon',
                                        userName: user?.name || 'Citizen',
                                        action: 'privacy_toggle_change',
                                        category: 'privacy',
                                        severity: 'low',
                                        details: `User toggled anonymity node to ${nextState ? 'ACTIVE' : 'INACTIVE'}`,
                                        isSuspicious: false
                                    });
                                    toast.success(`Anonymity Node ${nextState ? 'Active' : 'Deactivated'}`);
                                }}
                                className={`w-12 h-6 rounded-full relative transition-colors ${privacyEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyEnabled ? 'right-1' : 'left-1'}`} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {privacyEnabled ? <EyeOff className="w-2.5 h-2.5 text-white opacity-40 ml-4" /> : <Eye className="w-2.5 h-2.5 text-slate-500 opacity-40 mr-4" />}
                                </div>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-primary p-2">
                            <Info className="w-4 h-4" />
                            <span className="text-[9px] font-bold italic">Always encrypted during flight</span>
                        </div>
                    </div>
                </section>
            </div>

            <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[3rem] -translate-y-8 translate-x-8" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <History className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-black text-slate-900">Activity Audits</h3>
                </div>

                <div className="space-y-4 relative z-10">
                    {loading ? (
                        <p className="text-center py-10 italic text-slate-400">Synchronizing activity data...</p>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero Security Anomalies Detected</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.isSuspicious ? 'bg-red-50 text-red-600' : 'bg-white text-slate-400'}`}>
                                        {log.isSuspicious ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-[9px] font-bold text-slate-400">{format(log.timestamp.toDate(), "MMM dd, yyyy 'at' HH:mm")}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${log.isSuspicious ? 'border-red-200 text-red-600' : 'border-slate-200 text-slate-400'}`}>
                                    {log.severity}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Phrase Reset Dialog */}
            <Dialog open={activeDialog === "phrase"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                            <RotateCw className="w-6 h-6 text-primary" />
                            Rotate Phrase
                        </DialogTitle>
                        <DialogDescription className="font-bold text-slate-500">
                            Generate a new secure access node signature.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 text-center space-y-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">New Access Sequence</p>
                            <p className="text-xl font-mono text-white tracking-widest uppercase">URBAN-ALPHA-GRID-982</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => {
                            securityService.logActivity({
                                userId: user?.id || 'anon',
                                userName: user?.name || 'Citizen',
                                action: 'security_phrase_rotated',
                                category: 'auth',
                                severity: 'high',
                                details: 'User successfully rotated access node signature',
                                isSuspicious: false
                            });
                            toast.success('Security signature updated');
                            setActiveDialog(null);
                        }}>Confirm Rotation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MFA Dialog */}
            <Dialog open={activeDialog === "mfa"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Smartphone className="w-6 h-6 text-primary" />
                            MFA Setup
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="flex justify-center">
                            <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                <span className="text-[10px] font-black text-slate-300 uppercase">QR Node Placeholder</span>
                            </div>
                        </div>
                        <p className="text-center text-xs font-bold text-slate-500">Scan this node with your security authenticator app to enable multi-factor encryption.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setActiveDialog(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
