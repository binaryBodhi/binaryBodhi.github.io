import type { PortfolioData } from './types'

/**
 * The single source of truth for the content shown by every portfolio theme.
 * Fill in the profile and add entries to the arrays below as your content is
 * ready. TypeScript will flag missing or incorrectly named fields.
 */
export const portfolioData = {
  profile: {
    name: 'Shantanu Kshatriya',
    headline: 'Full-stack Software Developer | Machine learning enthusiast',
    biography: ["I am batman"],
    email: "shantanu.kx@gmail.com"
  },

  socialLinks: [
    {
        id: "github",
        platform: 'github',
        label: "GitHub",
        url: "https://github.com/binaryBodhi",
        username: "binaryBodhi"
    
    }, 
    {
      id: "linkedin", 
      platform: 'linkedin',
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/shantanu-kshatriya",
      username: "Shantanu Kshatriya"
    },
  ],

  experience: [
    {
      id: "bootlabs",
      organization: "Bootlabs (HDFC Bank)",
      role: "Software Developer",
      period: {
        start: "2025-08"
      }
    },
    {
      id: "jersey-stem",
      organization: "JerseyStem",
      role: "Software Engineer",
      period: {
        start: "2024-08",
        end: "2025-06"
      },
    },
    {
      id: "ai-adventures",
      organization: "AI Adventures",
      role: "Machine Learning Engineer",
      period: {
        start: "2021-06",
        end: "2022-08"
      },
    }
  ],

  skills: [
    {
      id: "languages",
      name: "Programming Languages",
      skills: ["Python", "JavaScript", "SQL"]
    },
    {
      id: "web",
      name: "Web and Backend",
      skills: ["React", "Node.js", "Express", "Flask"]
    },
    {
      id: "databases",
      name: "Databases and Backend Platforms",
      skills: ["MongoDB", "MySQL", "Postgres", "Firebase"]
    },
    {
      id: "machine-learning",
      name: "Machine Learning and Data",
      skills: ["scikit-learn", "NumPy", "Pandas", "OpenCV", "NLTK", "BERT", "Matplotlib"]
    },
    {
      id: "cloud",
      name: "Cloud and DevOps",
      skills: ["Jenkins", "Quay", "GCP", "AWS", "Kubernetes", "Git", "GitHub", "Docker"]
    },
  ],

  education: [
    {
      id: "masters",
      institution: "Stevens Institute of Technology",
      qualification: "Master's of Sc.",
      field: "Software Engineering",
      period: {
        start: "2022-09",
        end: "2024-05"
      },
      location: "New Jersey, US",
    },
    {
      id: "bachelors",
      institution: "National Institute of Technology, Karnataka",
      qualification: "Bachelor's of Technology",
      field: "Computer Science and Engineering",
      period: {
        start: "2017-09",
        end: "2021-05"
      },
      location: "Karnataka, India"
    }
  ],
} satisfies PortfolioData
