export const modernNavigationItems = [
  { id: "modern-about", label: "About", key: "A", accent: "gold" },
  { id: "modern-experience", label: "Experience", key: "E", accent: "blue" },
  { id: "modern-projects", label: "Projects", key: "P", accent: "pink" },
  { id: "modern-skills", label: "Skills", key: "S", accent: "green" },
  { id: "modern-contact", label: "Contact", key: "C", accent: "slate" },
] as const

export type ModernSectionId = (typeof modernNavigationItems)[number]["id"]
