import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase client safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config if available
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// 1. Lead / Strategy Inquiries Collection
export interface DbLead {
  id?: string;
  clientName: string;
  phone: string;
  email?: string;
  businessName?: string;
  category?: string;
  packageInterest?: string;
  monthlyBudget?: string;
  notes?: string;
  status?: string;
  createdAt?: any;
}

export async function saveLeadToDb(lead: Omit<DbLead, 'id' | 'createdAt'>) {
  try {
    const leadsRef = collection(db, 'leads');
    const docRef = await addDoc(leadsRef, {
      ...lead,
      status: lead.status || 'NEW_INQUIRY',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving lead to Firestore:', error);
    return { success: false, error };
  }
}

// 2. Transactions / Subscriptions Collection
export interface DbTransaction {
  id?: string;
  orderId: string;
  tierId: string;
  tierName: string;
  billingCycle: string;
  amount: number;
  customerName: string;
  email: string;
  phone: string;
  customerPhone?: string;
  businessName?: string;
  paymentMethod: string;
  paymentStatus: string;
  upiId?: string;
  invoiceNumber?: string;
  timestamp?: any;
}

export async function saveTransactionToDb(txn: Omit<DbTransaction, 'id' | 'timestamp'>) {
  try {
    const txnsRef = collection(db, 'transactions');
    const docRef = await addDoc(txnsRef, {
      ...txn,
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving transaction to Firestore:', error);
    return { success: false, error };
  }
}

// 3. Visitor Tracking Collection
export interface DbVisitor {
  id?: string;
  city: string;
  device: string;
  referrer: string;
  page: string;
  timestamp?: any;
}

export async function logVisitorToDb(visitor: Omit<DbVisitor, 'id' | 'timestamp'>) {
  try {
    const visitorsRef = collection(db, 'visitors');
    const docRef = await addDoc(visitorsRef, {
      ...visitor,
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging visitor to Firestore:', error);
    return { success: false, error };
  }
}

// 4. Reviews & Testimonials Collection
export interface DbReview {
  id?: string;
  name: string;
  role: string;
  company: string;
  category: string;
  location: string;
  rating: number;
  comment: string;
  result?: string;
  verified?: boolean;
  avatar?: string;
  createdAt?: any;
}

export async function saveReviewToDb(review: Omit<DbReview, 'id' | 'createdAt'>) {
  try {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      ...review,
      verified: review.verified !== undefined ? review.verified : true,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving review to Firestore:', error);
    return { success: false, error };
  }
}

export async function fetchReviewsFromDb(): Promise<DbReview[]> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DbReview));
  } catch (error) {
    console.error('Error fetching reviews from Firestore:', error);
    return [];
  }
}

// 5. Real-Time Notification Stream Collection
export interface DbNotification {
  id?: string;
  type: string;
  title: string;
  details: string;
  recipientEmail: string;
  timestamp?: any;
  payload?: any;
}

export async function logNotificationToDb(notification: Omit<DbNotification, 'id' | 'timestamp'>) {
  try {
    const notifsRef = collection(db, 'notifications');
    const docRef = await addDoc(notifsRef, {
      ...notification,
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging notification to Firestore:', error);
    return { success: false, error };
  }
}

export function subscribeToNotifications(
  callback: (notifications: DbNotification[]) => void
): Unsubscribe {
  const notifsRef = collection(db, 'notifications');
  const q = query(notifsRef, orderBy('timestamp', 'desc'), limit(50));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const ts = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
        return {
          id: doc.id,
          ...data,
          timestamp: ts,
        } as DbNotification;
      });
      callback(items);
    },
    (err) => {
      console.error('Firestore notifications listener error:', err);
    }
  );
}
