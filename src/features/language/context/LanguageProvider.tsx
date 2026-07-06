"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  defaultStudyLanguageId,
  getStudyLanguage,
  isStudyLanguageId,
  type StudyLanguage,
  type StudyLanguageId,
} from "../languageConfig";

const languageStorageKey = "english-study:study-language";
const languageChangeEventName = "english-study-language-change";

type LanguageContextValue = {
  language: StudyLanguage;
  languageId: StudyLanguageId;
  setLanguageId: (languageId: StudyLanguageId) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageId = useSyncExternalStore(
    subscribeToLanguageChanges,
    getStoredLanguageId,
    getDefaultLanguageId,
  );

  const value = useMemo(
    () => ({
      language: getStudyLanguage(languageId),
      languageId,
      setLanguageId: setStoredLanguageId,
    }),
    [languageId],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useStudyLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useStudyLanguage must be used within LanguageProvider.");
  }

  return value;
}

function subscribeToLanguageChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(languageChangeEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(languageChangeEventName, onStoreChange);
  };
}

function getDefaultLanguageId() {
  return defaultStudyLanguageId;
}

function getStoredLanguageId() {
  const storedLanguage = window.localStorage.getItem(languageStorageKey);

  if (storedLanguage && isStudyLanguageId(storedLanguage)) {
    return storedLanguage;
  }

  return defaultStudyLanguageId;
}

function setStoredLanguageId(nextLanguageId: StudyLanguageId) {
  window.localStorage.setItem(languageStorageKey, nextLanguageId);
  window.dispatchEvent(new Event(languageChangeEventName));
}
