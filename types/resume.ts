export interface ResumeContact {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  photo?: string; // base64 data URI, JPEG, max ~300KB
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface ResumeData {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  languages: string[];
  certifications: string[];
}

export type TemplateId = 'modern' | 'classic' | 'minimal';

export const EMPTY_RESUME: ResumeData = {
  contact: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
};

export const SAMPLE_RESUME: ResumeData = {
  contact: {
    fullName: 'Sara Al Mansoori',
    jobTitle: 'Senior Marketing Manager',
    email: 'sara@example.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
    linkedin: 'linkedin.com/in/example',
  },
  summary: 'Marketing leader with 8 years of experience driving growth for consumer brands across the GCC. Proven track record in digital campaigns, team leadership, and data-driven strategy.',
  experience: [
    {
      id: '1',
      company: 'Gulf Retail Group',
      role: 'Senior Marketing Manager',
      location: 'Dubai, UAE',
      startDate: 'Mar 2021',
      endDate: 'Present',
      bullets: [
        'Led a team of 6 marketers across paid, content, and social channels',
        'Grew online revenue 45% year over year through performance campaigns',
        'Launched the brand across 3 new GCC markets',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'American University of Sharjah',
      degree: 'Bachelor of Business Administration',
      field: 'Marketing',
      location: 'Sharjah, UAE',
      startDate: '2012',
      endDate: '2016',
    },
  ],
  skills: ['Digital Marketing', 'Team Leadership', 'Google Analytics', 'SEO', 'Content Strategy'],
  projects: [],
  languages: ['English (Native)', 'Arabic (Fluent)'],
  certifications: ['Google Ads Certified', 'HubSpot Content Marketing'],
};
