import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Project } from '../types';

export const projectService = {
  async createProject(data: {
    title: string;
    description?: string;
    genre?: string;
    bpm: number;
    musicKey?: string;
    timeSignature?: string;
    requiredInstruments?: Project['requiredInstruments'];
    isPublic?: boolean;
    ownerName?: string;
  }): Promise<Project> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error('Authentication required to create project');

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const path = `projects/${projectId}`;
    try {
      const newProject: Project = {
        projectId,
        title: data.title.slice(0, 120),
        description: (data.description || '').slice(0, 2000),
        genre: (data.genre || 'Alternative Rock').slice(0, 60),
        bpm: data.bpm || 120,
        musicKey: (data.musicKey || 'C Major').slice(0, 30),
        timeSignature: (data.timeSignature || '4/4').slice(0, 20),
        ownerId: currentUid,
        ownerName: (data.ownerName || 'Project Creator').slice(0, 80),
        requiredInstruments: data.requiredInstruments || ['Guitar', 'Bass', 'Drums', 'Vocals'],
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        status: 'open',
        trackCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'projects', projectId), newProject);
      return newProject;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async listPublicProjects(limitCount = 50): Promise<Project[]> {
    const path = 'projects';
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('isPublic', '==', true), limit(limitCount));
      const snap = await getDocs(q);
      const projects: Project[] = [];
      snap.forEach((d) => projects.push(d.data() as Project));
      return projects;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const path = 'projects';
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('ownerId', '==', userId), limit(50));
      const snap = await getDocs(q);
      const projects: Project[] = [];
      snap.forEach((d) => projects.push(d.data() as Project));
      return projects;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getProject(projectId: string): Promise<Project | null> {
    const path = `projects/${projectId}`;
    try {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (!snap.exists()) return null;
      return snap.data() as Project;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },
};
