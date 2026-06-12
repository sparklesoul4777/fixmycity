import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hospital, Car, Droplets, AlertTriangle, CheckCircle2, Activity,
    TrendingUp, Shield, Radio, RefreshCw, X, ChevronRight, BarChart3
} from 'lucide-react';
import { capacityService } from '@/services/capacityService';
import { issueService } from '@/services/issueService';
import {
    HospitalCapacity, RoadCapacity, WaterZone, CapacityAlert,
    getStatusColor, getProgressColor
} from '@/data/capacityData';
import { Issue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCapacityMonitor() {
    const [hospitals, setHospitals] = useState<HospitalCapacity[]>([]);
    const [roads, setRoads] = useState<RoadCapacity[]>([]);
    const [waterZones, setWaterZones] = useState<WaterZone[]>([]);
    const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [tab, setTab] = useState<'overview' | 'roads' | 'hospitals' | 'water'>('overview');
    const [seeding, setSeeding] = useState(true);

    useEffect(() => {
        capacityService.seedAll().finally(() => setSeeding(false));

        const unsubs = [
            capacityService.subscribeToHospitals(setHospitals),
            capacityService.subscribeToRoads(setRoads),
            capacityService.subscribeToWaterZones(setWaterZones),
            capacityService.subscribeToAlerts(setAlerts),
            issueService.subscribeToAllIssues(data => {
                setIssues(data);
                capacityService.deriveComplaintAlerts(data);
            }),
        ];
        return () => unsubs.forEach(u => u());
    }, []);

    const kpis = useMemo(() => ({
        totalAssets: hospitals.length + roads.length + waterZones.length,
        criticalZones: [
            ...hospitals.filter(h => h.status === 'critical'),
            ...roads.filter(r => r.status === 'critical'),
            ...waterZones.filter(w => w.status === 'critical'),
        ].length,
        activeAlerts: alerts.filter(a => a.isActive).length,
        overloadedHospitals: hospitals.filter(h => h.occupiedBeds / h.totalBeds > 0.9).length,
    }), [hospitals, roads, waterZones, alerts]);

    const handleBroadcast = async () => {
        await capacityService.broadcastAlert({
            type: 'traffic',
            severity: 'warning',
            zone: 'City-wide',
            message: 'Admin advisory: Increased monitoring active across all zones. Expect delays.',
            source: 'sensor',
            isActive: true,
            timestamp: new Date().toISOString(),
        });
        toast.success('Alert broadcast to citizen portal');
    };

    if (seeding) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-500">Initializing Capacity Systems…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Capacity Monitor</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                        Live Infrastructure Utilization — Chennai
                    </p>
                </div>
                <Button
                    onClick={handleBroadcast}
                    className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs h-12 px-6 rounded-2xl shadow-lg shadow-red-600/30"
                >
                    <Radio className="w-4 h-4 mr-2" />
                    Broadcast Alert
                </Button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Assets', value: kpis.totalAssets, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Critical Zones', value: kpis.criticalZones, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Active Alerts', value: kpis.activeAlerts, icon: Radio, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Hospitals Near Capacity', value: kpis.overloadedHospitals, icon: Hospital, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((kpi) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
                    >
                        <div className={`p-3 rounded-2xl ${kpi.bg} w-fit mb-4`}>
                            <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                        </div>
                        <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Nav Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                {([
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'roads', label: 'Roads', icon: Car },
                    { id: 'hospitals', label: 'Hospitals', icon: Hospital },
                    { id: 'water', label: 'Water & Drainage', icon: Droplets },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-8">
                        {/* Alert Feed */}
                        <Card className="rounded-3xl border-slate-100 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Live Alert Feed
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                                {alerts.filter(a => a.isActive).length === 0 && (
                                    <div className="text-center py-10 text-slate-400">
                                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                                        <p className="text-xs font-black uppercase tracking-widest">All Clear — No Active Alerts</p>
                                    </div>
                                )}
                                {alerts.filter(a => a.isActive).map(alert => {
                                    const sev = alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700';
                                    return (
                                        <div key={alert.id} className={`p-4 rounded-2xl border ${sev} flex justify-between gap-3`}>
                                            <div>
                                                <p className="text-xs font-black uppercase">{alert.zone} — {alert.type}</p>
                                                <p className="text-[11px] font-bold mt-1 opacity-80">{alert.message}</p>
                                                <p className="text-[10px] font-bold opacity-50 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => capacityService.dismissAlert(alert.id)} className="shrink-0 hover:bg-white/60 rounded-xl p-1 transition">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Status Summary */}
                        <div className="space-y-4">
                            <Card className="rounded-3xl border-slate-100 shadow-sm">
                                <CardHeader className="pb-2"><CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><Car className="w-5 h-5 text-primary" /> Road Congestion Summary</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {roads.sort((a, b) => b.congestionPct - a.congestionPct).slice(0, 4).map(road => {
                                        const sc = getStatusColor(road.status);
                                        return (
                                            <div key={road.id} className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-800 truncate">{road.name}</p>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full rounded-full ${getProgressColor(road.congestionPct)}`} style={{ width: `${Math.min(road.congestionPct, 100)}%` }} />
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{road.congestionPct}%</span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-slate-100 shadow-sm">
                                <CardHeader className="pb-2"><CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><Hospital className="w-5 h-5 text-rose-500" /> Hospital Bed Utilization</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {hospitals.map(h => {
                                        const pct = Math.round(h.occupiedBeds / h.totalBeds * 100);
                                        return (
                                            <div key={h.id} className="flex items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-800 truncate">{h.name}</p>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full rounded-full ${getProgressColor(pct)}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600">{h.occupiedBeds}/{h.totalBeds}</span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {tab === 'roads' && (
                    <motion.div key="roads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Road Congestion Registry ({roads.length})</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {roads.sort((a, b) => b.congestionPct - a.congestionPct).map(road => {
                                    const sc = getStatusColor(road.status);
                                    return (
                                        <div key={road.id} className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                                                    <p className="font-black text-slate-900">{road.name}</p>
                                                    <Badge className={`text-[9px] font-black uppercase ${sc.bg} ${sc.text} border-none`}>{road.status}</Badge>
                                                </div>
                                                <p className="text-xs font-bold text-slate-400">{road.zone} • Peak: {road.peakHour}</p>
                                                <div className="mt-3 h-2 w-full max-w-md bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(road.congestionPct, 100)}%` }}
                                                        transition={{ duration: 1 }}
                                                        className={`h-full rounded-full ${getProgressColor(road.congestionPct)}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <p className="text-3xl font-black text-slate-900">{road.congestionPct}<span className="text-sm text-slate-400">%</span></p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">{road.vehicleCount.toLocaleString()} / {road.maxCapacity.toLocaleString()} vehicles</p>
                                                <div className="flex gap-2">
                                                    {(['optimal', 'moderate', 'high', 'critical'] as const).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={async () => { await capacityService.updateRoadStatus(road.id, s); toast.success(`${road.name} marked as ${s}`); }}
                                                            className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg transition-all ${road.status === s ? `${getStatusColor(s).bg} ${getStatusColor(s).text}` : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                        >{s}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 'hospitals' && (
                    <motion.div key="hospitals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid md:grid-cols-2 gap-6">
                            {hospitals.map(h => {
                                const bedPct = Math.round(h.occupiedBeds / h.totalBeds * 100);
                                const icuPct = Math.round(h.icuOccupied / h.icuTotal * 100);
                                const sc = getStatusColor(h.status);
                                return (
                                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-3xl border shadow-sm p-8 ${sc.border}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="font-black text-slate-900 text-lg">{h.name}</p>
                                                <p className="text-xs font-bold text-slate-400 mt-1">{h.zone}</p>
                                            </div>
                                            <Badge className={`${sc.bg} ${sc.text} border-none font-black text-[10px] uppercase`}>{h.status}</Badge>
                                        </div>
                                        <div className="space-y-5">
                                            {[
                                                { label: 'General Beds', val: h.occupiedBeds, total: h.totalBeds, pct: bedPct },
                                                { label: 'ICU Beds', val: h.icuOccupied, total: h.icuTotal, pct: icuPct },
                                                { label: 'ER Load', val: h.erLoad, total: 100, pct: h.erLoad },
                                            ].map(metric => (
                                                <div key={metric.label}>
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1.5">
                                                        <span>{metric.label}</span>
                                                        <span>{metric.label === 'ER Load' ? `${metric.pct}%` : `${metric.val}/${metric.total}`}</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${metric.pct}%` }}
                                                            transition={{ duration: 1 }}
                                                            className={`h-full rounded-full ${getProgressColor(metric.pct)}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {tab === 'water' && (
                    <motion.div key="water" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {waterZones.map(w => {
                                const sc = getStatusColor(w.status);
                                return (
                                    <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-3xl border shadow-sm p-8 ${sc.border}`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <p className="font-black text-slate-900">{w.zone}</p>
                                            <Badge className={`${sc.bg} ${sc.text} border-none font-black text-[10px] uppercase`}>{w.status}</Badge>
                                        </div>
                                        <div className="space-y-5">
                                            {[
                                                { label: 'Water Supply Load', pct: w.supplyLoadPct },
                                                { label: 'Drainage Capacity', pct: w.drainageLoadPct },
                                            ].map(m => (
                                                <div key={m.label}>
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1.5">
                                                        <span>{m.label}</span>
                                                        <span className={m.pct >= 85 ? 'text-red-600' : ''}>{m.pct}%</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${m.pct}%` }}
                                                            transition={{ duration: 1 }}
                                                            className={`h-full rounded-full ${getProgressColor(m.pct)}`}
                                                        />
                                                    </div>
                                                    {m.pct >= 85 && <p className="text-[9px] text-red-500 font-bold mt-1">⚠ Overflow risk</p>}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold mt-4">Updated {new Date(w.lastUpdated).toLocaleTimeString()}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
