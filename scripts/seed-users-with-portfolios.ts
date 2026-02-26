/**
 * Seed script: Add 20 users with diverse portfolios
 * Each user has a different background, services, and one of the 8 template themes.
 *
 * Run with: bun --env-file=.env.local scripts/seed-users-with-portfolios.ts
 */
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../lib/db";
import { accounts, portfolios, users } from "../lib/schema";
import type { PortfolioContent } from "../lib/validation/portfolio-schema";
import type { PortfolioOnboardingData, PortfolioTone } from "../lib/db/portfolio";

const TEMPLATES = [
  "landing",
  "modern",
  "veil",
  "bold",
  "editorial",
  "gallery",
  "minimal",
  "interactive",
] as const;

const SEED_PASSWORD = "password123";

const SEED_DATA: {
  name: string;
  email: string;
  handle: string;
  title: string;
  bio: string;
  services: string[];
  projects: { title: string; description: string }[];
  tone: PortfolioTone;
  content: PortfolioContent;
}[] = [
  {
    name: "Alex Chen",
    email: "alex.chen.seed@example.com",
    handle: "alex-chen-dev",
    title: "Full-Stack Developer",
    bio: "10+ years building scalable web applications. Former engineer at Stripe and Vercel. Passionate about clean architecture and developer experience.",
    services: ["React & Next.js Development", "API Design", "System Architecture", "Performance Optimization"],
    projects: [
      { title: "E-commerce Platform", description: "Built a high-traffic marketplace serving 2M+ monthly users." },
      { title: "Real-time Dashboard", description: "WebSocket-powered analytics dashboard for logistics." },
      { title: "Mobile Banking App", description: "Secure fintech app with biometric auth." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Building Digital Experiences That Scale", subheadline: "Full-stack developer specializing in React, Node.js, and cloud infrastructure.", ctaText: "Let's Build Together" },
      about: { paragraph: "I've spent over a decade crafting web applications that millions of users rely on. From startups to enterprises, I bring a focus on maintainability, performance, and team collaboration." },
      services: [
        { title: "React & Next.js Development", description: "Modern React applications with server components, streaming, and optimal UX." },
        { title: "API Design", description: "RESTful and GraphQL APIs designed for scale and developer ergonomics." },
        { title: "System Architecture", description: "Microservices, event-driven systems, and cloud-native solutions." },
        { title: "Performance Optimization", description: "Core Web Vitals, bundle optimization, and database tuning." },
      ],
      projects: [
        { title: "E-commerce Platform", description: "Built a high-traffic marketplace.", result: "2M+ monthly active users" },
        { title: "Real-time Dashboard", description: "WebSocket-powered analytics.", result: "Sub-100ms latency" },
        { title: "Mobile Banking App", description: "Secure fintech application.", result: "SOC2 compliant" },
      ],
      cta: { headline: "Ready to Start Your Project?", subtext: "Get in touch for a free consultation." },
      socialLinks: [],
    },
  },
  {
    name: "Sofia Martinez",
    email: "sofia.martinez.seed@example.com",
    handle: "sofia-ux-design",
    title: "UX/UI Designer",
    bio: "Award-winning designer with a focus on accessibility and inclusive design. Previously at Figma and Airbnb.",
    services: ["User Research", "Interface Design", "Design Systems", "Usability Testing"],
    projects: [
      { title: "Healthcare App Redesign", description: "Improved patient onboarding flow, reducing drop-off by 40%." },
      { title: "Design System", description: "Created a scalable component library for 50+ product teams." },
      { title: "Accessibility Audit", description: "WCAG 2.1 AA compliance for a government portal." },
    ],
    tone: "Friendly",
    content: {
      hero: { headline: "Design That Feels Human", subheadline: "UX/UI designer crafting accessible, delightful digital experiences.", ctaText: "View My Work" },
      about: { paragraph: "I believe great design is invisible—it just works. With a background in psychology and design, I create interfaces that feel intuitive and inclusive for everyone." },
      services: [
        { title: "User Research", description: "Discovery, interviews, and usability studies to inform design decisions." },
        { title: "Interface Design", description: "Pixel-perfect UI with attention to hierarchy and interaction patterns." },
        { title: "Design Systems", description: "Scalable component libraries and design tokens." },
        { title: "Usability Testing", description: "Iterative testing to validate and improve product flows." },
      ],
      projects: [
        { title: "Healthcare App Redesign", description: "Patient onboarding improvements.", result: "40% drop-off reduction" },
        { title: "Design System", description: "Component library for product teams.", result: "50+ teams adopted" },
        { title: "Accessibility Audit", description: "Government portal compliance.", result: "WCAG 2.1 AA" },
      ],
      cta: { headline: "Let's Create Something Beautiful", subtext: "I'd love to hear about your project." },
      socialLinks: [],
    },
  },
  {
    name: "Marcus Johnson",
    email: "marcus.johnson.seed@example.com",
    handle: "marcus-photography",
    title: "Commercial Photographer",
    bio: "Specializing in product and lifestyle photography. Clients include Nike, Apple, and local brands.",
    services: ["Product Photography", "Lifestyle Shoots", "Brand Campaigns", "Photo Retouching"],
    projects: [
      { title: "Nike Campaign", description: "Product launch photography for a global campaign." },
      { title: "Restaurant Branding", description: "Full visual identity including food and ambiance shots." },
      { title: "Tech Startup Headshots", description: "Consistent brand imagery for a Series A company." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Images That Sell", subheadline: "Commercial photographer bringing brands to life through compelling visuals.", ctaText: "Book a Shoot" },
      about: { paragraph: "Every brand has a story. I capture it through light, composition, and authenticity. From product launches to lifestyle campaigns, I create imagery that resonates and converts." },
      services: [
        { title: "Product Photography", description: "E-commerce and marketing imagery that highlights your products." },
        { title: "Lifestyle Shoots", description: "Authentic moments that connect with your audience." },
        { title: "Brand Campaigns", description: "End-to-end visual storytelling for launches and rebrands." },
        { title: "Photo Retouching", description: "Professional editing that maintains natural quality." },
      ],
      projects: [
        { title: "Nike Campaign", description: "Global product launch imagery.", result: "Featured in 12 markets" },
        { title: "Restaurant Branding", description: "Full visual identity package.", result: "3x social engagement" },
        { title: "Tech Startup Headshots", description: "Consistent brand imagery.", result: "50+ team members" },
      ],
      cta: { headline: "Ready to Tell Your Story?", subtext: "Let's create imagery that stands out." },
      socialLinks: [],
    },
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka.seed@example.com",
    handle: "yuki-motion-design",
    title: "Motion Designer",
    bio: "Bringing interfaces and brands to life through animation. Formerly at Linear and Lottie.",
    services: ["UI Animation", "Brand Motion", "Micro-interactions", "Explainer Videos"],
    projects: [
      { title: "App Onboarding Flow", description: "Animated tutorials that increased completion by 60%." },
      { title: "Brand Identity Animation", description: "Logo and asset animations for a fintech startup." },
      { title: "Product Demo Video", description: "2-minute explainer that drove 30% sign-up lift." },
    ],
    tone: "Minimal",
    content: {
      hero: { headline: "Motion That Matters", subheadline: "Motion designer crafting purposeful animations for products and brands.", ctaText: "See My Work" },
      about: { paragraph: "Animation isn't decoration—it's communication. I create motion that guides users, reinforces brand, and makes digital experiences feel alive." },
      services: [
        { title: "UI Animation", description: "Transitions, loading states, and micro-interactions." },
        { title: "Brand Motion", description: "Logo animations, brand assets, and identity in motion." },
        { title: "Micro-interactions", description: "Delightful feedback that improves perceived performance." },
        { title: "Explainer Videos", description: "Product demos and marketing videos that convert." },
      ],
      projects: [
        { title: "App Onboarding Flow", description: "Animated tutorials.", result: "60% completion increase" },
        { title: "Brand Identity Animation", description: "Fintech startup motion.", result: "Featured in launch" },
        { title: "Product Demo Video", description: "2-minute explainer.", result: "30% sign-up lift" },
      ],
      cta: { headline: "Let's Animate Your Vision", subtext: "Get in touch to discuss your project." },
      socialLinks: [],
    },
  },
  {
    name: "Elena Rodriguez",
    email: "elena.rodriguez.seed@example.com",
    handle: "elena-content-strategy",
    title: "Content Strategist",
    bio: "Helping brands find their voice. 8 years in content marketing and editorial strategy.",
    services: ["Content Strategy", "Copywriting", "SEO", "Brand Voice"],
    projects: [
      { title: "SaaS Blog Growth", description: "Content strategy that 3x'd organic traffic in 18 months." },
      { title: "E-commerce Product Copy", description: "Conversion-optimized copy for 500+ SKUs." },
      { title: "Newsletter Launch", description: "Grew from 0 to 50K subscribers in first year." },
    ],
    tone: "Friendly",
    content: {
      hero: { headline: "Words That Work", subheadline: "Content strategist helping brands connect with their audience through thoughtful copy and strategy.", ctaText: "Start a Conversation" },
      about: { paragraph: "Great content isn't about volume—it's about resonance. I help brands articulate their value, tell their story, and build lasting relationships with their audience." },
      services: [
        { title: "Content Strategy", description: "Editorial calendars, content pillars, and audience mapping." },
        { title: "Copywriting", description: "Web copy, ads, and product descriptions that convert." },
        { title: "SEO", description: "Keyword research and on-page optimization for organic growth." },
        { title: "Brand Voice", description: "Voice guidelines and tone-of-voice documentation." },
      ],
      projects: [
        { title: "SaaS Blog Growth", description: "Content strategy for organic growth.", result: "3x traffic in 18 months" },
        { title: "E-commerce Product Copy", description: "Conversion-optimized copy.", result: "500+ SKUs" },
        { title: "Newsletter Launch", description: "Subscriber growth strategy.", result: "50K in year one" },
      ],
      cta: { headline: "Let's Find Your Voice", subtext: "I'd love to hear about your brand." },
      socialLinks: [],
    },
  },
  {
    name: "David Kim",
    email: "david.kim.seed@example.com",
    handle: "david-devops",
    title: "DevOps Engineer",
    bio: "Infrastructure and reliability specialist. Kubernetes, AWS, and incident response. Ex-Google SRE.",
    services: ["Cloud Infrastructure", "CI/CD Pipelines", "Monitoring & Observability", "Incident Response"],
    projects: [
      { title: "Kubernetes Migration", description: "Migrated 200+ services from VMs to K8s with zero downtime." },
      { title: "Multi-region Failover", description: "Designed and implemented automated failover for critical services." },
      { title: "Cost Optimization", description: "Reduced cloud spend by 40% through rightsizing and spot instances." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Infrastructure That Scales", subheadline: "DevOps engineer building reliable, scalable systems. Former Google SRE.", ctaText: "Connect" },
      about: { paragraph: "I build systems that don't break when it matters. With experience at scale, I bring a focus on reliability, observability, and operational excellence." },
      services: [
        { title: "Cloud Infrastructure", description: "AWS, GCP, and Kubernetes architecture and implementation." },
        { title: "CI/CD Pipelines", description: "Automated build, test, and deployment workflows." },
        { title: "Monitoring & Observability", description: "Metrics, logging, tracing, and alerting." },
        { title: "Incident Response", description: "Runbooks, postmortems, and reliability improvements." },
      ],
      projects: [
        { title: "Kubernetes Migration", description: "VM to K8s migration.", result: "Zero downtime" },
        { title: "Multi-region Failover", description: "Automated failover design.", result: "99.99% uptime" },
        { title: "Cost Optimization", description: "Cloud spend reduction.", result: "40% savings" },
      ],
      cta: { headline: "Let's Build Reliable Systems", subtext: "Reach out for infrastructure consulting." },
      socialLinks: [],
    },
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma.seed@example.com",
    handle: "priya-data-science",
    title: "Data Scientist",
    bio: "Turning data into decisions. ML models, analytics, and data pipelines. PhD from MIT.",
    services: ["Machine Learning", "Data Pipelines", "Analytics", "A/B Testing"],
    projects: [
      { title: "Recommendation Engine", description: "ML model that increased engagement by 25%." },
      { title: "Churn Prediction", description: "Early warning system that reduced churn by 15%." },
      { title: "Real-time Analytics", description: "Streaming pipeline processing 1M events/sec." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Data-Driven Decisions", subheadline: "Data scientist specializing in ML, analytics, and scalable data infrastructure.", ctaText: "Get in Touch" },
      about: { paragraph: "Data is only as valuable as the decisions it enables. I build models, pipelines, and analytics that drive real business outcomes." },
      services: [
        { title: "Machine Learning", description: "Recommendation systems, forecasting, and classification models." },
        { title: "Data Pipelines", description: "ETL, streaming, and batch processing at scale." },
        { title: "Analytics", description: "Dashboards, reporting, and exploratory analysis." },
        { title: "A/B Testing", description: "Experiment design and statistical analysis." },
      ],
      projects: [
        { title: "Recommendation Engine", description: "ML-powered recommendations.", result: "25% engagement lift" },
        { title: "Churn Prediction", description: "Early warning system.", result: "15% churn reduction" },
        { title: "Real-time Analytics", description: "Streaming pipeline.", result: "1M events/sec" },
      ],
      cta: { headline: "Ready to Unlock Your Data?", subtext: "Let's discuss your analytics needs." },
      socialLinks: [],
    },
  },
  {
    name: "James Wilson",
    email: "james.wilson.seed@example.com",
    handle: "james-illustration",
    title: "Illustrator & Artist",
    bio: "Creating distinctive visuals for brands, publications, and products. Clients include The New Yorker and Spotify.",
    services: ["Editorial Illustration", "Brand Illustration", "Character Design", "Art Direction"],
    projects: [
      { title: "Magazine Covers", description: "Illustrated 15+ covers for major publications." },
      { title: "Spotify Campaign", description: "Character-driven campaign for a music streaming feature." },
      { title: "Children's Book", description: "Full illustration for a best-selling picture book." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Visual Stories That Stick", subheadline: "Illustrator creating memorable imagery for brands and publications.", ctaText: "View Portfolio" },
      about: { paragraph: "I create illustrations that capture attention and convey complex ideas with clarity and style. From editorial to brand work, each project gets a unique visual voice." },
      services: [
        { title: "Editorial Illustration", description: "Magazine covers, articles, and editorial features." },
        { title: "Brand Illustration", description: "Campaigns, packaging, and brand assets." },
        { title: "Character Design", description: "Mascots, avatars, and character systems." },
        { title: "Art Direction", description: "Visual concept and direction for multi-asset projects." },
      ],
      projects: [
        { title: "Magazine Covers", description: "Publication illustrations.", result: "15+ covers" },
        { title: "Spotify Campaign", description: "Music streaming campaign.", result: "10M+ impressions" },
        { title: "Children's Book", description: "Picture book illustration.", result: "Best-seller" },
      ],
      cta: { headline: "Let's Create Something Memorable", subtext: "I'm always open to new projects." },
      socialLinks: [],
    },
  },
  {
    name: "Nina Petrov",
    email: "nina.petrov.seed@example.com",
    handle: "nina-product-management",
    title: "Product Manager",
    bio: "Shipping products users love. 12 years in B2B SaaS. Led products at Salesforce and HubSpot.",
    services: ["Product Strategy", "Roadmap Planning", "User Research", "Stakeholder Alignment"],
    projects: [
      { title: "CRM Overhaul", description: "Led a 2-year product transformation that doubled NPS." },
      { title: "New Product Launch", description: "0-to-1 product that reached $5M ARR in 18 months." },
      { title: "Platform Unification", description: "Consolidated 3 products into a unified platform." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Products That Deliver", subheadline: "Product manager with a track record of shipping products that users love and businesses value.", ctaText: "Let's Talk" },
      about: { paragraph: "I bridge user needs and business goals. With experience from zero-to-one to scale, I bring structure, empathy, and execution to product development." },
      services: [
        { title: "Product Strategy", description: "Vision, positioning, and go-to-market strategy." },
        { title: "Roadmap Planning", description: "Prioritization frameworks and release planning." },
        { title: "User Research", description: "Discovery, interviews, and usability studies." },
        { title: "Stakeholder Alignment", description: "Cross-functional coordination and executive communication." },
      ],
      projects: [
        { title: "CRM Overhaul", description: "Product transformation.", result: "2x NPS" },
        { title: "New Product Launch", description: "0-to-1 product.", result: "$5M ARR" },
        { title: "Platform Unification", description: "Product consolidation.", result: "3 products → 1" },
      ],
      cta: { headline: "Ready to Build Something Great?", subtext: "I'd love to hear about your product." },
      socialLinks: [],
    },
  },
  {
    name: "Omar Hassan",
    email: "omar.hassan.seed@example.com",
    handle: "omar-video-production",
    title: "Video Producer",
    bio: "Creating video content that engages. Commercials, documentaries, and social content. 50+ projects delivered.",
    services: ["Commercial Production", "Documentary", "Social Video", "Post-Production"],
    projects: [
      { title: "Tech Startup Ad", description: "30-second spot that drove 2x conversion vs. static ads." },
      { title: "Documentary Series", description: "6-episode series on sustainable fashion." },
      { title: "Social Content Package", description: "100+ short-form videos for a DTC brand." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Video That Moves People", subheadline: "Video producer crafting commercials, documentaries, and social content that resonates.", ctaText: "Watch Reel" },
      about: { paragraph: "Video is the most powerful medium for storytelling. I produce content that captures attention, builds emotion, and drives action." },
      services: [
        { title: "Commercial Production", description: "Ads, promos, and brand films." },
        { title: "Documentary", description: "Long-form storytelling and branded documentaries." },
        { title: "Social Video", description: "Short-form content for TikTok, Reels, and YouTube." },
        { title: "Post-Production", description: "Editing, color grading, and sound design." },
      ],
      projects: [
        { title: "Tech Startup Ad", description: "30-second commercial.", result: "2x conversion" },
        { title: "Documentary Series", description: "Sustainable fashion series.", result: "6 episodes" },
        { title: "Social Content Package", description: "Short-form video package.", result: "100+ videos" },
      ],
      cta: { headline: "Let's Tell Your Story on Screen", subtext: "Get in touch for your next video project." },
      socialLinks: [],
    },
  },
  {
    name: "Rachel Green",
    email: "rachel.green.seed@example.com",
    handle: "rachel-marketing",
    title: "Growth Marketing Lead",
    bio: "Performance marketing specialist. Paid acquisition, lifecycle, and retention. Scaled 3 startups to Series B.",
    services: ["Paid Acquisition", "Email Marketing", "Conversion Optimization", "Analytics"],
    projects: [
      { title: "CAC Reduction", description: "Cut paid acquisition cost by 35% through creative and targeting." },
      { title: "Lifecycle Program", description: "Onboarding and retention flows that improved LTV by 40%." },
      { title: "Attribution Model", description: "Built multi-touch attribution for $20M annual spend." },
    ],
    tone: "Friendly",
    content: {
      hero: { headline: "Growth That Scales", subheadline: "Growth marketing lead helping startups acquire and retain customers efficiently.", ctaText: "Book a Call" },
      about: { paragraph: "I've scaled marketing for startups from seed to Series B. My focus is on sustainable growth—acquiring customers who stay and optimizing every step of the funnel." },
      services: [
        { title: "Paid Acquisition", description: "Meta, Google, and programmatic campaign management." },
        { title: "Email Marketing", description: "Lifecycle, automation, and retention campaigns." },
        { title: "Conversion Optimization", description: "Landing pages, flows, and A/B testing." },
        { title: "Analytics", description: "Attribution, dashboards, and growth reporting." },
      ],
      projects: [
        { title: "CAC Reduction", description: "Paid acquisition optimization.", result: "35% cost cut" },
        { title: "Lifecycle Program", description: "Retention flows.", result: "40% LTV increase" },
        { title: "Attribution Model", description: "Multi-touch attribution.", result: "$20M spend tracked" },
      ],
      cta: { headline: "Let's Grow Together", subtext: "I'd love to discuss your growth goals." },
      socialLinks: [],
    },
  },
  {
    name: "Thomas Becker",
    email: "thomas.becker.seed@example.com",
    handle: "thomas-cybersecurity",
    title: "Security Consultant",
    bio: "Penetration testing and security architecture. Former CISO. Helping companies build resilient systems.",
    services: ["Penetration Testing", "Security Audits", "Compliance", "Incident Response"],
    projects: [
      { title: "Fintech Security Audit", description: "Comprehensive audit that identified and remediated critical vulnerabilities." },
      { title: "SOC2 Preparation", description: "Led a startup through SOC2 Type II certification." },
      { title: "Ransomware Recovery", description: "Led recovery and hardening after a ransomware incident." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Security You Can Trust", subheadline: "Security consultant helping organizations build and maintain resilient systems.", ctaText: "Schedule Audit" },
      about: { paragraph: "Security isn't a feature—it's a foundation. I help companies understand their risks, fix vulnerabilities, and build security into their culture and processes." },
      services: [
        { title: "Penetration Testing", description: "Simulated attacks to find vulnerabilities before attackers do." },
        { title: "Security Audits", description: "Code review, architecture review, and risk assessment." },
        { title: "Compliance", description: "SOC2, ISO 27001, and industry-specific frameworks." },
        { title: "Incident Response", description: "Preparation, response, and post-incident review." },
      ],
      projects: [
        { title: "Fintech Security Audit", description: "Comprehensive security review.", result: "Critical vulns fixed" },
        { title: "SOC2 Preparation", description: "Certification support.", result: "Type II certified" },
        { title: "Ransomware Recovery", description: "Incident response.", result: "Full recovery" },
      ],
      cta: { headline: "Let's Secure Your Systems", subtext: "Get in touch for a security assessment." },
      socialLinks: [],
    },
  },
  {
    name: "Aisha Okonkwo",
    email: "aisha.okonkwo.seed@example.com",
    handle: "aisha-brand-strategy",
    title: "Brand Strategist",
    bio: "Building brands that resonate. 10 years in brand strategy and creative direction. Worked with Fortune 500 and startups.",
    services: ["Brand Strategy", "Positioning", "Creative Direction", "Brand Guidelines"],
    projects: [
      { title: "Rebrand", description: "Complete rebrand for a 50-year-old company entering new markets." },
      { title: "Startup Brand Launch", description: "Brand identity and guidelines for a YC company." },
      { title: "Brand Architecture", description: "Portfolio brand structure for a holding company." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Brands That Stand Out", subheadline: "Brand strategist helping companies define and express who they are.", ctaText: "Start a Project" },
      about: { paragraph: "A strong brand is a competitive advantage. I help companies articulate their purpose, differentiate in the market, and create cohesive brand experiences." },
      services: [
        { title: "Brand Strategy", description: "Purpose, values, and strategic positioning." },
        { title: "Positioning", description: "Market analysis and competitive differentiation." },
        { title: "Creative Direction", description: "Visual and verbal identity development." },
        { title: "Brand Guidelines", description: "Documentation and governance for brand consistency." },
      ],
      projects: [
        { title: "Rebrand", description: "50-year-old company rebrand.", result: "New market entry" },
        { title: "Startup Brand Launch", description: "YC company identity.", result: "Full brand system" },
        { title: "Brand Architecture", description: "Portfolio structure.", result: "5 brands unified" },
      ],
      cta: { headline: "Let's Define Your Brand", subtext: "I'd love to hear about your vision." },
      socialLinks: [],
    },
  },
  {
    name: "Lucas Ferreira",
    email: "lucas.ferreira.seed@example.com",
    handle: "lucas-mobile-dev",
    title: "Mobile Developer",
    bio: "Native iOS and Android development. 8 years building apps used by millions. Swift, Kotlin, React Native.",
    services: ["iOS Development", "Android Development", "Cross-Platform", "App Store Optimization"],
    projects: [
      { title: "Fitness App", description: "Top 10 health app with 5M+ downloads." },
      { title: "Banking App", description: "Secure mobile banking with biometric auth." },
      { title: "E-commerce App", description: "Native app with 4.8 App Store rating." },
    ],
    tone: "Minimal",
    content: {
      hero: { headline: "Apps People Love", subheadline: "Mobile developer building native and cross-platform apps for iOS and Android.", ctaText: "View Apps" },
      about: { paragraph: "Great mobile experiences require attention to platform conventions, performance, and polish. I build apps that feel native and perform flawlessly." },
      services: [
        { title: "iOS Development", description: "Swift and SwiftUI applications." },
        { title: "Android Development", description: "Kotlin and Jetpack Compose." },
        { title: "Cross-Platform", description: "React Native for shared codebases." },
        { title: "App Store Optimization", description: "ASO strategy and implementation." },
      ],
      projects: [
        { title: "Fitness App", description: "Health and fitness application.", result: "5M+ downloads" },
        { title: "Banking App", description: "Secure mobile banking.", result: "Biometric auth" },
        { title: "E-commerce App", description: "Native shopping app.", result: "4.8 rating" },
      ],
      cta: { headline: "Ready to Build Your App?", subtext: "Let's discuss your mobile project." },
      socialLinks: [],
    },
  },
  {
    name: "Zara Williams",
    email: "zara.williams.seed@example.com",
    handle: "zara-interior-design",
    title: "Interior Designer",
    bio: "Residential and commercial interior design. Creating spaces that inspire. Featured in Architectural Digest.",
    services: ["Residential Design", "Commercial Spaces", "Renovation", "Space Planning"],
    projects: [
      { title: "Penthouse Renovation", description: "Full renovation of a 4,000 sq ft Manhattan penthouse." },
      { title: "Restaurant Design", description: "Award-winning design for a Michelin-starred restaurant." },
      { title: "Co-working Space", description: "Flexible workspace design for a 10,000 sq ft facility." },
    ],
    tone: "Friendly",
    content: {
      hero: { headline: "Spaces That Inspire", subheadline: "Interior designer creating residential and commercial spaces that reflect your vision.", ctaText: "Book a Consultation" },
      about: { paragraph: "Every space tells a story. I create interiors that balance aesthetics, function, and your unique style—from cozy homes to dynamic commercial spaces." },
      services: [
        { title: "Residential Design", description: "Homes, apartments, and vacation properties." },
        { title: "Commercial Spaces", description: "Offices, retail, and hospitality." },
        { title: "Renovation", description: "Kitchen, bath, and full-home renovations." },
        { title: "Space Planning", description: "Layout optimization and flow." },
      ],
      projects: [
        { title: "Penthouse Renovation", description: "Manhattan penthouse.", result: "4,000 sq ft" },
        { title: "Restaurant Design", description: "Michelin-starred venue.", result: "Award-winning" },
        { title: "Co-working Space", description: "Flexible workspace.", result: "10,000 sq ft" },
      ],
      cta: { headline: "Let's Design Your Space", subtext: "I'd love to hear about your project." },
      socialLinks: [],
    },
  },
  {
    name: "Kenji Yamamoto",
    email: "kenji.yamamoto.seed@example.com",
    handle: "kenji-game-dev",
    title: "Game Developer",
    bio: "Indie game developer and technical artist. Shipped 5 games. Unity and Unreal Engine.",
    services: ["Game Design", "Unity Development", "Technical Art", "VR/AR"],
    projects: [
      { title: "Puzzle Game", description: "Award-winning puzzle game with 1M+ players." },
      { title: "VR Experience", description: "Immersive VR experience for a museum." },
      { title: "Mobile Game", description: "Casual mobile game with 500K downloads." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Games That Delight", subheadline: "Game developer creating memorable experiences across platforms.", ctaText: "Play My Games" },
      about: { paragraph: "I make games that are fun to play and rewarding to create. From puzzle games to VR experiences, I bring ideas to life with polished execution." },
      services: [
        { title: "Game Design", description: "Mechanics, systems, and player experience." },
        { title: "Unity Development", description: "C# and Unity engine development." },
        { title: "Technical Art", description: "Shaders, VFX, and optimization." },
        { title: "VR/AR", description: "Immersive and augmented experiences." },
      ],
      projects: [
        { title: "Puzzle Game", description: "Award-winning puzzle game.", result: "1M+ players" },
        { title: "VR Experience", description: "Museum VR project.", result: "Featured exhibit" },
        { title: "Mobile Game", description: "Casual mobile game.", result: "500K downloads" },
      ],
      cta: { headline: "Let's Make Something Fun", subtext: "I'm always open to new game projects." },
      socialLinks: [],
    },
  },
  {
    name: "Maya Patel",
    email: "maya.patel.seed@example.com",
    handle: "maya-legal-consulting",
    title: "Legal Consultant",
    bio: "Tech and startup law. Contracts, compliance, and fundraising. Former Big Law, now focused on startups.",
    services: ["Contract Review", "Compliance", "Fundraising", "IP Strategy"],
    projects: [
      { title: "Series A Support", description: "Led legal for 15 startups through Series A." },
      { title: "Compliance Program", description: "Built GDPR and CCPA compliance for a SaaS company." },
      { title: "M&A Due Diligence", description: "Led legal due diligence for $50M acquisition." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Legal Clarity for Startups", subheadline: "Legal consultant specializing in tech, startups, and growth-stage companies.", ctaText: "Schedule a Call" },
      about: { paragraph: "Startups need legal support that moves at their pace. I provide practical advice on contracts, compliance, fundraising, and IP—without the Big Law overhead." },
      services: [
        { title: "Contract Review", description: "Commercial contracts, NDAs, and agreements." },
        { title: "Compliance", description: "GDPR, CCPA, SOC2, and industry regulations." },
        { title: "Fundraising", description: "Term sheets, cap tables, and investor documents." },
        { title: "IP Strategy", description: "Patents, trademarks, and IP portfolio management." },
      ],
      projects: [
        { title: "Series A Support", description: "Fundraising legal support.", result: "15 startups" },
        { title: "Compliance Program", description: "Privacy compliance.", result: "GDPR + CCPA" },
        { title: "M&A Due Diligence", description: "Acquisition support.", result: "$50M deal" },
      ],
      cta: { headline: "Let's Navigate Legal Together", subtext: "Get in touch for a consultation." },
      socialLinks: [],
    },
  },
  {
    name: "Ryan O'Connor",
    email: "ryan.oconnor.seed@example.com",
    handle: "ryan-sales-coach",
    title: "Sales Coach",
    bio: "B2B sales training and enablement. Helped 100+ teams improve pipeline and close rates. Former VP Sales.",
    services: ["Sales Training", "Pipeline Review", "Enablement", "Coaching"],
    projects: [
      { title: "SDR Program", description: "Built outbound program that 2x'd qualified pipeline." },
      { title: "Enterprise Playbook", description: "Created playbook that improved enterprise close rate by 30%." },
      { title: "Sales Onboarding", description: "Reduced ramp time from 6 months to 3 months." },
    ],
    tone: "Friendly",
    content: {
      hero: { headline: "Sales Teams That Win", subheadline: "Sales coach helping B2B teams build pipeline, close deals, and scale revenue.", ctaText: "Book a Session" },
      about: { paragraph: "Great sales is a system, not a personality. I help teams build repeatable processes, develop skills, and create cultures that win." },
      services: [
        { title: "Sales Training", description: "Workshops and ongoing skill development." },
        { title: "Pipeline Review", description: "Process audit and optimization." },
        { title: "Enablement", description: "Content, tools, and playbooks." },
        { title: "Coaching", description: "1:1 and team coaching for leaders." },
      ],
      projects: [
        { title: "SDR Program", description: "Outbound program build.", result: "2x pipeline" },
        { title: "Enterprise Playbook", description: "Enterprise sales process.", result: "30% close lift" },
        { title: "Sales Onboarding", description: "Ramp time reduction.", result: "6mo → 3mo" },
      ],
      cta: { headline: "Let's Level Up Your Sales", subtext: "I'd love to discuss your team's goals." },
      socialLinks: [],
    },
  },
  {
    name: "Fatima Al-Hassan",
    email: "fatima.alhassan.seed@example.com",
    handle: "fatima-sustainability",
    title: "Sustainability Consultant",
    bio: "ESG strategy and sustainable business practices. Helping companies reduce footprint and report transparently.",
    services: ["ESG Strategy", "Carbon Accounting", "Sustainability Reporting", "Supply Chain"],
    projects: [
      { title: "Net Zero Roadmap", description: "Developed roadmap for a Fortune 500 to reach net zero by 2040." },
      { title: "ESG Report", description: "First sustainability report for a mid-cap company." },
      { title: "Supply Chain Audit", description: "Identified 20% emissions reduction in supply chain." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Business for a Better Planet", subheadline: "Sustainability consultant helping companies build ESG strategy and reduce environmental impact.", ctaText: "Get Started" },
      about: { paragraph: "Sustainability isn't optional anymore—it's a business imperative. I help companies measure, reduce, and report their environmental impact with practical, actionable strategies." },
      services: [
        { title: "ESG Strategy", description: "Environmental, social, and governance framework." },
        { title: "Carbon Accounting", description: "Scope 1, 2, and 3 emissions measurement." },
        { title: "Sustainability Reporting", description: "GRI, SASB, and TCFD-aligned reporting." },
        { title: "Supply Chain", description: "Supplier engagement and scope 3 reduction." },
      ],
      projects: [
        { title: "Net Zero Roadmap", description: "Fortune 500 decarbonization.", result: "2040 target" },
        { title: "ESG Report", description: "First sustainability report.", result: "GRI aligned" },
        { title: "Supply Chain Audit", description: "Emissions reduction.", result: "20% reduction" },
      ],
      cta: { headline: "Let's Build a Sustainable Future", subtext: "Reach out to discuss your ESG goals." },
      socialLinks: [],
    },
  },
  {
    name: "Chris Nguyen",
    email: "chris.nguyen.seed@example.com",
    handle: "chris-consulting",
    title: "Management Consultant",
    bio: "Strategy and operations consulting. McKinsey alum. Helping companies navigate growth and transformation.",
    services: ["Strategy", "Operations", "M&A", "Transformation"],
    projects: [
      { title: "Growth Strategy", description: "Developed 5-year growth strategy for a $500M company." },
      { title: "Operations Overhaul", description: "Redesigned operations, reducing costs by 25%." },
      { title: "Post-Merger Integration", description: "Led integration of two $100M companies." },
    ],
    tone: "Professional",
    content: {
      hero: { headline: "Strategy That Executes", subheadline: "Management consultant helping companies grow, transform, and perform.", ctaText: "Connect" },
      about: { paragraph: "I help leaders make better decisions and execute with clarity. From strategy to operations to M&A, I bring structure and rigor to complex business challenges." },
      services: [
        { title: "Strategy", description: "Corporate, growth, and competitive strategy." },
        { title: "Operations", description: "Process design, efficiency, and scaling." },
        { title: "M&A", description: "Due diligence, valuation, and integration." },
        { title: "Transformation", description: "Change management and program leadership." },
      ],
      projects: [
        { title: "Growth Strategy", description: "5-year strategic plan.", result: "$500M company" },
        { title: "Operations Overhaul", description: "Process redesign.", result: "25% cost cut" },
        { title: "Post-Merger Integration", description: "M&A integration.", result: "2 companies merged" },
      ],
      cta: { headline: "Let's Tackle Your Biggest Challenges", subtext: "Get in touch for a conversation." },
      socialLinks: [],
    },
  },
  {
    name: "Isabella Rossi",
    email: "isabella.rossi.seed@example.com",
    handle: "isabella-fashion-design",
    title: "Fashion Designer",
    bio: "Sustainable fashion and ready-to-wear. Featured in Vogue. Building a brand that cares.",
    services: ["Collection Design", "Pattern Making", "Sustainable Materials", "Brand Collaboration"],
    projects: [
      { title: "SS25 Collection", description: "Sustainable ready-to-wear collection using recycled materials." },
      { title: "Collaboration", description: "Capsule collection with a major retailer." },
      { title: "Atelier Launch", description: "Launched made-to-order atelier line." },
    ],
    tone: "Bold",
    content: {
      hero: { headline: "Fashion With Purpose", subheadline: "Fashion designer creating sustainable, beautiful clothing for the conscious consumer.", ctaText: "View Collection" },
      about: { paragraph: "Fashion can be both beautiful and responsible. I design collections that minimize environmental impact while maximizing style and wearability." },
      services: [
        { title: "Collection Design", description: "Seasonal and capsule collections." },
        { title: "Pattern Making", description: "Technical patterns and grading." },
        { title: "Sustainable Materials", description: "Sourcing and material innovation." },
        { title: "Brand Collaboration", description: "Collaborative capsule collections." },
      ],
      projects: [
        { title: "SS25 Collection", description: "Sustainable ready-to-wear.", result: "Recycled materials" },
        { title: "Collaboration", description: "Retailer capsule.", result: "Major retailer" },
        { title: "Atelier Launch", description: "Made-to-order line.", result: "Zero waste" },
      ],
      cta: { headline: "Let's Create Together", subtext: "I'm open to collaborations and commissions." },
      socialLinks: [],
    },
  },
  {
    name: "Viktor Kowalski",
    email: "viktor.kowalski.seed@example.com",
    handle: "viktor-ai-ml",
    title: "AI/ML Engineer",
    bio: "Building intelligent systems. NLP, computer vision, and LLMs. PhD, ex-DeepMind.",
    services: ["LLM Integration", "Computer Vision", "NLP", "Model Deployment"],
    projects: [
      { title: "RAG System", description: "Enterprise RAG that improved answer accuracy by 40%." },
      { title: "Vision Pipeline", description: "Quality inspection system for manufacturing." },
      { title: "Chatbot Platform", description: "Custom LLM chatbot platform for customer support." },
    ],
    tone: "Minimal",
    content: {
      hero: { headline: "Intelligence at Scale", subheadline: "AI/ML engineer building LLMs, vision systems, and intelligent applications.", ctaText: "Get in Touch" },
      about: { paragraph: "AI is transforming every industry. I build practical ML systems that solve real problems—from RAG and chatbots to computer vision and beyond." },
      services: [
        { title: "LLM Integration", description: "RAG, fine-tuning, and prompt engineering." },
        { title: "Computer Vision", description: "Classification, detection, and segmentation." },
        { title: "NLP", description: "Text analysis, sentiment, and extraction." },
        { title: "Model Deployment", description: "Production ML pipelines and serving." },
      ],
      projects: [
        { title: "RAG System", description: "Enterprise retrieval-augmented generation.", result: "40% accuracy lift" },
        { title: "Vision Pipeline", description: "Manufacturing quality inspection.", result: "99.5% accuracy" },
        { title: "Chatbot Platform", description: "LLM customer support.", result: "50% ticket reduction" },
      ],
      cta: { headline: "Let's Build Intelligent Systems", subtext: "Reach out to discuss your AI needs." },
      socialLinks: [],
    },
  },
];

async function main() {
  console.log("▶ Seeding 20 users with portfolios...\n");

  const passwordHash = await hash(SEED_PASSWORD, 12);

  for (let i = 0; i < SEED_DATA.length; i++) {
    const data = SEED_DATA[i];
    const template = TEMPLATES[i % TEMPLATES.length];

    const userId = crypto.randomUUID();
    const portfolioId = crypto.randomUUID();
    const now = new Date();

    const onboardingData: PortfolioOnboardingData = {
      name: data.name,
      title: data.title,
      bio: data.bio,
      services: data.services,
      projects: data.projects,
      tone: data.tone,
      handle: data.handle,
    };

    try {
      await db.insert(users).values({
        id: userId,
        name: data.name,
        email: data.email,
        passwordHash,
        plan: "free",
        credits: 500,
        activePortfolioId: portfolioId,
      });

      await db.insert(accounts).values({
        id: nanoid(),
        userId,
        accountId: data.email,
        providerId: "credential",
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(portfolios).values({
        id: portfolioId,
        userId,
        name: `${data.name.split(" ")[0]}'s Portfolio`,
        handle: data.handle,
        subdomain: null,
        onboardingData,
        content: data.content,
        template,
        theme: template,
        isPublished: true,
        updatedAt: now,
      });

      console.log(`  ✓ ${data.name} (${data.handle}) — theme: ${template}`);
    } catch (err) {
      console.error(`  ✗ Failed to create ${data.email}:`, err);
      throw err;
    }
  }

  console.log("\n✅ Seeded 20 users with portfolios. All use password: " + SEED_PASSWORD);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));