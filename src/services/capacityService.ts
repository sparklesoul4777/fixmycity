import {
    collection, doc, setDoc, getDoc, onSnapshot, updateDoc, getDocs, query, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    HospitalCapacity, RoadCapacity, WaterZone, CapacityAlert, UtilizationStatus,
    seedHospitals, seedRoads, seedWaterZones
} from '@/data/capacityData';
import { Issue } from '@/types';

const COL_HOSPITALS = 'capacity_hospitals';
const COL_ROADS = 'capacity_roads';
const COL_WATER = 'capacity_water';
const COL_ALERTS = 'capacity_alerts';

// ── Seeding ───────────────────────────────────────────────────────────────
async function seedIfEmpty<T extends { id: string }>(colName: string, seeds: T[]) {
    const snap = await getDocs(collection(db, colName));
    if (!snap.empty) return;
    for (const item of seeds) {
        await setDoc(doc(db, colName, item.id), item);
    }
}

export const capacityService = {
    /** Seed all datasets on first load */
    async seedAll() {
        await Promise.all([
            seedIfEmpty(COL_HOSPITALS, seedHospitals),
            seedIfEmpty(COL_ROADS, seedRoads),
            seedIfEmpty(COL_WATER, seedWaterZones),
        ]);
    },

    // ── Live subscriptions ─────────────────────────────────────────────────
    subscribeToHospitals(cb: (data: HospitalCapacity[]) => void) {
        return onSnapshot(collection(db, COL_HOSPITALS), snap =>
            cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as HospitalCapacity))));
    },

    subscribeToRoads(cb: (data: RoadCapacity[]) => void) {
        return onSnapshot(collection(db, COL_ROADS), snap =>
            cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as RoadCapacity))));
    },

    subscribeToWaterZones(cb: (data: WaterZone[]) => void) {
        return onSnapshot(collection(db, COL_WATER), snap =>
            cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as WaterZone))));
    },

    subscribeToAlerts(cb: (data: CapacityAlert[]) => void) {
        return onSnapshot(collection(db, COL_ALERTS), snap =>
            cb(
                snap.docs
                    .map(d => ({ id: d.id, ...d.data() } as CapacityAlert))
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            ));
    },

    // ── Complaint-Cluster Alerts ───────────────────────────────────────────
    /** Scan issues, identify recurring complaint types per zone, push alerts */
    async deriveComplaintAlerts(issues: Issue[]) {
        const THRESHOLD = 3; // min complaints to trigger alert

        type Bucket = { count: number; category: string; zone: string };
        const buckets: Record<string, Bucket> = {};

        for (const issue of issues) {
            if (issue.status === 'resolved') continue;
            const key = `${issue.category}-${issue.latitude?.toFixed(2) ?? '0'}-${issue.longitude?.toFixed(2) ?? '0'}`;
            if (!buckets[key]) buckets[key] = { count: 0, category: issue.category, zone: issue.category };
            buckets[key].count++;
        }

        for (const [key, bucket] of Object.entries(buckets)) {
            if (bucket.count < THRESHOLD) continue;
            const alertId = `complaint-${key.replace(/[^a-z0-9]/gi, '-')}`;
            const docRef = doc(db, COL_ALERTS, alertId);
            const existing = await getDoc(docRef);
            if (existing.exists()) continue; // already raised

            const type = bucket.category.includes('Traffic') ? 'traffic'
                : bucket.category.includes('Water') ? 'water'
                    : bucket.category.includes('Drainage') ? 'drainage'
                        : 'traffic';

            const alert: CapacityAlert = {
                id: alertId,
                type,
                severity: bucket.count >= 6 ? 'critical' : 'warning',
                zone: bucket.zone,
                message: `${bucket.count} unresolved complaints about "${bucket.category}" detected in the same area. Possible overload.`,
                source: 'complaint',
                timestamp: new Date().toISOString(),
                isActive: true,
            };
            await setDoc(docRef, alert);
        }
    },

    // ── Admin mutations ────────────────────────────────────────────────────
    async updateRoadStatus(id: string, status: UtilizationStatus) {
        await updateDoc(doc(db, COL_ROADS, id), { status, lastUpdated: new Date().toISOString() });
    },

    async updateHospitalStatus(id: string, patch: Partial<HospitalCapacity>) {
        await updateDoc(doc(db, COL_HOSPITALS, id), { ...patch, lastUpdated: new Date().toISOString() });
    },

    async broadcastAlert(alert: Omit<CapacityAlert, 'id'>) {
        const id = `manual-${Date.now()}`;
        await setDoc(doc(db, COL_ALERTS, id), { ...alert, id, timestamp: new Date().toISOString() });
    },

    async dismissAlert(id: string) {
        await updateDoc(doc(db, COL_ALERTS, id), { isActive: false });
    },
};
