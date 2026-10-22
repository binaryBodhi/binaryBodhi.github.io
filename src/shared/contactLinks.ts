import type { Profile, SocialLink } from "../data/types"

export function getContactLinks(profile: Profile, socialLinks: SocialLink[]) {
  const candidates = [
    ...socialLinks,
    ...(profile.email ? [{ id: "email", label: "Email", url: `mailto:${profile.email}` }] : []),
  ]
  const seen = new Set<string>()
  return candidates.flatMap((link) => {
    const url = link.url.trim()
    const key = /^mailto:/i.test(url) ? url.toLowerCase() : url
    if (seen.has(key)) return []
    seen.add(key)
    return [{ ...link, url, external: /^https?:\/\//i.test(url) }]
  })
}
