import type { PortfolioData } from "./types"

// Content shared by both portfolio themes.
export const portfolioData = {
  profile: {
    name: "Shantanu Kshatriya",
    headline: "Complex systems, simple solutions.",
    biography: [
      "I am batman"
    ],
    email: "shantanu.kx@gmail.com"
  },
  socialLinks: [
    {
      id: "github",
      platform: "github",
      label: "GitHub",
      url: "https://github.com/binaryBodhi",
      username: "binaryBodhi"
    },
    {
      id: "linkedin",
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/shantanu-kshatriya",
      username: "Shantanu Kshatriya"
    }
  ],
  experience: [
    {
      id: "bootlabs",
      organization: "Bootlabs (HDFC Bank)",
      role: "Software Developer",
      period: {
        start: "2025-08"
      },
      highlights: [
        "Productionized Garuda, an internal release-management platform for HDFC, by resolving logical gaps and defects in an existing Python POC and hardening its Jenkins-driven release workflows for production use.",
        "Refactored the Garuda codebase into modular, production-grade components, improving maintainability and supporting onboarding of additional applications onto the platform.",
        "Developed release-automation capabilities including environment baselining, pending configuration-delta detection, and optimized release-note verification for image-only deployments across GCP environments.",
        "Contributed to platform evolution through frontend development, compliance-ready CI/CD workflows, and Quay image-scan automation; subsequently assigned to lead the Garuda core engineering team."
      ]
    },
    {
      id: "jersey-stem",
      organization: "JerseyStem",
      role: "Software Engineer",
      period: {
        start: "2024-08",
        end: "2025-06"
      },
      highlights: [
        "Built interactive coding modules for middle school students using JavaScript and Scratch’s open-source components, enabling students to learn programming concepts.",
        "Developed RESTful APIs with Node.js and Express and integrated MongoDB to capture coding exercise results, quiz scores, attempts, and other student performance data.",
        "Built a KMeans-based personalization system using scikit-learn to cluster students by learning patterns and recommend Scratch modules targeting concepts that required additional practice."
      ]
    },
    {
      id: "ai-adventures",
      organization: "AI Adventures",
      role: "Machine Learning Engineer",
      period: {
        start: "2021-06",
        end: "2022-08"
      },
      highlights: [
        "Developed a regression-based demand forecasting model for Python, Machine Learning, and Deep Learning courses using historical enrollments, course difficulty ratings, and student feedback to predict future enrollment and support course planning.",
        "Exposed the course-demand forecasting model through a Flask REST API, containerized the service with Docker, and deployed it on AWS EC2 so internal teams could retrieve enrollment forecasts for different courses.",
        "Mentored 15+ undergraduate students through hands-on Python and machine learning coursework, helping them with data preprocessing, model development, evaluation, and debugging across course projects."
      ]
    }
  ],
  skills: [
    {
      id: "languages",
      name: "Programming Languages",
      skills: [
        "Python",
        "JavaScript",
        "SQL"
      ]
    },
    {
      id: "web",
      name: "Web and Backend",
      skills: [
        "React",
        "Node.js",
        "Express",
        "Flask"
      ]
    },
    {
      id: "databases",
      name: "Databases and Backend Platforms",
      skills: [
        "MongoDB",
        "MySQL",
        "Postgres",
        "Firebase"
      ]
    },
    {
      id: "machine-learning",
      name: "Machine Learning and Data",
      skills: [
        "scikit-learn",
        "NumPy",
        "Pandas",
        "OpenCV",
        "NLTK",
        "BERT",
        "Matplotlib"
      ]
    },
    {
      id: "cloud",
      name: "Cloud and DevOps",
      skills: [
        "Jenkins",
        "Quay",
        "GCP",
        "AWS",
        "Kubernetes",
        "Git",
        "GitHub",
        "Docker"
      ]
    }
  ],
  education: [
    {
      id: "masters",
      institution: "Stevens Institute of Technology",
      qualification: "Master of Science",
      field: "Software Engineering",
      period: {
        start: "2022-09",
        end: "2024-05"
      },
      location: "New Jersey, US"
    },
    {
      id: "bachelors",
      institution: "National Institute of Technology, Karnataka",
      qualification: "Bachelor of Technology",
      field: "Computer Science and Engineering",
      period: {
        start: "2017-09",
        end: "2021-05"
      },
      location: "Karnataka, India"
    }
  ]
} satisfies PortfolioData
