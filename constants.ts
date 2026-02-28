export interface TemplateStyle {
  id: string;
  name: string;
  layout: 'single' | 'two-column';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSans: string;
  fontSerif: string;
  headingColor: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
}

export const RESUME_TEMPLATES: TemplateStyle[] = [
  {
    id: 'modern-slate',
    name: 'Modern Slate',
    layout: 'single',
    primaryColor: '#0f172a', // slate-900
    secondaryColor: '#475569', // slate-600
    accentColor: '#0ea5e9', // sky-500
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Inter', sans-serif",
    headingColor: '#0f172a',
    textColor: '#334155',
    borderColor: '#e2e8f0',
    bgLight: '#f8fafc'
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    layout: 'single',
    primaryColor: '#1e3a8a', // navy-900
    secondaryColor: '#1e40af', // navy-800
    accentColor: '#1d4ed8', // navy-700
    fontSans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSerif: "'Georgia', serif",
    headingColor: '#1e3a8a',
    textColor: '#1f2937',
    borderColor: '#d1d5db',
    bgLight: '#f3f4f6'
  },
  {
    id: 'two-column-modern',
    name: 'Two-Column Modern',
    layout: 'two-column',
    primaryColor: '#0f172a',
    secondaryColor: '#475569',
    accentColor: '#0ea5e9',
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Inter', sans-serif",
    headingColor: '#0f172a',
    textColor: '#334155',
    borderColor: '#e2e8f0',
    bgLight: '#f8fafc'
  },
  {
    id: 'two-column-executive',
    name: 'Two-Column Executive',
    layout: 'two-column',
    primaryColor: '#1e3a8a',
    secondaryColor: '#1e40af',
    accentColor: '#1d4ed8',
    fontSans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSerif: "'Georgia', serif",
    headingColor: '#1e3a8a',
    textColor: '#1f2937',
    borderColor: '#d1d5db',
    bgLight: '#f3f4f6'
  },
  {
    id: 'minimal-charcoal',
    name: 'Minimal Charcoal',
    layout: 'single',
    primaryColor: '#171717', // neutral-900
    secondaryColor: '#404040', // neutral-700
    accentColor: '#737373', // neutral-500
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Inter', sans-serif",
    headingColor: '#171717',
    textColor: '#262626',
    borderColor: '#e5e5e5',
    bgLight: '#fafafa'
  },
  {
    id: 'professional-emerald',
    name: 'Professional Emerald',
    layout: 'single',
    primaryColor: '#064e3b', // emerald-900
    secondaryColor: '#065f46', // emerald-800
    accentColor: '#10b981', // emerald-500
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Libre Baskerville', serif",
    headingColor: '#064e3b',
    textColor: '#111827',
    borderColor: '#d1fae5',
    bgLight: '#f0fdf4'
  },
  {
    id: 'classic-burgundy',
    name: 'Classic Burgundy',
    layout: 'single',
    primaryColor: '#7f1d1d', // red-900
    secondaryColor: '#991b1b', // red-800
    accentColor: '#dc2626', // red-600
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Playfair Display', serif",
    headingColor: '#7f1d1d',
    textColor: '#111827',
    borderColor: '#fee2e2',
    bgLight: '#fef2f2'
  },
  {
    id: 'tech-indigo',
    name: 'Tech Indigo',
    layout: 'single',
    primaryColor: '#312e81', // indigo-900
    secondaryColor: '#3730a3', // indigo-800
    accentColor: '#6366f1', // indigo-500
    fontSans: "'JetBrains Mono', monospace",
    fontSerif: "'Inter', sans-serif",
    headingColor: '#312e81',
    textColor: '#1e293b',
    borderColor: '#e0e7ff',
    bgLight: '#f5f7ff'
  },
  {
    id: 'warm-stone',
    name: 'Warm Stone',
    layout: 'single',
    primaryColor: '#44403c', // stone-800
    secondaryColor: '#78716c', // stone-600
    accentColor: '#d97706', // amber-600
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Cormorant Garamond', serif",
    headingColor: '#44403c',
    textColor: '#292524',
    borderColor: '#e7e5e4',
    bgLight: '#fafaf9'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    layout: 'single',
    primaryColor: '#4c1d95', // violet-900
    secondaryColor: '#5b21b6', // violet-800
    accentColor: '#8b5cf6', // violet-500
    fontSans: "'Inter', sans-serif",
    fontSerif: "'Inter', sans-serif",
    headingColor: '#4c1d95',
    textColor: '#1f2937',
    borderColor: '#ede9fe',
    bgLight: '#f5f3ff'
  }
];
