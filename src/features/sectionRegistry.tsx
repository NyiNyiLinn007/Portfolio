import type { ComponentType } from 'react'
import { AppWindow, Coffee, DoorOpen, LayoutGrid, Library, Monitor, NotebookPen } from 'lucide-react'
import type { SectionId } from '@/data/sections'
import { AboutContent } from './about/AboutContent'
import { ProjectsContent } from './projects/ProjectsContent'
import { SkillsContent } from './skills/SkillsContent'
import { ExperienceContent } from './experience/ExperienceContent'
import { FunFactsContent } from './funfacts/FunFactsContent'
import { SocialContent } from './social/SocialContent'
import { ContactContent } from './contact/ContactContent'

/** Maps each section to its icon and content component (shared by the 3D panels and the classic page). */
export const SECTION_REGISTRY: Record<SectionId, { Icon: typeof Monitor; Content: ComponentType }> = {
  about: { Icon: Monitor, Content: AboutContent },
  projects: { Icon: LayoutGrid, Content: ProjectsContent },
  skills: { Icon: Library, Content: SkillsContent },
  experience: { Icon: NotebookPen, Content: ExperienceContent },
  funfacts: { Icon: Coffee, Content: FunFactsContent },
  social: { Icon: AppWindow, Content: SocialContent },
  contact: { Icon: DoorOpen, Content: ContactContent },
}
