// Seed datasets for Infrastructure Capacity & Utilization Monitoring
// These represent Chennai city zones and facilities.

export type UtilizationStatus = 'optimal' | 'moderate' | 'high' | 'critical';

export interface HospitalCapacity {
    id: string;
    name: string;
    zone: string;
    totalBeds: number;
    occupiedBeds: number;
    icuTotal: number;
    icuOccupied: number;
    erLoad: number; // percentage
    status: UtilizationStatus;
    lastUpdated: string;
}

export interface RoadCapacity {
    id: string;
    name: string;
    zone: string;
    vehicleCount: number;    // current vehicles
    maxCapacity: number;     // max vehicles before congestion
    congestionPct: number;   // derived: vehicleCount/maxCapacity*100
    status: UtilizationStatus;
    peakHour: string;
    lastUpdated: string;
}

export interface WaterZone {
    id: string;
    zone: string;
    supplyLoadPct: number;   // 0–100: how much of supply capacity is being drawn
    drainageLoadPct: number; // 0–100: how full drainage is
    status: UtilizationStatus;
    lastUpdated: string;
}

export interface CapacityAlert {
    id: string;
    type: 'traffic' | 'hospital' | 'water' | 'drainage';
    severity: 'info' | 'warning' | 'critical';
    zone: string;
    message: string;
    source: 'sensor' | 'complaint';
    timestamp: string;
    isActive: boolean;
}

// ── Hospitals ──────────────────────────────────────────────────────────────
export const seedHospitals: HospitalCapacity[] = [
    {
        id: 'hosp-1',
        name: 'Government General Hospital',
        zone: 'Park Town',
        totalBeds: 3200,
        occupiedBeds: 2980,
        icuTotal: 120,
        icuOccupied: 110,
        erLoad: 88,
        status: 'critical',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'hosp-2',
        name: 'Rajiv Gandhi Government Hospital',
        zone: 'Omandurar',
        totalBeds: 1800,
        occupiedBeds: 1350,
        icuTotal: 80,
        icuOccupied: 60,
        erLoad: 65,
        status: 'high',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'hosp-3',
        name: 'Stanley Medical College Hospital',
        zone: 'Royapuram',
        totalBeds: 1600,
        occupiedBeds: 980,
        icuTotal: 60,
        icuOccupied: 30,
        erLoad: 45,
        status: 'moderate',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'hosp-4',
        name: 'Kilpauk Medical College Hospital',
        zone: 'Kilpauk',
        totalBeds: 1200,
        occupiedBeds: 700,
        icuTotal: 50,
        icuOccupied: 20,
        erLoad: 35,
        status: 'optimal',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'hosp-5',
        name: 'Institute of Child Health',
        zone: 'Egmore',
        totalBeds: 900,
        occupiedBeds: 720,
        icuTotal: 40,
        icuOccupied: 35,
        erLoad: 78,
        status: 'high',
        lastUpdated: new Date().toISOString(),
    },
];

// ── Roads ──────────────────────────────────────────────────────────────────
export const seedRoads: RoadCapacity[] = [
    {
        id: 'road-1',
        name: 'Anna Salai (Mount Road)',
        zone: 'Central',
        vehicleCount: 9200,
        maxCapacity: 7000,
        congestionPct: 131,
        status: 'critical',
        peakHour: '08:00–10:00, 17:00–19:00',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'road-2',
        name: 'GST Road',
        zone: 'South',
        vehicleCount: 8500,
        maxCapacity: 8000,
        congestionPct: 106,
        status: 'critical',
        peakHour: '07:30–09:30, 18:00–20:00',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'road-3',
        name: 'Poonamallee High Road',
        zone: 'West',
        vehicleCount: 5800,
        maxCapacity: 7500,
        congestionPct: 77,
        status: 'high',
        peakHour: '08:00–10:00',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'road-4',
        name: 'Rajiv Gandhi Salai (OMR)',
        zone: 'South East',
        vehicleCount: 4200,
        maxCapacity: 9000,
        congestionPct: 47,
        status: 'moderate',
        peakHour: '09:00–10:00',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'road-5',
        name: 'Velachery Main Road',
        zone: 'South West',
        vehicleCount: 6400,
        maxCapacity: 6000,
        congestionPct: 107,
        status: 'critical',
        peakHour: '08:00–10:00, 18:00–21:00',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'road-6',
        name: 'ECR (East Coast Road)',
        zone: 'Coastal',
        vehicleCount: 2100,
        maxCapacity: 8000,
        congestionPct: 26,
        status: 'optimal',
        peakHour: 'Weekends 10:00–14:00',
        lastUpdated: new Date().toISOString(),
    },
];

// ── Water & Drainage Zones ─────────────────────────────────────────────────
export const seedWaterZones: WaterZone[] = [
    {
        id: 'water-1',
        zone: 'North Chennai',
        supplyLoadPct: 91,
        drainageLoadPct: 85,
        status: 'critical',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'water-2',
        zone: 'Central Chennai',
        supplyLoadPct: 74,
        drainageLoadPct: 68,
        status: 'high',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'water-3',
        zone: 'South Chennai',
        supplyLoadPct: 55,
        drainageLoadPct: 42,
        status: 'moderate',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'water-4',
        zone: 'West Chennai',
        supplyLoadPct: 38,
        drainageLoadPct: 30,
        status: 'optimal',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'water-5',
        zone: 'Tambaram',
        supplyLoadPct: 82,
        drainageLoadPct: 79,
        status: 'high',
        lastUpdated: new Date().toISOString(),
    },
];

// ── Status helpers ─────────────────────────────────────────────────────────
export function getStatusColor(status: UtilizationStatus) {
    return {
        optimal: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
        moderate: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
        high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    }[status];
}

export function getProgressColor(pct: number) {
    if (pct >= 95) return 'bg-red-500';
    if (pct >= 75) return 'bg-orange-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-green-500';
}
