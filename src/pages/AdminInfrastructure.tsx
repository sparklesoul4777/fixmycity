import { useState, useEffect } from "react";
import { Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle, Activity, ShieldAlert, BarChart3, PieChart, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { infrastructureService } from "@/services/infrastructureService";
import { InfrastructureAsset, IssueCategory, CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminInfrastructure() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalAssets: 0,
        criticalAssets: 0,
        needsInspection: 0,
        globalHealthScore: 0
    });
    const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<InfrastructureAsset | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<InfrastructureAsset>>({
        name: "",
        category: "Roads & Infrastructure" as IssueCategory,
        department: "",
        latitude: 0,
        longitude: 0,
        status: "active",
        installationDate: new Date().toISOString().split("T")[0],
        maintenanceHistory: []
    });

    useEffect(() => {
        const unsubscribe = infrastructureService.subscribeToAllAssets((fetchedAssets) => {
            setAssets(fetchedAssets);
            setLoading(false);

            // Update analytics
            const total = fetchedAssets.length;
            const critical = fetchedAssets.filter(a => a.healthStatus === 'Critical').length;
            const needs = fetchedAssets.filter(a => a.healthStatus === 'Needs Inspection').length;
            const avgScore = total > 0
                ? fetchedAssets.reduce((acc, a) => acc + (a.healthScore || 0), 0) / total
                : 100;

            setAnalytics({
                totalAssets: total,
                criticalAssets: critical,
                needsInspection: needs,
                globalHealthScore: Math.round(avgScore)
            });
        });

        return () => unsubscribe();
    }, []);

    const runHealthReanalysis = async () => {
        toast({
            title: "Analysis Started",
            description: "Evaluating infrastructure patterns and citizen reports...",
        });

        try {
            for (const asset of assets) {
                const healthData = await infrastructureService.analyzeAssetHealth(asset.id, asset.category);
                await infrastructureService.updateAsset(asset.id, healthData);
            }
            toast({
                title: "Analysis Complete",
                description: "All infrastructure health scores have been updated.",
            });
        } catch (error) {
            toast({
                title: "Analysis Failed",
                description: "Error occurred during pattern detection.",
                variant: "destructive"
            });
        }
    };

    const handleCreateAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category || !formData.department) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            await infrastructureService.createAsset(formData as Omit<InfrastructureAsset, "id">);
            toast({
                title: "Success",
                description: "Infrastructure asset added successfully.",
            });
            setIsAddDialogOpen(false);
            // Reset form
            setFormData({
                name: "",
                category: "Roads & Infrastructure" as IssueCategory,
                department: "",
                latitude: 0,
                longitude: 0,
                status: "active",
                installationDate: new Date().toISOString().split("T")[0],
                maintenanceHistory: []
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create infrastructure asset.",
                variant: "destructive",
            });
        }
    };

    const filteredAssets = assets.filter((asset) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "maintenance": return <Wrench className="h-4 w-4 text-yellow-500" />;
            case "inactive": return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

    const getHealthBadge = (healthStatus: string) => {
        switch (healthStatus) {
            case "Healthy":
                return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">HEALTHY</span>;
            case "Critical":
                return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 animate-pulse">CRITICAL</span>;
            case "Needs Inspection":
                return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">NEEDS INSPECTION</span>;
            case "Under Maintenance":
                return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">MAINTENANCE</span>;
            default:
                return <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">UNKNOWN</span>;
        }
    };

    if (!user || user.role !== "admin") {
        return <div>Access Denied</div>;
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Infrastructure Portal</h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">
                        City Asset Health & Performance Monitoring
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="h-12 rounded-2xl px-6 font-bold uppercase tracking-widest gap-2 bg-white border-slate-200 shadow-sm transition-all hover:bg-slate-50"
                        onClick={runHealthReanalysis}
                    >
                        <Activity className="w-4 h-4 text-primary" /> Run Health Audit
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 rounded-2xl px-6 font-bold uppercase tracking-widest gap-2 shadow-lg shadow-blue-100">
                                <Plus className="w-4 h-4" /> Add Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add City Asset</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateAsset} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Asset Name</label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl border-slate-200"
                                        placeholder="e.g. Traffic Light 10th Ave"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value as IssueCategory })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.label} value={cat.label} className="rounded-xl">
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Department</label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl border-slate-200"
                                        placeholder="e.g. Traffic Safety"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Latitude</label>
                                        <Input
                                            type="number"
                                            step="any"
                                            required
                                            className="h-12 rounded-xl border-slate-200"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Longitude</label>
                                        <Input
                                            type="number"
                                            step="any"
                                            required
                                            className="h-12 rounded-xl border-slate-200"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest mt-4">Create Asset</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Health Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Health</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{analytics.globalHealthScore}%</h3>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${analytics.globalHealthScore}%` }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Critical Risks</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{analytics.criticalAssets}</h3>
                        <p className="text-[10px] text-red-500 font-black mt-2 uppercase tracking-wide">Immediate Action</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
                            <Search className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inspections</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{analytics.needsInspection}</h3>
                        <p className="text-[10px] text-orange-500 font-black mt-2 uppercase tracking-wide">Pending Review</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Monitored</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{analytics.totalAssets}</h3>
                        <p className="text-[10px] text-blue-500 font-black mt-2 uppercase tracking-wide">Registered Assets</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or department..."
                        className="pl-10 h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus-visible:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[240px] h-14 rounded-2xl border-slate-100 bg-white shadow-sm">
                        <Filter className="mr-2 h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Filter Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        <SelectItem value="all" className="rounded-xl">All Categories</SelectItem>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.label} value={cat.label} className="rounded-xl">
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 h-14 px-6">Asset Name</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 h-14">Health Condition</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 h-14">Complaints</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 h-14">Department</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 h-14 text-right pr-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Activity className="w-10 h-10 text-slate-200 animate-pulse" />
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Loading Repository...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No assets found matching criteria</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssets.map((asset) => (
                                <TableRow key={asset.id} className="border-slate-50 transition-colors hover:bg-slate-50/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-black text-slate-900">{asset.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">{asset.category}</div>
                                    </TableCell>
                                    <TableCell>{getHealthBadge(asset.healthStatus || 'Healthy')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${asset.issueCount && asset.issueCount >= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {asset.issueCount || 0}
                                            </div>
                                            {asset.issueCount && asset.issueCount >= 10 && (
                                                <Badge variant="destructive" className="text-[8px] h-4 uppercase tracking-tighter shadow-none">High Risk</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-bold text-xs uppercase tracking-wider">{asset.department}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl font-bold text-xs uppercase tracking-widest"
                                            onClick={() => setSelectedAssetForHistory(asset)}
                                        >
                                            View History
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={!!selectedAssetForHistory} onOpenChange={(open) => !open && setSelectedAssetForHistory(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <History className="w-6 h-6 text-primary" />
                            Asset History
                        </DialogTitle>
                    </DialogHeader>
                    {selectedAssetForHistory && (
                        <div className="space-y-6 pt-4">
                            <div>
                                <h4 className="font-black text-slate-900 uppercase tracking-tight">{selectedAssetForHistory.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedAssetForHistory.category}</p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Maintenance Logs</h5>
                                {selectedAssetForHistory.maintenanceHistory && selectedAssetForHistory.maintenanceHistory.length > 0 ? (
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {selectedAssetForHistory.maintenanceHistory.map((entry, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20" />
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-primary uppercase">{entry.date}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.performedBy}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{entry.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No maintenance history recorded</p>
                                    </div>
                                )}
                            </div>
                            <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setSelectedAssetForHistory(null)}>Close Record</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
