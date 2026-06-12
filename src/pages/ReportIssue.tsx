import { useRef, useState, useEffect } from 'react';
import { CATEGORIES, IssueCategory, GOVERNMENT_PORTALS, InfrastructureAsset, IssuePriority } from '@/types';
import { calculatePriority, findDuplicates, mockIssues } from '@/data/mockData';
import { Camera, MapPin, ChevronLeft, AlertTriangle, CheckCircle2, PlusCircle, Loader2, X, Map as MapIcon, Layers, Lock as LockIcon, Sparkles, Brain, Info, BrainCircuit } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { issueService } from '@/services/issueService';
import { aiService } from '@/services/aiService';
import { infrastructureService } from '@/services/infrastructureService';
import { Badge } from '@/components/ui/badge';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<typeof mockIssues>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Infrastructure Linking
  const [nearbyAssets, setNearbyAssets] = useState<InfrastructureAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('none');
  const [aiPriority, setAiPriority] = useState<IssuePriority | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (category) {
      const unsubscribe = infrastructureService.subscribeToAssetsByCategory(category, (assets) => {
        setNearbyAssets(assets);
        setSelectedAssetId('none');
      });
      return () => unsubscribe();
    } else {
      setNearbyAssets([]);
      setSelectedAssetId('none');
    }
  }, [category]);

  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap) {
      setTimeout(() => {
        if (mapRef.current && !mapInstance.current) {
          const map = L.map(mapRef.current).setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OSM'
          }).addTo(map);

          const customPin = L.divIcon({
            className: 'custom-pin',
            html: `
              <div style="
                width: 28px;
                height: 28px;
                background: #0f172a;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: white;"></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([lat, lng], {
            icon: customPin,
            draggable: true
          }).addTo(map);

          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            setLat(lat);
            setLng(lng);
          });

          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setLat(lat);
            setLng(lng);
            marker.setLatLng([lat, lng]);
          });

          mapInstance.current = map;
        }
      }, 100);
    }
  };

  const handleCategorySelect = (cat: IssueCategory) => {
    setCategory(cat);
    const dups = findDuplicates(lat, lng, cat);
    setDuplicates(dups);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to report an issue');
      return;
    }

    if (!title || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await issueService.createIssue({
        title,
        description,
        category: category as IssueCategory,
        latitude: lat,
        longitude: lng,
        reportedBy: user.id,
        reporterName: user.name,
        imageFile: imageFile || undefined,
        assetId: selectedAssetId !== 'none' ? selectedAssetId : undefined,
        priority: aiPriority || 'medium',
        aiAnalysis: aiAnalysis || undefined
      });

      toast.success('Your report has been submitted!');
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const runAIAnalysis = async () => {
    if (!description || !category) {
      toast.error("Please provide description and category for AI analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeIssue(description, category);
      setAiPriority(result.priority.toLowerCase() as IssuePriority);
      setAiAnalysis({
        suggestedDept: result.suggestedDept,
        analysis: result.analysis,
        actionItems: result.actionItems
      });
      toast.success("AI Analysis Complete: Priority " + result.priority);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (submitted && category) {
    const portals = GOVERNMENT_PORTALS[category as IssueCategory] || GOVERNMENT_PORTALS['Others'];
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full"
        >
          <div className="w-24 h-24 bg-status-resolved/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-status-resolved" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Signal Received!</h2>
          <p className="text-base text-muted-foreground font-medium mb-12">
            Your report has been successfully logged. Our urban response team will begin analysis shortly.
          </p>

          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Recommended Official Portals</h3>
            </div>

            <div className="grid gap-4">
              {portals.map((portal, idx) => (
                <motion.a
                  key={idx}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="group block p-5 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-foreground mb-1 group-hover:text-primary transition-colors">{portal.name}</h4>
                      <p className="text-[11px] font-medium text-muted-foreground">{portal.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <PlusCircle className="w-5 h-5 rotate-45" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            <Button
              onClick={() => navigate('/issues')}
              variant="outline"
              className="w-full h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs mt-8 hover:bg-slate-50"
            >
              Continue to Registry
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Report an Issue</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/security" className="text-teal-500 font-black uppercase tracking-widest text-[9px] hover:underline flex items-center gap-1.5 bg-teal-500/5 px-3 py-1.5 rounded-lg border border-teal-500/10 transition-all hover:bg-teal-500/10">
            <LockIcon className="w-3 h-3" />
            Security
          </Link>
          <Link to="/infrastructure" className="text-blue-500 font-black uppercase tracking-widest text-[9px] hover:underline flex items-center gap-1.5 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 transition-all hover:bg-blue-500/10">
            <Layers className="w-3 h-3" />
            Infrastructure
          </Link>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Category *</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => handleCategorySelect(cat.label)}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center ${category === cat.label
                    ? 'border-primary bg-primary/5 shadow-card'
                    : 'border-border bg-card hover:bg-muted'
                  }`}
              >
                <span className="text-lg mb-1">
                  {cat.label === 'Roads & Infrastructure' ? '🚧' :
                    cat.label === 'Garbage & Sanitation' ? '🗑️' :
                      cat.label === 'Water Supply' ? '💧' :
                        cat.label === 'Electricity' ? '⚡' :
                          cat.label === 'Street Lights' ? '💡' :
                            cat.label === 'Public Safety' ? '🛡️' :
                              cat.label === 'Traffic Issues' ? '🚦' : '📌'}
                </span>
                <span className="text-[9px] font-medium text-card-foreground leading-tight">{cat.label.split(' & ')[0].split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {duplicates.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-accent/10 border border-accent/30 rounded-xl p-3 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Similar issues nearby</p>
                <p className="text-[11px] text-muted-foreground">{duplicates.length} similar {category} report(s) found within 500m of your location.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Title *</label>
          <Input
            placeholder="e.g. Broken street light near school"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-card"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Description *</label>
          <Textarea
            placeholder="Tell us what's happening..."
            value={description}
            onChange={handleDescriptionChange}
            className="min-h-[120px] rounded-[1.5rem] border-slate-200 focus:ring-primary/20 bg-slate-50/50"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-[10px] font-bold text-slate-400">Provide as much detail as possible for better AI analysis.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full h-8 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary border-none bg-slate-100"
              onClick={runAIAnalysis}
              disabled={isAnalyzing || !description || description.length < 10 || !category}
            >
              {isAnalyzing ? "Analyzing..." : <><Sparkles className="w-3 h-3" /> Get Smart Priority</>}
            </Button>
          </div>

          {aiPriority && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">AI Suggested Priority</p>
                  <p className="text-xs font-bold text-slate-700 uppercase">{aiPriority}</p>
                </div>
              </div>
              <Badge className="bg-primary text-white font-black uppercase text-[8px]">Auto-Synced</Badge>
            </motion.div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Photo (optional)</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-md rounded-full shadow-sm hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ) : (
            <div
              onClick={handlePhotoClick}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card hover:bg-muted transition-colors cursor-pointer"
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Tap to capture or upload</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground block">Issue Location *</label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 bg-muted rounded-xl px-4 py-3 border border-transparent focus-within:border-primary/20 transition-all">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">GPS Coordinates</p>
                <p className="text-sm font-bold text-foreground truncate">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMap}
                className="h-9 rounded-lg border-primary/20 hover:bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider"
              >
                {showMap ? 'Confirm Location' : 'Pin on Map'}
              </Button>
            </div>

            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 300, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="rounded-2xl overflow-hidden border border-border shadow-inner relative z-0"
                >
                  <div ref={mapRef} className="w-full h-full" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-lg pointer-events-none">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Tap or drag pin to move</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {category && nearbyAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <label className="text-sm font-semibold text-foreground">Link to Infrastructure (Optional)</label>
            </div>
            <p className="text-xs text-muted-foreground">Is this issue related to a specific city asset? Linking helps our teams locate and resolve the issue faster.</p>
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
              <SelectTrigger className="w-full bg-card border-primary/20 bg-background">
                <SelectValue placeholder="Select an asset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Not applicable</SelectItem>
                {nearbyAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} ({asset.department}) - {asset.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {title && description && category && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border rounded-xl p-3"
          >
            <p className="text-[11px] text-muted-foreground mb-1">🤖 AI Priority Assessment</p>
            <p className="text-sm font-bold text-foreground capitalize">
              {calculatePriority(category, description)} Priority
            </p>
          </motion.div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 text-sm font-bold rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </div>
    </div>
  );
}
