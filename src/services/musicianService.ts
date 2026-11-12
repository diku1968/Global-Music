import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { MusicianProfile } from '../types';

export const musicianService = {
  async getMusicianProfile(userId: string): Promise<MusicianProfile | null> {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (!docSnap.exists()) return null;
      return docSnap.data() as MusicianProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveMusicianProfile(profile: MusicianProfile): Promise<void> {
    const path = `users/${profile.userId}`;
    try {
      const cleanData: Record<string, unknown> = {
        userId: profile.userId,
        displayName: profile.displayName.slice(0, 80),
        primaryInstrument: profile.primaryInstrument.slice(0, 60),
        updatedAt: new Date().toISOString(),
      };

      if (profile.email) cleanData.email = profile.email.slice(0, 120);
      if (profile.photoURL) cleanData.photoURL = profile.photoURL.slice(0, 500);
      if (profile.bio) cleanData.bio = profile.bio.slice(0, 1000);
      if (profile.country) cleanData.country = profile.country.slice(0, 100);
      if (profile.preferredLanguage) cleanData.preferredLanguage = profile.preferredLanguage.slice(0, 50);
      if (profile.experienceLevel) cleanData.experienceLevel = profile.experienceLevel.slice(0, 50);
      if (profile.isAvailableForCollab !== undefined) cleanData.isAvailableForCollab = Boolean(profile.isAvailableForCollab);
      if (profile.instruments && Array.isArray(profile.instruments)) cleanData.instruments = profile.instruments.slice(0, 20);
      if (profile.skills && Array.isArray(profile.skills)) cleanData.skills = profile.skills.slice(0, 20);
      if (profile.portfolioLinks && Array.isArray(profile.portfolioLinks)) cleanData.portfolioLinks = profile.portfolioLinks.slice(0, 10);
      if (profile.followersCount !== undefined) cleanData.followersCount = profile.followersCount;
      if (profile.followingCount !== undefined) cleanData.followingCount = profile.followingCount;
      if (profile.createdAt) cleanData.createdAt = profile.createdAt;
      else cleanData.createdAt = new Date().toISOString();

      await setDoc(doc(db, 'users', profile.userId), cleanData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async listMusicians(params?: {
    instrument?: string;
    searchQuery?: string;
    availableOnly?: boolean;
  }): Promise<MusicianProfile[]> {
    const path = 'users';
    try {
      const usersRef = collection(db, 'users');
      // Fetch public profiles
      const q = query(usersRef, limit(100));
      const snapshot = await getDocs(q);

      let musicians: MusicianProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as MusicianProfile;
        musicians.push(data);
      });

      // Filter in-memory for flexible multi-field search
      if (params?.instrument && params.instrument !== 'All') {
        const inst = params.instrument.toLowerCase();
        musicians = musicians.filter(
          (m) =>
            m.primaryInstrument?.toLowerCase() === inst ||
            m.instruments?.some((i) => i.toLowerCase() === inst)
        );
      }

      if (params?.availableOnly) {
        musicians = musicians.filter((m) => m.isAvailableForCollab);
      }

      if (params?.searchQuery && params.searchQuery.trim().length > 0) {
        const term = params.searchQuery.toLowerCase().trim();
        musicians = musicians.filter(
          (m) =>
            m.displayName?.toLowerCase().includes(term) ||
            m.bio?.toLowerCase().includes(term) ||
            m.country?.toLowerCase().includes(term) ||
            m.skills?.some((s) => s.toLowerCase().includes(term))
        );
      }

      return musicians;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async followMusician(targetUserId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to follow');
    const followId = `${currentUid}_${targetUserId}`;
    const path = `follows/${followId}`;
    try {
      await setDoc(doc(db, 'follows', followId), {
        followerId: currentUid,
        targetUserId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async unfollowMusician(targetUserId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to unfollow');
    const followId = `${currentUid}_${targetUserId}`;
    const path = `follows/${followId}`;
    try {
      await deleteDoc(doc(db, 'follows', followId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async isFollowing(targetUserId: string): Promise<boolean> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return false;
    const followId = `${currentUid}_${targetUserId}`;
    const path = `follows/${followId}`;
    try {
      const snap = await getDoc(doc(db, 'follows', followId));
      return snap.exists();
    } catch {
      return false;
    }
  },
};
