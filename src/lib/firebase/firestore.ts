import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  increment,
  runTransaction,
  Timestamp,
  CollectionReference,
  DocumentData,
  WithFieldValue,
} from 'firebase/firestore';
import { db as getDb } from './client';
import {
  UserProfile,
  UserBranding,
  UserSettings,
  Client,
  Proposal,
  Template,
  SavedContent,
  MediaAsset,
  ProposalStatus,
  ContentCategory,
} from '@/types';

const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  PROPOSALS: 'proposals',
  TEMPLATES: 'templates',
  SAVED_CONTENT: 'savedContent',
  MEDIA: 'media',
  PUBLIC_TEMPLATES: 'templates/public',
} as const;

function userDoc(userId: string) {
  const database = getDb();
  if (!database) throw new Error('Firestore is not initialized');
  return doc(database, COLLECTIONS.USERS, userId);
}

function userSubCollection(userId: string, collectionName: string) {
  const database = getDb();
  if (!database) throw new Error('Firestore is not initialized');
  return collection(database, COLLECTIONS.USERS, userId, collectionName);
}

function userSubDoc(userId: string, collectionName: string, docId: string) {
  const database = getDb();
  if (!database) throw new Error('Firestore is not initialized');
  return doc(database, COLLECTIONS.USERS, userId, collectionName, docId);
}

function toFirestore(obj: any): any {
  if (!obj) return obj;
  if (obj instanceof Date) return Timestamp.fromDate(obj);
  if (Array.isArray(obj)) return obj.map(toFirestore);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        converted[key] = toFirestore(value);
      }
    }
    return converted;
  }
  return obj;
}

function fromFirestore(data: any): any {
  if (!data) return data;
  if (data instanceof Timestamp) return data.toDate();
  if (Array.isArray(data)) return data.map(fromFirestore);
  if (typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = fromFirestore(value);
    }
    return converted;
  }
  return data;
}

export const firestoreHelpers = {
  // User Profile
  async createUserProfile(userId: string, data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const profile = { ...data, createdAt: now, updatedAt: now };
    await setDoc(userDoc(userId), toFirestore(profile));
    return profile;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(userDoc(userId));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as UserProfile;
  },

  async updateUserProfile(userId: string, data: Partial<UserProfile>) {
    await updateDoc(userDoc(userId), toFirestore({ ...data, updatedAt: new Date() }));
  },

  // User Branding
  async getUserBranding(userId: string): Promise<UserBranding | null> {
    const snap = await getDoc(userSubDoc(userId, 'branding', 'main'));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as UserBranding;
  },

  async setUserBranding(userId: string, data: UserBranding) {
    await setDoc(userSubDoc(userId, 'branding', 'main'), toFirestore(data), { merge: true });
  },

  // User Settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const snap = await getDoc(userSubDoc(userId, 'settings', 'main'));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as UserSettings;
  },

  async setUserSettings(userId: string, data: UserSettings) {
    await setDoc(userSubDoc(userId, 'settings', 'main'), toFirestore(data), { merge: true });
  },

  // Clients
  async createClient(userId: string, data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const ref = doc(userSubCollection(userId, COLLECTIONS.CLIENTS));
    const clientData = { ...data, id: ref.id, userId, createdAt: now, updatedAt: now };
    await setDoc(ref, toFirestore(clientData));
    return clientData;
  },

  async getClients(userId: string): Promise<Client[]> {
    const q = query(
      userSubCollection(userId, COLLECTIONS.CLIENTS) as CollectionReference<Client>,
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => fromFirestore(doc.data()) as Client);
  },

  async getClient(userId: string, clientId: string): Promise<Client | null> {
    const snap = await getDoc(userSubDoc(userId, COLLECTIONS.CLIENTS, clientId));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as Client;
  },

  async updateClient(userId: string, clientId: string, data: Partial<Client>) {
    await updateDoc(userSubDoc(userId, COLLECTIONS.CLIENTS, clientId), toFirestore({ ...data, updatedAt: new Date() }));
  },

  async deleteClient(userId: string, clientId: string) {
    await deleteDoc(userSubDoc(userId, COLLECTIONS.CLIENTS, clientId));
  },

  // Proposals
  async createProposal(userId: string, data: Omit<Proposal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'viewCount'>) {
    const now = new Date();
    const ref = doc(userSubCollection(userId, COLLECTIONS.PROPOSALS));
    const proposalData = { ...data, id: ref.id, userId, viewCount: 0, createdAt: now, updatedAt: now };
    await setDoc(ref, toFirestore(proposalData));
    return proposalData;
  },

  async getProposals(userId: string, status?: ProposalStatus): Promise<Proposal[]> {
    let q;
    if (status) {
      q = query(
        userSubCollection(userId, COLLECTIONS.PROPOSALS) as CollectionReference<Proposal>,
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        userSubCollection(userId, COLLECTIONS.PROPOSALS) as CollectionReference<Proposal>,
        orderBy('updatedAt', 'desc')
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((doc) => fromFirestore(doc.data()) as Proposal);
  },

  async getProposal(userId: string, proposalId: string): Promise<Proposal | null> {
    const snap = await getDoc(userSubDoc(userId, COLLECTIONS.PROPOSALS, proposalId));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as Proposal;
  },

  async updateProposal(userId: string, proposalId: string, data: Partial<Proposal>) {
    await updateDoc(userSubDoc(userId, COLLECTIONS.PROPOSALS, proposalId), toFirestore({ ...data, updatedAt: new Date() }));
  },

  async deleteProposal(userId: string, proposalId: string) {
    await deleteDoc(userSubDoc(userId, COLLECTIONS.PROPOSALS, proposalId));
  },

  async incrementProposalViews(userId: string, proposalId: string) {
    const ref = userSubDoc(userId, COLLECTIONS.PROPOSALS, proposalId);
    await runTransaction(getDb(), async (transaction) => {
      const docSnap = await transaction.get(ref);
      if (docSnap.exists()) {
        transaction.update(ref, {
          viewCount: increment(1),
          lastViewedAt: Timestamp.now(),
        });
      }
    });
  },

  // Templates
  async createTemplate(userId: string, data: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const ref = doc(userSubCollection(userId, COLLECTIONS.TEMPLATES));
    const templateData = { ...data, id: ref.id, userId, createdAt: now, updatedAt: now };
    await setDoc(ref, toFirestore(templateData));
    return templateData;
  },

  async getTemplates(userId: string): Promise<Template[]> {
    const q = query(
      userSubCollection(userId, COLLECTIONS.TEMPLATES) as CollectionReference<Template>,
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => fromFirestore(doc.data()) as Template);
  },

  async getTemplate(userId: string, templateId: string): Promise<Template | null> {
    const snap = await getDoc(userSubDoc(userId, COLLECTIONS.TEMPLATES, templateId));
    if (!snap.exists()) return null;
    return fromFirestore(snap.data()) as Template;
  },

  async updateTemplate(userId: string, templateId: string, data: Partial<Template>) {
    await updateDoc(userSubDoc(userId, COLLECTIONS.TEMPLATES, templateId), toFirestore({ ...data, updatedAt: new Date() }));
  },

  async deleteTemplate(userId: string, templateId: string) {
    await deleteDoc(userSubDoc(userId, COLLECTIONS.TEMPLATES, templateId));
  },

  // Saved Content
  async createSavedContent(userId: string, data: Omit<SavedContent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const ref = doc(userSubCollection(userId, COLLECTIONS.SAVED_CONTENT));
    const contentData = { ...data, id: ref.id, userId, createdAt: now, updatedAt: now };
    await setDoc(ref, toFirestore(contentData));
    return contentData;
  },

  async getSavedContent(userId: string, category?: ContentCategory): Promise<SavedContent[]> {
    let q;
    if (category) {
      q = query(
        userSubCollection(userId, COLLECTIONS.SAVED_CONTENT) as CollectionReference<SavedContent>,
        where('category', '==', category),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        userSubCollection(userId, COLLECTIONS.SAVED_CONTENT) as CollectionReference<SavedContent>,
        orderBy('updatedAt', 'desc')
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((doc) => fromFirestore(doc.data()) as SavedContent);
  },

  async updateSavedContent(userId: string, contentId: string, data: Partial<SavedContent>) {
    await updateDoc(userSubDoc(userId, COLLECTIONS.SAVED_CONTENT, contentId), toFirestore({ ...data, updatedAt: new Date() }));
  },

  async deleteSavedContent(userId: string, contentId: string) {
    await deleteDoc(userSubDoc(userId, COLLECTIONS.SAVED_CONTENT, contentId));
  },

  // Media
  async saveMediaReference(userId: string, data: Omit<MediaAsset, 'id'>) {
    const ref = doc(userSubCollection(userId, COLLECTIONS.MEDIA));
    const mediaData = { ...data, id: ref.id };
    await setDoc(ref, toFirestore(mediaData));
    return mediaData;
  },

  async getMediaReferences(userId: string): Promise<MediaAsset[]> {
    const snap = await getDocs(userSubCollection(userId, COLLECTIONS.MEDIA) as CollectionReference<MediaAsset>);
    return snap.docs.map((doc) => fromFirestore(doc.data()) as MediaAsset);
  },

  async deleteMediaReference(userId: string, mediaId: string) {
    await deleteDoc(userSubDoc(userId, COLLECTIONS.MEDIA, mediaId));
  },
};

export { COLLECTIONS };