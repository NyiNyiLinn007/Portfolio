/**
 * Data models for all editable portfolio content.
 * Content lives in `src/data/portfolio.ts` (or can be served by a backend that
 * returns the same `PortfolioData` shape from `GET /api/portfolio`).
 */

export type SocialPlatform = 'github' | 'linkedin' | 'website' | 'x' | 'email' | 'phone' | 'stackoverflow' | 'devto' | 'other'

export interface SocialLink {
  platform: SocialPlatform
  label: string
  /** Absolute URL (https:, mailto: or tel:). Leave empty ('') to show the link as "not configured". */
  url: string
  /** Optional handle shown under the label, e.g. "@yourname". */
  handle?: string
}

export type SkillCategoryId = 'backend' | 'frontend' | 'database' | 'tools' | 'soft'

export interface Skill {
  name: string
  /** Optional short note, e.g. "JWT, OAuth2, RBAC". */
  detail?: string
  /**
   * Optional self-assessed level. Only rendered when explicitly configured.
   * Intentionally qualitative instead of arbitrary percentages.
   */
  level?: 'Familiar' | 'Proficient' | 'Advanced' | 'Expert'
}

export interface SkillCategory {
  id: SkillCategoryId
  title: string
  description: string
  skills: Skill[]
}

export type ProjectCategory = 'backend' | 'frontend' | 'mobile' | 'experimental'

export interface Project {
  id: string
  name: string
  /** One-line summary shown on cards. */
  summary: string
  /** Longer description shown in the detail view. */
  description: string
  category: ProjectCategory
  tech: string[]
  /** Bullet points shown in the detail view. */
  highlights: string[]
  /** Optional screenshot path (e.g. "/projects/wallet.webp" in /public). A generated cover is used otherwise. */
  image?: string
  /** Leave empty to hide the GitHub button. */
  githubUrl?: string
  /** Leave empty to hide the live demo button. */
  liveUrl?: string
  /** Year or period, e.g. "2024". */
  year?: string
  /** Marks fictional/sample entries so visitors are never misled. */
  isSample?: boolean
  featured?: boolean
}

export type TimelineKind = 'work' | 'education' | 'certification' | 'milestone'

export interface TimelineEntry {
  id: string
  kind: TimelineKind
  title: string
  organization: string
  /** Display period, e.g. "2022 — Present". */
  period: string
  location?: string
  description: string
  tags?: string[]
  isSample?: boolean
}

export interface FunFacts {
  favoriteActivities: string[]
  learningGoals: string[]
  philosophy: string[]
  quote?: { text: string; author: string }
  coffeeOrder?: string
}

/**
 * Display settings for the contact panel.
 * Delivery mode ("demo" vs "api") is configured with the VITE_CONTACT_MODE
 * environment variable — see `.env.example` and `src/services/config.ts`.
 */
export interface ContactSettings {
  /** Shown as an alternative way to reach you. */
  responseTime: string
  availability: string
}

export interface PortfolioData {
  name: string
  initials: string
  /** Optional profile photo in /public (e.g. "/profile.png"). Initials are shown when omitted. */
  photo?: string
  role: string
  tagline: string
  location: string
  email: string
  /** Short introduction for the hero overlay and monitor. */
  intro: string
  /** Biography paragraphs for the About panel and classic page. */
  biography: string[]
  interests: string[]
  currentGoals: string[]
  /** Path to a resume inside /public (e.g. "/resume.pdf"). `null` disables the download button with an explanation. */
  resumePath: string | null
  socialLinks: SocialLink[]
  skills: SkillCategory[]
  experience: TimelineEntry[]
  education: TimelineEntry[]
  projects: Project[]
  funFacts: FunFacts
  contact: ContactSettings
}
