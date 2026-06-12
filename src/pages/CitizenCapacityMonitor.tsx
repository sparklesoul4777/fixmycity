import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hospital, Car, Droplets, AlertTriangle, CheckCircle2,
    Radio, ChevronRight, Info, Zap, ShieldCheck
} from 'lucide-react';
import { capacityService } from '@/services/capacityService';
import {
    HospitalCapacity, RoadCapacity, WaterZone, CapacityAlert,
    getStatusColor, getProgressColor
} from '@/data/capacityData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CitizenCapacityMonitor() {
    const [hospitals, setHospitals] = useState<HospitalCapacity[]>([]);
    const [roads, setRoads] = useState<RoadCapacity[]>([]);
    const [waterZones, setWaterZones] = useState<WaterZone[]>([]);
    const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
    const [tickerIndex, setTickerIndex] = useState(0);

    useEffect(() => {
        capacityService.seedAll();
        const unsubs = [
            capacityService.subscribeToHospitals(setHospitals),
            capacityService.subscribeToRoads(setRoads),
            capacityService.subscribeToWaterZones(setWaterZones),
            capacityService.subscribeToAlerts(setAlerts),
        ];
        return () => unsubs.forEach(u => u());
    }, []);

    const activeAlerts = alerts.filter(a => a.isActive);

    // Rotate ticker every 4 seconds
    useEffect(() => {
        if (activeAlerts.length === 0) return;
        const timer = setInterval(() => setTickerIndex(i => (i + 1) % activeAlerts.length), 4000);
        return () => clearInterval(timer);
    }, [activeAlerts.length]);

    const criticalRoads = roads.filter(r => r.status === 'critical');
    const highRoads = roads.filter(r => r.status === 'high');

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">

            {/* Banner */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-36 h-36 shrink-0 bg-white/10 rounded-[3rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                        <Radio className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3 text-yellow-300" /> City Infrastructure Status
                        </div>
                        <h1 className="text-4xl font-black tracking-tight uppercase">Live Capacity Monitor</h1>
                        <p className="text-slate-300 font-bold max-w-xl text-base">
                            Real-time utilization data for Chennai's hospitals, roads, water and drainage infrastructure — sourced directly from city monitoring nodes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Ticker */}
            {activeAlerts.length > 0 && (
                <div className="relative overflow-hidden bg-red-600 rounded-2xl h-12 shadow-lg flex items-center">
                    <div className="shrink-0 bg-red-800 h-full px-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest whitespace-nowrap">Live Alerts</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={tickerIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="px-6 text-xs font-bold text-white truncate"
                        >
                            {`[${activeAlerts[tickerIndex]?.severity?.toUpperCase()} · ${activeAlerts[tickerIndex]?.zone}] ${activeAlerts[tickerIndex]?.message}`}
                        </motion.p>
                    </AnimatePresence>
                    <span className="shrink-0 ml-auto pr-4 text-[10px] text-white/60 font-black">{tickerIndex + 1}/{activeAlerts.length}</span>
                </div>
            )}
            {activeAlerts.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm font-bold text-green-700">All city infrastructure is operating within normal limits. No active alerts.</p>
                </div>
            )}

            {/* Road Status */}
            <section>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-5 flex items-center gap-3">
                    <Car className="w-6 h-6 text-primary" /> Road Congestion Status
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {roads.sort((a, b) => b.congestionPct - a.congestionPct).map(road => {
                        const sc = getStatusColor(road.status);
                        return (
                            <motion.div
                                key={road.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-3xl border p-6 shadow-sm ${sc.border}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-black text-slate-900 leading-tight">{road.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{road.zone}</p>
                                    </div>
                                    <Badge className={`${sc.bg} ${sc.text} border-none font-black text-[9px] uppercase`}>{road.status}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                        <span>Congestion</span>
                                        <span className={road.congestionPct > 100 ? 'text-red-600' : ''}>{road.congestionPct}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(road.congestionPct, 100)}%` }}
                                            transition={{ duration: 1 }}
                                            className={`h-full rounded-full ${getProgressColor(road.congestionPct)}`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold">Peak: {road.peakHour}</p>
                                </div>
                                {road.status === 'critical' && (
                                    <div className="mt-3 p-2 bg-red-50 rounded-xl text-[10px] text-red-600 font-black">
                                        ⚠ Avoid this route if possible. Use alternate roads.
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Hospital Availability */}
            <section>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-5 flex items-center gap-3">
                    <Hospital className="w-6 h-6 text-rose-500" /> Hospital Bed Availability
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {hospitals.map(h => {
                        const bedPct = Math.round(h.occupiedBeds / h.totalBeds * 100);
                        const icuPct = Math.round(h.icuOccupied / h.icuTotal * 100);
                        const sc = getStatusColor(h.status);
                        const availBeds = h.totalBeds - h.occupiedBeds;
                        return (
                            <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-3xl border p-8 shadow-sm ${sc.border}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="font-black text-slate-900 text-base">{h.name}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{h.zone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-black ${availBeds < 50 ? 'text-red-600' : availBeds < 200 ? 'text-amber-600' : 'text-green-600'}`}>
                                            {availBeds}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Beds Available</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                        { label: 'Beds', pct: bedPct },
                                        { label: 'ICU', pct: icuPct },
                                        { label: 'ER', pct: h.erLoad },
                                    ].map(m => (
                                        <div key={m.label} className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className={`text-lg font-black ${m.pct >= 90 ? 'text-red-600' : m.pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>{m.pct}%</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">{m.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${bedPct}%` }} transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${getProgressColor(bedPct)}`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Water & Drainage */}
            <section>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-5 flex items-center gap-3">
                    <Droplets className="w-6 h-6 text-blue-500" /> Water Supply & Drainage
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {waterZones.map(w => {
                        const sc = getStatusColor(w.status);
                        return (
                            <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-3xl border p-6 shadow-sm ${sc.border}`}
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <p className="font-black text-slate-900">{w.zone}</p>
                                    <Badge className={`${sc.bg} ${sc.text} border-none font-black text-[9px] uppercase`}>{w.status}</Badge>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Water Supply', pct: w.supplyLoadPct },
                                        { label: 'Drainage Load', pct: w.drainageLoadPct },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1.5">
                                                <span>{m.label}</span>
                                                <span className={m.pct >= 85 ? 'text-red-600' : ''}>{m.pct}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1 }}
                                                    className={`h-full rounded-full ${getProgressColor(m.pct)}`} />
                                            </div>
                                            {m.pct >= 85 && <p className="text-[9px] text-red-500 font-bold mt-1">⚠ Possible supply disruption</p>}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-slate-500">
                    Data is refreshed from the city's monitoring network in real time. Red/orange indicators suggest resource strain — plan your travel and hospital visits accordingly. Raise a complaint via <strong>New Report</strong> if you observe unreported issues.
                </p>
            </div>
        </div>
    );
}
