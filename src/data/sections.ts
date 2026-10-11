/**
 * Metadata for each explorable section / interactive object.
 * UI-only (no 3D code) so the HUD, navigation and classic page share labels.
 */
export const SECTION_IDS = ['about', 'projects', 'skills', 'experience', 'funfacts', 'social', 'contact'] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface SectionMeta {
  id: SectionId
  /** Panel / navigation title. */
  title: string
  /** Short label for compact navigation. */
  navLabel: string
  /** The 3D object that represents this section. */
  object: string
  /** Short hint used in tooltips and the object guide. */
  hint: string
}

export const SECTIONS: Record<SectionId, SectionMeta> = {
  about: { id: 'about', title: 'About Me', navLabel: 'About', object: 'Computer Monitors', hint: 'Who I am and what drives me' },
  projects: { id: 'projects', title: 'My Projects', navLabel: 'Projects', object: 'Project Display Wall', hint: 'Things I have built' },
  skills: { id: 'skills', title: 'Technical Skills', navLabel: 'Skills', object: 'Bookshelf', hint: 'My technical toolbox' },
  experience: { id: 'experience', title: 'Experience & Journey', navLabel: 'Experience', object: 'Desk Notebook', hint: 'Career and learning timeline' },
  funfacts: { id: 'funfacts', title: 'Fun Facts', navLabel: 'Fun Facts', object: 'Coffee Mug', hint: 'The person behind the code' },
  social: { id: 'social', title: 'Social Profiles', navLabel: 'Socials', object: 'Window', hint: 'Find me around the web' },
  contact: { id: 'contact', title: 'Contact Me', navLabel: 'Contact', object: 'Door', hint: 'Send me a message' },
}

export const SECTION_LIST: SectionMeta[] = SECTION_IDS.map((id) => SECTIONS[id])
