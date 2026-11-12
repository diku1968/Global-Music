import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { DirectMessage } from '../types';

export const messageService = {
  async sendMessage(params: {
    receiverId: string;
    text: string;
    senderName?: string;
  }): Promise<DirectMessage> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to send message');

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const path = `messages/${messageId}`;
    try {
      const msg: DirectMessage = {
        messageId,
        senderId: currentUid,
        senderName: params.senderName || 'Musician',
        receiverId: params.receiverId,
        text: params.text.slice(0, 2000),
        createdAt: new Date().toISOString(),
        read: false,
      };

      await setDoc(doc(db, 'messages', messageId), msg);
      return msg;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getMessagesForUser(userId: string): Promise<DirectMessage[]> {
    const path = 'messages';
    try {
      const msgRef = collection(db, 'messages');
      // Fetch received and sent messages
      const qReceived = query(msgRef, where('receiverId', '==', userId), limit(100));
      const qSent = query(msgRef, where('senderId', '==', userId), limit(100));

      const [receivedSnap, sentSnap] = await Promise.all([
        getDocs(qReceived),
        getDocs(qSent),
      ]);

      const messages: DirectMessage[] = [];
      const seen = new Set<string>();

      receivedSnap.forEach((d) => {
        const data = d.data() as DirectMessage;
        if (!seen.has(data.messageId)) {
          seen.add(data.messageId);
          messages.push(data);
        }
      });

      sentSnap.forEach((d) => {
        const data = d.data() as DirectMessage;
        if (!seen.has(data.messageId)) {
          seen.add(data.messageId);
          messages.push(data);
        }
      });

      // Sort by creation date
      return messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    const path = `messages/${messageId}`;
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
