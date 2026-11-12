import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { CollaborationInvitation } from '../types';

export const invitationService = {
  async sendInvitation(payload: {
    receiverId: string;
    senderName?: string;
    projectId?: string;
    projectTitle?: string;
    instrument?: string;
    message?: string;
  }): Promise<string> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to send invitation');

    const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `invitations/${invitationId}`;
    try {
      const newInv: CollaborationInvitation = {
        invitationId,
        senderId: currentUid,
        senderName: payload.senderName || 'Anonymous Musician',
        receiverId: payload.receiverId,
        projectId: payload.projectId || 'general_collab',
        projectTitle: payload.projectTitle || 'Music Collaboration Project',
        instrument: payload.instrument || 'Instrumentalist',
        message: payload.message || 'Hey, I would love to collaborate on a track with you!',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'invitations', invitationId), newInv);
      return invitationId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserInvitations(userId: string): Promise<{
    received: CollaborationInvitation[];
    sent: CollaborationInvitation[];
  }> {
    const path = 'invitations';
    try {
      const invRef = collection(db, 'invitations');

      // Query received
      const receivedQuery = query(invRef, where('receiverId', '==', userId), limit(50));
      const receivedSnap = await getDocs(receivedQuery);
      const received: CollaborationInvitation[] = [];
      receivedSnap.forEach((d) => received.push(d.data() as CollaborationInvitation));

      // Query sent
      const sentQuery = query(invRef, where('senderId', '==', userId), limit(50));
      const sentSnap = await getDocs(sentQuery);
      const sent: CollaborationInvitation[] = [];
      sentSnap.forEach((d) => sent.push(d.data() as CollaborationInvitation));

      return { received, sent };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const path = `invitations/${invitationId}`;
    try {
      await updateDoc(doc(db, 'invitations', invitationId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
