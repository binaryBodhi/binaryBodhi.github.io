import type { PortfolioData } from "./types"

// Content shared by both portfolio themes.
export const portfolioData = {
  profile: {
    name: "Shantanu Kshatriya",
    headline: "Complex systems, simple solutions.",
    biography: [
      "I am a software engineer with a passion for building complex systems and simplifying them into elegant solutions. My expertise spans full-stack development, and artificial intelligence, allowing me to tackle diverse challenges across the software development domains.",
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
  projects:[
    {
      id: "playlist-creation-service",
      title: "Playlist Creation Service",
      summary: "Simple service to create a new Spotify playlist from an existing playlist based on song release year.",
      description:
        "Simple service to create new playlist from existing Spotify playlist based on song release year.",
      technologies: ["Python", "Spotipy", "Flask"],
      highlights: ["Creates a new playlist from an existing Spotify playlist", "Groups songs by release year", "Python-based service"],
      links: [{label: "GitHub",url: "https://github.com/binaryBodhi/playlist-creation-service", kind: "source"}],
      featured: true,
    },
    {
      id: "tripwithme",
      title: "TripWithMe",
      summary:
        "A full-stack ride-sharing and cab booking platform that helps users create trips, find matches along shared routes, and split travel costs efficiently.",
      description:
        "TripWithMe is a full-stack web application designed to simplify cab booking and trip coordination.",
      technologies: [
        "React", "Vite", "JavaScript", "Python", "FastAPI", "MongoDB", "Beanie", "JWT", "Axios", "CSS", "Docker", "Docker Compose", "Pytest", "Vitest", "React Testing Library"
      ],
      highlights: [
        "Secure JWT-based authentication and user registration",
        "Create, search, join, and leave trips",
        "Real-time trip updates and notifications",
        "Past trip history with repeat trip functionality",
        "Responsive, modern UI with dark/light mode support",
        "Metrics dashboard for tracking completed rides and travelers"
      ],
      links: [{label: "GitHub", url: "https://github.com/binaryBodhi/tripWithME", kind: "source"}],
      featured: true
    }, 
    {
      id: "ai-code-bug-predictor",
      title: "AI Code Reviewer & Bug Predictor",
      summary:
        "An AI-powered C code bug prediction app that uses CodeBERT embeddings and a trained machine learning classifier to analyze code snippets and flag buggy vs. clean code in real time.",
      description:
        "This project combines transformer-based code understanding with a practical web interface to help predict whether a C code snippet is likely to contain bugs.",
      technologies: [
        "Python","Flask", "CodeBERT", "Hugging Face Transformers", "scikit-learn", "Random Forest Classifier", "NumPy","joblib","JavaScript", "HTML", "CSS", "Tailwind CSS", "C", "Machine Learning", "Git"
      ],
      highlights: [
        "Predicts whether submitted C code is buggy or clean","Uses transformer-based embeddings from Microsoft CodeBERT","Returns confidence score alongside the prediction", "Built with a Flask backend and lightweight browser UI", "Trained on the CodeXGLUE defect detection dataset", "Includes unit tests for backend validation"
      ],
      links: [{label: "GitHub", url: "https://github.com/binaryBodhi/tripWithME", kind: "source"}],
      featured: true
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
