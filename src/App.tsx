/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenState, CategoryId, PauseItem } from './types';
import { PAUSES } from './data/pauses';
import { getRandomCompletionMessage } from './data/messages';
import { getStoredSoundPreference, setStoredSoundPreference } from './utils/audio';
import { getStoredVoicePreference, setStoredVoicePreference } from './utils/speech';
import { getCurrentShiftInfo, selectPauseForShift } from './utils/greeting';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { PauseScreen } from './components/PauseScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { ExerciseCatalogModal } from './components/ExerciseCatalogModal';
import { MoodChipsModal } from './components/MoodChipsModal';
import { getRecommendedPause } from './utils/geminiRecommend';
import { getSessionCareMinutes, incrementSessionCareMinutes } from './utils/sessionCare';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('inicio');
  const [currentPause, setCurrentPause] = useState<PauseItem>(PAUSES[0]);
  const [completionMessage, setCompletionMessage] = useState<string>('');
  const [invitationPhrase, setInvitationPhrase] = useState<string | undefined>(undefined);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getStoredSoundPreference);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(getStoredVoicePreference);
  const [totalSessionMinutes, setTotalSessionMinutes] = useState<number>(getSessionCareMinutes);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [isMoodLoading, setIsMoodLoading] = useState<boolean>(false);

  // Dark mode setup: default to system preference, allow manual toggle
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Keep dark class synced on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sound preference toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      setStoredSoundPreference(next);
      return next;
    });
  }, []);

  // Voice narration preference toggle ("Solo escuchar")
  const handleToggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      setStoredVoicePreference(next);
      return next;
    });
  }, []);

  const handleToggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // 1-touch start from "Tomar mi minuto"
  // Dynamically factors in night shift: prioritizes calm breathing and eye rest, avoids intense activation
  const handleStartRandom = useCallback(() => {
    const shift = getCurrentShiftInfo();
    const chosen = selectPauseForShift(PAUSES, shift.isNightShift);
    setCurrentPause(chosen);
    setInvitationPhrase(undefined);
    setScreen('pausa');
  }, []);

  // 1-touch start from Category card (Random from selected category)
  const handleSelectCategory = useCallback((categoryId: CategoryId) => {
    const categoryPauses = PAUSES.filter((p) => p.categoria === categoryId);
    const randomIndex = Math.floor(Math.random() * categoryPauses.length);
    const chosen = categoryPauses[randomIndex] || PAUSES[0];
    setCurrentPause(chosen);
    setInvitationPhrase(undefined);
    setScreen('pausa');
  }, []);

  // Start specific pause from catalog
  const handleSelectSpecificPause = useCallback((pause: PauseItem) => {
    setCurrentPause(pause);
    setInvitationPhrase(undefined);
    setScreen('pausa');
  }, []);

  // Submit chips from "¿Cómo llegas a este minuto?"
  const handleMoodSubmit = useCallback(async (selectedChips: string[]) => {
    setIsMoodLoading(true);
    try {
      const result = await getRecommendedPause(selectedChips);
      setCurrentPause(result.pause);
      setInvitationPhrase(result.frase);
      setIsMoodModalOpen(false);
      setScreen('pausa');
    } finally {
      setIsMoodLoading(false);
    }
  }, []);

  // Pause completed (60s timer finished)
  const handlePauseCompleted = useCallback(() => {
    const updatedMinutes = incrementSessionCareMinutes();
    setTotalSessionMinutes(updatedMinutes);
    setCompletionMessage(getRandomCompletionMessage());
    setScreen('cierre');
  }, []);

  // Exit from pause screen
  const handleExitPause = useCallback(() => {
    setInvitationPhrase(undefined);
    setScreen('inicio');
  }, []);

  // "Otro minuto" from completion screen
  const handleAnotherMinute = useCallback(() => {
    const shift = getCurrentShiftInfo();
    const available = PAUSES.filter((p) => p.id !== currentPause.id);
    const chosen = selectPauseForShift(available.length > 0 ? available : PAUSES, shift.isNightShift);
    setCurrentPause(chosen);
    setInvitationPhrase(undefined);
    setScreen('pausa');
  }, [currentPause]);

  // "Volver al turno"
  const handleReturnToShift = useCallback(() => {
    setInvitationPhrase(undefined);
    setScreen('inicio');
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      {screen !== 'pausa' && (
        <Header
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          voiceEnabled={voiceEnabled}
          onToggleVoice={handleToggleVoice}
          isDark={isDark}
          onToggleDark={handleToggleDark}
          onOpenInfo={() => setIsCatalogOpen(true)}
          showInfoButton={true}
        />
      )}

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        {screen === 'inicio' && (
          <HomeScreen
            onStartRandom={handleStartRandom}
            onSelectCategory={handleSelectCategory}
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onOpenMood={() => setIsMoodModalOpen(true)}
          />
        )}

        {screen === 'pausa' && (
          <PauseScreen
            pause={currentPause}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            onExit={handleExitPause}
            onComplete={handlePauseCompleted}
            invitationPhrase={invitationPhrase}
          />
        )}

        {screen === 'cierre' && (
          <CompletionScreen
            message={completionMessage}
            completedPause={currentPause}
            totalSessionMinutes={totalSessionMinutes}
            onAnotherMinute={handleAnotherMinute}
            onReturnToShift={handleReturnToShift}
          />
        )}
      </main>

      {/* Catalog modal for browsing specific exercises */}
      <ExerciseCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectPause={handleSelectSpecificPause}
      />

      {/* "¿Cómo llegas a este minuto?" Modal with chips */}
      <MoodChipsModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSubmit={handleMoodSubmit}
        isLoading={isMoodLoading}
      />
    </div>
  );
}
