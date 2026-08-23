/**
 * The complete content contract shared by every portfolio theme.
 *
 * Keep this file presentation-neutral: it should describe the content itself,
 * not how the retro or modern theme displays it.
 */
export interface PortfolioData {
  profile: Profile
  socialLinks: SocialLink[]
  experience: Experience[]
  projects?: Project[]
  skills: SkillGroup[]
  education: Education[]
}

export interface Profile {
  name: string
  headline: string
  tagline?: string
  biography: string[]
  location?: string
  email?: string
  portrait?: ImageAsset
  availability?: string
}

export interface SocialLink {
  id: string
  platform: SocialPlatform
  label: string
  url: string
  username?: string
}

export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'email'
  | 'website'
  | 'other'

export interface Experience {
  id: string
  organization: string
  role: string
  period: DateRange
  location?: string
  image?: ImageAsset
  summary?: string
  highlights?: string[]
  technologies?: string[]
}

export interface Project {
  id: string
  title: string
  summary: string
  description?: string
  technologies: string[]
  highlights?: string[]
  image?: ImageAsset
  links: ProjectLink[]
  featured?: boolean
}

export interface ProjectLink {
  label: string
  url: string
  kind: ProjectLinkKind
}

export type ProjectLinkKind =
  | 'live'
  | 'source'
  | 'case-study'
  | 'other'

export interface SkillGroup {
  id: string
  name: string
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  qualification: string
  field?: string
  period: DateRange
  location?: string
  highlights?: string[]
}

export interface DateRange {
  /** Use YYYY or YYYY-MM so each theme can choose how to format the date. */
  start: string
  /** Leave undefined when the experience or education is ongoing. */
  end?: string
}

export interface ImageAsset {
  src: string
  alt: string
}
