'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResumeData, EMPTY_RESUME, TemplateId } from '@/types/resume';

const STORAGE_KEY = 'addify-resume-draft';
const TEMPLATE_KEY = 'addify-resume-template';

export function useResumeStorage() {
  const [resume, setResume] = useState<ResumeData>(EMPTY_RESUME);
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setResume(JSON.parse(stored));
      const storedTemplate = localStorage.getItem(TEMPLATE_KEY);
      if (storedTemplate) setTemplate(storedTemplate as TemplateId);
    } catch (e) {
      console.warn('Failed to load resume draft:', e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      } catch (e) {
        console.warn('Failed to save resume draft:', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [resume, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TEMPLATE_KEY, template);
    } catch (e) {
      console.warn('Failed to save template:', e);
    }
  }, [template, loaded]);

  const reset = useCallback(() => {
    setResume(EMPTY_RESUME);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { resume, setResume, template, setTemplate, loaded, reset };
}
