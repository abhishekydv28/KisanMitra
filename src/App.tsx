/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { CropScanTab } from './components/CropScanTab';
import { TreatmentsTab } from './components/TreatmentsTab';
import { HistoryTab } from './components/HistoryTab';
import { KisanSahayakTab } from './components/KisanSahayakTab';
import { CameraScanModal } from './components/CameraScanModal';
import { VoiceModal } from './components/VoiceModal';
import { ProfileModal } from './components/ProfileModal';
import { INITIAL_SCANS } from './data/mockData';
import { CropScanRecord, Language } from './types';
import { triggerHaptic } from './utils/speech';

export default function App() {
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<NavTab>('crop-scan');
  const [scans, setScans] = useState<CropScanRecord[]>(INITIAL_SCANS);
  const [selectedScanId, setSelectedScanId] = useState<string | undefined>(undefined);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleStartCamera = () => {
    setUploadedFile(null);
    setIsCameraOpen(true);
  };

  const handleUploadFile = (file: File) => {
    setUploadedFile(file);
    setIsCameraOpen(true);
  };

  const handleScanComplete = (newScan: CropScanRecord) => {
    setScans((prev) => [newScan, ...prev.filter((s) => s.id !== newScan.id)]);
  };

  const handleSelectScan = (scan: CropScanRecord) => {
    setSelectedScanId(scan.id);
    setActiveTab('treatments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = (scanId: string, status: 'treated' | 'resolved') => {
    setScans((prev) =>
      prev.map((s) =>
        s.id === scanId
          ? {
              ...s,
              status,
              statusHindi: status === 'resolved' ? 'ठीक हुआ (Resolved)' : 'इलाज जारी (Treated)',
              statusEnglish: status === 'resolved' ? 'Resolved (Cured)' : 'In Progress (Treated)',
            }
          : s
      )
    );
  };

  const handleVoiceQuestion = (query: string) => {
    // If the query mentions tomato or rust, filter or navigate
    if (query.includes('टमाटर') || query.toLowerCase().includes('tomato')) {
      setSelectedScanId('scan-1');
      setActiveTab('treatments');
    } else if (query.includes('गेहूं') || query.toLowerCase().includes('wheat')) {
      setSelectedScanId('scan-2');
      setActiveTab('treatments');
    } else {
      setActiveTab('kisan-sahayak');
    }
  };

  const getTabDisplayName = () => {
    switch (activeTab) {
      case 'crop-scan':
        return language === 'hi' ? 'फसल जांच' : 'Crop Scan';
      case 'treatments':
        return language === 'hi' ? 'उपचार व दवा' : 'Treatments';
      case 'crop-history':
        return language === 'hi' ? 'खेत इतिहास' : 'History Log';
      case 'kisan-sahayak':
        return language === 'hi' ? 'किसान सहायक' : 'Help Assistant';
      default:
        return 'Crop Scan';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf4] text-[#1a1c19] flex flex-col selection:bg-[#bbf0b7]">
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={toggleLanguage}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentTabName={getTabDisplayName()}
      />

      {/* Main Container constrained to ergonomic mobile frame */}
      <main className="flex-1 w-full max-w-md mx-auto pt-20 pb-24 px-5">
        {activeTab === 'crop-scan' && (
          <CropScanTab
            language={language}
            scans={scans}
            onStartCamera={handleStartCamera}
            onUploadFile={handleUploadFile}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onSelectScan={handleSelectScan}
            onViewAllHistory={() => {
              triggerHaptic(20);
              setActiveTab('crop-history');
            }}
          />
        )}

        {activeTab === 'treatments' && (
          <TreatmentsTab
            language={language}
            scans={scans}
            selectedScanId={selectedScanId}
          />
        )}

        {activeTab === 'crop-history' && (
          <HistoryTab
            language={language}
            scans={scans}
            onSelectScan={handleSelectScan}
            onUpdateStatus={handleUpdateStatus}
            onStartNewScan={handleStartCamera}
          />
        )}

        {activeTab === 'kisan-sahayak' && (
          <KisanSahayakTab language={language} />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedScanId(undefined);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
      />

      {/* Modals */}
      <CameraScanModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        language={language}
        onScanComplete={handleScanComplete}
        onViewRemedy={(scan) => {
          setSelectedScanId(scan.id);
          setActiveTab('treatments');
        }}
        initialUploadedFile={uploadedFile}
      />

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        onQuestionSubmit={handleVoiceQuestion}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        onToggleLanguage={toggleLanguage}
      />
    </div>
  );
}
