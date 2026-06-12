import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SecurityLog } from '@/types';

class SecurityService {
    private collectionName = 'security_logs';

    async logActivity(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
        try {
            await addDoc(collection(db, this.collectionName), {
                ...log,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error('Failed to log security activity:', error);
        }
    }

    subscribeToSuspiciousActivity(callback: (logs: SecurityLog[]) => void) {
        // Use a simpler query that only sorts by timestamp to avoid index requirement
        // We filter isSuspicious in-memory for a "just works" experience
        const q = query(
            collection(db, this.collectionName),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as SecurityLog[];

            const suspiciousLogs = logs.filter(log => log.isSuspicious === true);
            callback(suspiciousLogs);
        });
    }

    subscribeToAllLogs(callback: (logs: SecurityLog[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as SecurityLog[];
            callback(logs);
        });
    }

    // Official authority list — these users are treated as low-risk legal nodes
    private readonly OFFICIAL_AUTHORITIES = ['sujith'];

    // Helper to log unauthorized access attempts
    async logUnauthorizedAccess(userId: string, userName: string, path: string) {
        const isOfficialAuthority = this.OFFICIAL_AUTHORITIES.includes(
            (userName || '').toLowerCase().trim()
        );

        if (isOfficialAuthority) {
            // Official authority: low risk, legal admin status — just an audit trail
            await this.logActivity({
                userId,
                userName,
                action: 'legal_admin_access_audit',
                category: 'access',
                severity: 'low',
                details: `Official authority node verified. Path accessed: ${path}. Status: Legal Admin — Authorized governance account.`,
                isSuspicious: false
            });
        } else {
            // All others: high risk unauthorized access
            await this.logActivity({
                userId,
                userName,
                action: 'unauthorized_access_attempt',
                category: 'access',
                severity: 'high',
                details: `User attempted to access restricted path: ${path}`,
                isSuspicious: true
            });
        }
    }
}

export const securityService = new SecurityService();
