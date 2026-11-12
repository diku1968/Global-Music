import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AudioTrack } from '../types';

export const trackService = {
  async saveTrack(track: Omit<AudioTrack, 'audioBuffer' | 'audioBlob'>): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to save track');

    const path = `projects/${track.projectId}/tracks/${track.trackId}`;
    try {
      const data: Record<string, unknown> = {
        trackId: track.trackId,
        projectId: track.projectId,
        name: track.name.slice(0, 100),
        instrument: track.instrument,
        musicianId: currentUid,
        musicianName: (track.musicianName || 'Musician').slice(0, 80),
        duration: Number(track.duration) || 0,
        startOffset: Number(track.startOffset) || 0,
        volume: Number(track.volume) || 1.0,
        pan: Number(track.pan) || 0.0,
        isMuted: Boolean(track.isMuted),
        isSolo: Boolean(track.isSolo),
        createdAt: track.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (track.audioUrl) {
        data.audioUrl = track.audioUrl;
      }

      await setDoc(doc(db, 'projects', track.projectId, 'tracks', track.trackId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async listTracks(projectId: string): Promise<AudioTrack[]> {
    const path = `projects/${projectId}/tracks`;
    try {
      const tracksRef = collection(db, 'projects', projectId, 'tracks');
      const snap = await getDocs(tracksRef);
      const tracks: AudioTrack[] = [];
      snap.forEach((d) => {
        tracks.push(d.data() as AudioTrack);
      });
      return tracks;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateTrackMix(
    projectId: string,
    trackId: string,
    updates: Partial<AudioTrack>
  ): Promise<void> {
    const path = `projects/${projectId}/tracks/${trackId}`;
    try {
      const cleanUpdates: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      if (updates.volume !== undefined) cleanUpdates.volume = updates.volume;
      if (updates.pan !== undefined) cleanUpdates.pan = updates.pan;
      if (updates.isMuted !== undefined) cleanUpdates.isMuted = updates.isMuted;
      if (updates.isSolo !== undefined) cleanUpdates.isSolo = updates.isSolo;
      if (updates.startOffset !== undefined) cleanUpdates.startOffset = updates.startOffset;
      if (updates.name) cleanUpdates.name = updates.name.slice(0, 100);

      await updateDoc(doc(db, 'projects', projectId, 'tracks', trackId), cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteTrack(projectId: string, trackId: string): Promise<void> {
    const path = `projects/${projectId}/tracks/${trackId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'tracks', trackId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};
