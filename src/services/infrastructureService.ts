import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InfrastructureAsset, IssueCategory, AssetHealthStatus } from '@/types';

const INFRASTRUCTURE_COLLECTION = 'infrastructure';

export const infrastructureService = {
    /**
     * Create a new infrastructure asset
     */
    async createAsset(data: Omit<InfrastructureAsset, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, INFRASTRUCTURE_COLLECTION), {
            ...data,
            healthStatus: 'Healthy',
            healthScore: 100,
            issueCount: 0,
            lastInspectionDate: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    /**
     * Update an existing infrastructure asset
     */
    async updateAsset(id: string, data: Partial<InfrastructureAsset>): Promise<void> {
        const assetRef = doc(db, INFRASTRUCTURE_COLLECTION, id);
        await updateDoc(assetRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Delete an infrastructure asset
     */
    async deleteAsset(id: string): Promise<void> {
        const assetRef = doc(db, INFRASTRUCTURE_COLLECTION, id);
        await deleteDoc(assetRef);
    },

    /**
     * Perform health analysis on an asset based on its issues
     */
    async analyzeAssetHealth(assetId: string, category: IssueCategory): Promise<Partial<InfrastructureAsset>> {
        const issuesQuery = query(
            collection(db, 'issues'),
            where('assetId', '==', assetId)
        );
        const snapshot = await getDocs(issuesQuery);
        const issues = snapshot.docs.map(doc => doc.data());
        const count = issues.length;

        let healthStatus: AssetHealthStatus = 'Healthy';
        let healthScore = 100 - (count * 10); // Simple linear degradation

        // Threshold Rules
        if (count >= 10) {
            healthStatus = 'Critical';
            healthScore = Math.min(healthScore, 20);
        } else if (count >= 5) {
            healthStatus = 'Needs Inspection';
            healthScore = Math.min(healthScore, 50);
        } else if (count > 0) {
            healthStatus = 'Needs Inspection';
            healthScore = Math.min(healthScore, 80);
        }

        // Pattern Detection
        const descriptions = issues.map(i => (i.description || '').toLowerCase());
        const hasStagnation = descriptions.some(d => d.includes('stagnation') || d.includes('flood') || d.includes('water logging'));
        const hasSignalFailure = descriptions.some(d => d.includes('signal') || d.includes('traffic light') || d.includes('timer'));

        if (category === 'Garbage & Sanitation' && hasStagnation) {
            healthStatus = 'Critical'; // Drainage Failure pattern
        }
        if (category === 'Traffic Issues' && hasSignalFailure && count > 3) {
            healthStatus = 'Critical'; // Repeated signal maintenance required
        }

        return {
            healthStatus,
            healthScore: Math.max(0, healthScore),
            issueCount: count,
            lastInspectionDate: new Date().toISOString().split('T')[0]
        };
    },

    /**
     * Get aggregate analytics for all infrastructure
     */
    async getInfrastructureAnalytics(): Promise<{
        totalAssets: number;
        criticalAssets: number;
        needsInspection: number;
        globalHealthScore: number;
    }> {
        const assets = await this.getAllAssets();
        const total = assets.length;
        if (total === 0) return { totalAssets: 0, criticalAssets: 0, needsInspection: 0, globalHealthScore: 100 };

        const critical = assets.filter(a => a.healthStatus === 'Critical').length;
        const needsInspection = assets.filter(a => a.healthStatus === 'Needs Inspection').length;
        const avgScore = assets.reduce((acc, a) => acc + (a.healthScore || 0), 0) / total;

        return {
            totalAssets: total,
            criticalAssets: critical,
            needsInspection: needsInspection,
            globalHealthScore: Math.round(avgScore)
        };
    },

    /**
     * Subscribe to all infrastructure assets
     */
    subscribeToAllAssets(callback: (assets: InfrastructureAsset[]) => void, onError?: (error: any) => void) {
        const q = query(collection(db, INFRASTRUCTURE_COLLECTION));

        return onSnapshot(q, (snapshot) => {
            const assets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InfrastructureAsset[];
            callback(assets);
        }, (error) => {
            console.error("Firestore Error (subscribeToAllAssets):", error);
            if (onError) onError(error);
        });
    },

    /**
     * Subscribe to infrastructure assets by category
     */
    subscribeToAssetsByCategory(category: IssueCategory, callback: (assets: InfrastructureAsset[]) => void, onError?: (error: any) => void) {
        const q = query(
            collection(db, INFRASTRUCTURE_COLLECTION),
            where('category', '==', category)
        );

        return onSnapshot(q, (snapshot) => {
            const assets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InfrastructureAsset[];
            callback(assets);
        }, (error) => {
            console.error("Firestore Error (subscribeToAssetsByCategory):", error);
            if (onError) onError(error);
        });
    },

    /**
     * Get all infrastructure assets once (for static dropdowns/maps where real-time updates aren't critical)
     */
    async getAllAssets(): Promise<InfrastructureAsset[]> {
        const snapshot = await getDocs(collection(db, INFRASTRUCTURE_COLLECTION));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as InfrastructureAsset[];
    }
};
