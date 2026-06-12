import { useState, useEffect } from "react";
import { Shield, MapPin, AlertTriangle, CheckCircle, Activity, Info, ArrowRight, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { infrastructureService } from "@/services/infrastructureService";
import { InfrastructureAsset, AssetHealthStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CitizenInfrastructure() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);

    useEffect(() => {
        const unsubscribe = infrastructureService.subscribeToAllAssets((fetchedAssets) => {
            // In a real app, we would filter by user's locality/area
            // For now, we show core assets to demonstrate the feature
            setAssets(fetchedAssets);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getHealthColor = (status: AssetHealthStatus) => {
        switch (status) {
            case 'Healthy': return 'text-green-600 bg-green-50 border-green-100';
            case 'Under Maintenance': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Needs Inspection': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getHealthDescription = (status: AssetHealthStatus) => {
        switch (status) {
            case 'Healthy': return 'Operational and functioning within normal parameters.';
            case 'Under Maintenance': return 'Scheduled repairs or upgrades are currently in progress.';
            case 'Needs Inspection': return 'Scheduled for review due to recent patterns or reports.';
            case 'Critical': return 'Requires immediate attention to restore safe operation.';
            default: return 'Status currently under review.';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-500/20 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/30 font-black uppercase tracking-widest px-4 py-1">Infrastructure Insight</Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                            Your City, <span className="text-blue-400">Restored</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                            Transparency in transformation. Monitor the health and maintenance status of infrastructure in your community.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Overview */}
                <Card className="lg:col-span-2 border-none shadow-none bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="px-8 pt-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Local Assets</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="font-bold text-xs uppercase tracking-widest text-blue-600"
                                onClick={() => navigate('/map')}
                            >
                                View Map
                            </Button>
                        </div>
                        <CardDescription className="font-medium text-slate-500">Live operational status of infrastructure in your area.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 mt-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Activity className="w-12 h-12 text-slate-200 animate-pulse" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Scanning Network...</p>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-slate-400 font-bold">No localized assets identified in this sector.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assets.map((asset) => (
                                    <div key={asset.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50 hover:border-blue-100">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-3 rounded-xl ${getHealthColor(asset.healthStatus || 'Healthy')} transition-transform group-hover:scale-110`}>
                                                {asset.healthStatus === 'Healthy' ? <CheckCircle className="w-6 h-6" /> :
                                                    asset.healthStatus === 'Critical' ? <AlertTriangle className="w-6 h-6" /> :
                                                        <Activity className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{asset.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.category}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{asset.department}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 sm:mt-0 flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-black text-slate-900">{asset.healthScore}% Health</div>
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${asset.healthStatus === 'Critical' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {asset.healthStatus}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full hover:bg-blue-600 hover:text-white transition-all"
                                                onClick={() => setSelectedAsset(asset)}
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info & Action Panel */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-blue-600 text-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Report Anomaly</CardTitle>
                            <CardDescription className="text-blue-100 font-medium">Notice something wrong with city assets?</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className="text-sm text-blue-50/80 mb-6 leading-relaxed">
                                Your reports directly influence health scores. Pattern detection identifies systemic failures faster when you speak up.
                            </p>
                            <Button
                                className="w-full h-12 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest hover:bg-blue-50 group"
                                onClick={() => navigate('/report')}
                            >
                                File Report <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4">
                                <Info className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900 text-center md:text-left">Understanding Health</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-4">
                            <div className="space-y-4">
                                {(['Healthy', 'Under Maintenance', 'Needs Inspection', 'Critical'] as AssetHealthStatus[]).map((status) => (
                                    <div key={status} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${status === 'Healthy' ? 'bg-green-500' : status === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-900">{status}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                            {getHealthDescription(status)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Asset Detail Dialog */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <Card className="w-full max-w-lg rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <div>
                                <Badge className={`uppercase tracking-tighter text-[9px] font-black px-3 py-1 rounded-lg border ${getHealthColor(selectedAsset.healthStatus || 'Healthy')}`}>
                                    {selectedAsset.healthStatus}
                                </Badge>
                                <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-3">{selectedAsset.name}</CardTitle>
                            </div>
                            <Button variant="ghost" className="rounded-full h-10 w-10 p-0" onClick={() => setSelectedAsset(null)}>
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 pt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Score</p>
                                    <p className="text-2xl font-black text-slate-900">{selectedAsset.healthScore}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Linked Reports</p>
                                    <p className="text-2xl font-black text-slate-900">{selectedAsset.issueCount || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <History className="w-3 h-3" /> Recent Activity
                                </h5>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                    {selectedAsset.maintenanceHistory && selectedAsset.maintenanceHistory.length > 0 ? (
                                        selectedAsset.maintenanceHistory.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{m.description}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.date}</p>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] border-slate-200">Logged</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-center py-6 font-bold text-slate-300 uppercase tracking-[0.2em]">No maintenance logs available</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                                    onClick={() => navigate(`/report?assetId=${selectedAsset.id}`)}
                                >
                                    Report Anomaly
                                </Button>
                                <Button variant="outline" className="h-14 rounded-2xl px-6 font-black uppercase tracking-widest" onClick={() => setSelectedAsset(null)}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
