/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MusicianDiscovery } from './components/discovery/MusicianDiscovery';
import { ProjectsView } from './components/projects/ProjectsView';
import { DirectMessagesView } from './components/messages/DirectMessagesView';
import { MusicianProfileView } from './components/profile/MusicianProfileView';
import { StudioPhasePlaceholder } from './components/studio/StudioPhasePlaceholder';
import { MultitrackStudio } from './components/studio/MultitrackStudio';
import { LiveJamPhasePlaceholder } from './components/livejam/LiveJamPhasePlaceholder';
import { LiveJamRoom } from './components/livejam/LiveJamRoom';
import { UserProfileEditor } from './components/auth/UserProfileEditor';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { MusicianDetailModal } from './components/discovery/MusicianDetailModal';
import { SendInviteModal } from './components/discovery/SendInviteModal';
import { AuthModal } from './components/auth/AuthModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { invitationService } from './services/invitationService';
import { MusicianProfile, NavTab, Project } from './types';

function MainApp() {
  const { user, profile, showProfileEditor, setShowProfileEditor } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeStudioProjectId, setActiveStudioProjectId] = useState<string | undefined>(undefined);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messagePartner, setMessagePartner] = useState<MusicianProfile | null>(null);

  // Musician inspection & invite modal
  const [inspectMusician, setInspectMusician] = useState<MusicianProfile | null>(null);
  const [inviteMusician, setInviteMusician] = useState<MusicianProfile | null>(null);

  const [pendingInvitesCount, setPendingInvitesCount] = useState<number>(0);

  // Poll or fetch pending invites
  useEffect(() => {
    if (user) {
      invitationService.getUserInvitations(user.uid).then((res) => {
        const pending = res.received.filter((i) => i.status === 'pending');
        setPendingInvitesCount(pending.length);
      });
    } else {
      setPendingInvitesCount(0);
    }
  }, [user, currentTab]);

  const handleOpenMessage = (musician: MusicianProfile) => {
    setMessagePartner(musician);
    setCurrentTab('messages');
  };

  const handleProjectCreated = (newProject: Project) => {
    setCurrentTab('projects');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenCreateProject={() => setShowCreateProject(true)}
        pendingInvitesCount={pendingInvitesCount}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Studio Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          pendingInvitesCount={pendingInvitesCount}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {currentTab === 'home' && (
            <DashboardOverview
              onNavigate={setCurrentTab}
              onOpenCreateProject={() => setShowCreateProject(true)}
              onSelectMusician={(m) => setInspectMusician(m)}
            />
          )}

          {currentTab === 'discover' && (
            <MusicianDiscovery onOpenMessage={handleOpenMessage} />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              onOpenCreateProject={() => setShowCreateProject(true)}
              onNavigate={setCurrentTab}
              onOpenInStudio={(projId) => {
                setActiveStudioProjectId(projId);
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'studio' && (
            <MultitrackStudio
              initialProjectId={activeStudioProjectId}
              onNavigateProjects={() => setCurrentTab('projects')}
            />
          )}

          {currentTab === 'livejam' && (
            <LiveJamRoom onNavigate={setCurrentTab} />
          )}

          {currentTab === 'messages' && (
            <DirectMessagesView initialMusician={messagePartner} />
          )}

          {currentTab === 'profile' && <MusicianProfileView />}
        </main>
      </div>

      {/* Profile Setup / Editor Modal */}
      <UserProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Inspect Musician Modal */}
      <MusicianDetailModal
        musician={inspectMusician}
        onClose={() => setInspectMusician(null)}
        onInvite={(m) => {
          setInspectMusician(null);
          setInviteMusician(m);
        }}
        onMessage={(m) => {
          setInspectMusician(null);
          handleOpenMessage(m);
        }}
      />

      {/* Send Invite Modal */}
      <SendInviteModal
        musician={inviteMusician}
        onClose={() => setInviteMusician(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Connectivity Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
