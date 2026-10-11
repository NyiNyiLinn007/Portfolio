import type { PortfolioData } from '@/types/portfolio'

/**
 * ============================================================================
 *  PORTFOLIO CONTENT — edit this file to personalise the Developer Room.
 * ============================================================================
 *
 *  - Entries marked `isSample: true` are fictional demos and display a "Sample"
 *    badge. Real entries must not carry the flag.
 *  - Leave a URL empty ('') to hide its button instead of showing a broken link.
 *  - `resumePath` / `photo` point to files in /public.
 *
 *  No 3D code needs to change when you edit this file.
 */
export const portfolio: PortfolioData = {
  name: 'Nyi Nyi Linn',
  initials: 'NN',
  photo: '/profile.png',
  role: 'Full Stack Web Application Developer',
  tagline: 'Java · Spring Boot · Angular · Core banking & digital wallets',
  location: 'Yangon, Myanmar',
  email: 'nyinyilinn@ucssittway.edu.mm',
  intro:
    "Hi, I'm Nyi Nyi Linn, a Full Stack Web Application Developer who builds secure, scalable backend services and purposeful web experiences with Java, Spring Boot and Angular.",
  biography: [
    "I'm a software developer who enjoys turning complex requirements into dependable systems and calm, intuitive interfaces.",
    "I'm passionate about building full-stack applications with Java, Spring Boot and Angular. Since 2024 I've worked as a Full Stack Developer at Myanmar Information Technology on financial technology products: core banking systems, mobile wallet APIs and admin portals where security and reliability come first.",
    'I enjoy solving hard problems, writing clean and scalable code, and keep exploring new technologies, architectures and design patterns.',
  ],
  interests: [
    'Financial technology: core banking & digital wallets',
    'Secure, scalable backend services & REST APIs',
    'Angular interfaces that connect cleanly to backend APIs',
    'Deployment with Tomcat, Linux / Windows Server, GitLab CI/CD & Azure',
    'Clean code, architecture & design patterns',
  ],
  currentGoals: [
    'Open to work and available for new opportunities',
    'Keep exploring new technologies, architectures and design patterns',
    'Write clean, scalable code that stays useful as it grows',
  ],
  resumePath: '/Nyi_Nyi_Linn.pdf',
  socialLinks: [
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/nyi-nyi-linn-3b29873a1', handle: 'in/nyi-nyi-linn' },
    { platform: 'email', label: 'Email', url: 'mailto:nyinyilinn@ucssittway.edu.mm', handle: 'nyinyilinn@ucssittway.edu.mm' },
    { platform: 'phone', label: 'Phone', url: 'tel:+959896108859', handle: '+95 989 610 8859' },
  ],
  skills: [
    {
      id: 'backend',
      title: 'Programming & Frameworks',
      description: 'Full-stack development, from secure Spring Boot services and REST APIs to Angular frontends.',
      skills: [
        { name: 'Java', detail: 'Secure, scalable backend services' },
        { name: 'Spring Boot', detail: 'REST APIs for core banking & wallet systems' },
        { name: 'REST APIs', detail: 'Design and integration with Angular frontends' },
        { name: 'Authentication & RBAC', detail: 'Secure user authentication, role-based access control' },
      ],
    },
    {
      id: 'frontend',
      title: 'Frontend',
      description: 'Angular interfaces that connect cleanly to backend APIs.',
      skills: [
        { name: 'Angular', detail: 'Admin portals and API-driven interfaces' },
        { name: 'API integration', detail: 'Connecting Angular frontends to REST services' },
      ],
    },
    {
      id: 'database',
      title: 'Databases',
      description: 'Relational data design and management for transactional systems.',
      skills: [
        { name: 'PostgreSQL', detail: 'Transactional banking data' },
        { name: 'Microsoft SQL Server (MSSQL)', detail: 'Relational data management' },
      ],
    },
    {
      id: 'tools',
      title: 'Deployment, Cloud & Tools',
      description: 'Deploying and managing application versions, automated delivery and team collaboration.',
      skills: [
        { name: 'Tomcat', detail: 'Application deployment' },
        { name: 'Linux Server · Windows Server', detail: 'Deploying and managing application versions' },
        { name: 'GitLab CI/CD', detail: 'Automated delivery pipelines' },
        { name: 'Azure', detail: 'Cloud platform' },
        { name: 'Git · GitLab', detail: 'Structured branching and code reviews' },
        { name: 'Testing & Debugging', detail: 'Finding root causes fast and shipping with confidence' },
      ],
    },
    {
      id: 'soft',
      title: 'Soft Skills',
      description: 'The habits that make a project run smoothly beyond the code.',
      skills: [{ name: 'Problem-solving' }, { name: 'Communication' }, { name: 'Continuous learning' }, { name: 'Attention to detail' }],
    },
  ],
  experience: [
    {
      id: 'mit-fullstack',
      kind: 'work',
      title: 'Full Stack Developer',
      organization: 'Myanmar Information Technology Pte Ltd',
      period: 'Aug 2024 — Present',
      location: 'Yangon · Full-time',
      description:
        'Develop secure, scalable backend services with Java and Spring Boot, integrate REST APIs with Angular frontends, and build core banking and mobile wallet features with clean, maintainable code.',
      tags: ['Java', 'Spring Boot', 'Angular', 'REST APIs', 'PostgreSQL', 'GitLab CI/CD'],
    },
  ],
  education: [
    {
      id: 'ucs-sittway',
      kind: 'education',
      title: 'Bachelor of Computer Science (B.C.Sc.)',
      organization: 'University of Computer Studies (Sittway)',
      period: '2017 — 2024',
      location: 'Sittway',
      description:
        'Studied the foundations of computer science: programming, data structures, databases and software engineering. Built the problem-solving base I now use on enterprise financial systems.',
    },
  ],
  projects: [
    {
      id: 'core-banking-system',
      name: 'Core Banking System',
      summary: 'Account management, fund transfers, transaction history and secure authentication.',
      description:
        'A core banking solution covering account management, fund transfers, transaction history and secure user authentication. Built for the reliability and security that financial institutions need.',
      category: 'backend',
      tech: ['Java', 'Spring Boot', 'REST API', 'Authentication'],
      highlights: ['Account management', 'Fund transfers and transaction history', 'Secure user authentication'],
      year: 'Enterprise',
      featured: true,
    },
    {
      id: 'core-banking-api-services',
      name: 'Core Banking API Services',
      summary: 'Services behind mobile banking, digital wallets, P2P transfers and merchant payments.',
      description:
        'Services behind mobile banking, digital wallets, P2P transfers and merchant transactions, with role-based access control.',
      category: 'backend',
      tech: ['Java', 'Spring Boot', 'Mobile banking', 'P2P', 'Merchant', 'RBAC'],
      highlights: ['Mobile banking and digital wallet services', 'P2P transfers and merchant transactions', 'Role-based access control'],
      year: 'Enterprise',
      featured: true,
    },
    {
      id: 'mobile-wallet-apis',
      name: 'Mobile Wallet Backend APIs',
      summary: 'Wallet creation, balance inquiry, fund transfers and OTP-based authentication.',
      description: 'Backend APIs for wallet creation, balance inquiry, fund transfers and OTP-based authentication.',
      category: 'backend',
      tech: ['REST API', 'OTP', 'Security'],
      highlights: ['Wallet creation and balance inquiry', 'Fund transfers', 'OTP-based authentication'],
      year: 'Enterprise',
    },
    {
      id: 'wallet-admin-portal',
      name: 'Wallet Admin Portal',
      summary: 'Full-stack admin portal for users, wallets, transaction monitoring and administration.',
      description:
        'Full-stack admin portal features: user management, wallet management, transaction monitoring and system administration.',
      category: 'frontend',
      tech: ['Angular', 'Spring Boot', 'Monitoring', 'Administration'],
      highlights: ['User and wallet management', 'Transaction monitoring', 'System administration'],
      year: 'Enterprise · Full-stack',
    },
    {
      id: 'developer-room',
      name: 'Interactive Developer Portfolio',
      summary: 'This website: an explorable 3D developer room built with React Three Fiber.',
      description:
        'An immersive portfolio where every piece of furniture is procedurally modelled in Three.js. Visitors explore a night-time workspace and click objects to reveal content, with an accessible classic view for keyboard and screen-reader users.',
      category: 'frontend',
      tech: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Framer Motion'],
      highlights: [
        'Procedural room, furniture and instanced city skyline',
        'Smooth camera focus transitions and hover highlighting',
        'Adaptive quality, reduced-motion support and WebGL fallback',
      ],
      year: 'This site',
    },
  ],
  funFacts: {
    favoriteActivities: [
      'Turning complex requirements into dependable systems',
      'Solving hard problems and finding root causes fast',
      'Writing clean, scalable code',
      'Building calm, intuitive interfaces',
    ],
    learningGoals: ['New technologies', 'Software architecture', 'Design patterns'],
    philosophy: [
      "Security first: financial systems handle people's money, so authentication, access control and data integrity come first, not last.",
      'Clean & maintainable: readable, well-structured code that the next developer can understand, extend and trust.',
      'Always learning: I keep exploring new technologies, architecture and design patterns to bring better solutions to every project.',
    ],
    quote: {
      text: 'Clean code is not just a preference. It is how good ideas stay useful as they grow.',
      author: 'Nyi Nyi Linn',
    },
  },
  contact: {
    responseTime: 'Based in Yangon, Myanmar · GMT+6:30',
    availability: 'Open to work · Available for new opportunities',
  },
}
