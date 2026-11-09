import { RoastResponse } from './validate.js';

export const SERVER_DEMO_BATTLE: RoastResponse = {
  isDemo: true,
  notice: 'Live model unavailable, showing the demo battle',
  turns: [
    {
      speaker: 'recruiter',
      text: 'Oh great, another dynamic thought leader crafting synergistic paradigms. My eyes glazed over before I even reached the phone number.',
      quote: 'Results-driven, dynamic thought leader and synergistic software craftsman',
      mood: 'point'
    },
    {
      speaker: 'manager',
      text: 'Cut them some slack on the opener, Rex. Everyone copies that intro from LinkedIn templates when they get nervous.',
      quote: null,
      mood: 'hands-up'
    },
    {
      speaker: 'recruiter',
      text: 'Their first bullet under a Lead title is that they attended meetings! Attending standups is not an accomplishment, it is calendar attendance.',
      quote: 'Responsible for daily standups, sprint grooming, and stakeholder alignment meetings.',
      mood: 'disappointed'
    },
    {
      speaker: 'manager',
      text: 'Look at the very next line though! They moved 45 legacy services to Kubernetes with zero downtime. That is a massive project that required real architectural discipline.',
      quote: 'Migrated 45 legacy monolithic microservices to Kubernetes clusters with zero downtime.',
      mood: 'thumbs-up'
    },
    {
      speaker: 'recruiter',
      text: 'Then why bury it under sprint grooming? And what is this: a full year sabbatical exploring freelance vision consulting and decentralized governance?',
      quote: 'Took intentional sabbatical to explore decentralized governance, Web3 synergies, and freelance vision consulting.',
      mood: 'laugh'
    },
    {
      speaker: 'manager',
      text: 'Crypto tanked in 2022 and they took contract work. Just call it Contract Engineering instead of wrapping it in buzzwords. The skills are still legitimate.',
      quote: null,
      mood: 'thinking'
    },
    {
      speaker: 'recruiter',
      text: 'Look at the bottom of the page! Under methodologies they listed Extreme Synergy and Holistic Scalability with a straight face. I am binning this.',
      quote: 'Extreme Synergy, Holistic Scalability',
      mood: 'point'
    },
    {
      speaker: 'manager',
      text: 'Do not bin it! Down in CloudPulse they cut Redis page latency by 38 percent and fixed N+1 bottlenecks. That is hard engineering impact.',
      quote: 'Improved page load time by 38% after refactoring Redis cache and eliminating N+1 query bottlenecks.',
      mood: 'hands-up'
    },
    {
      speaker: 'recruiter',
      text: 'Fine. The engineer exists, but they hid themselves behind three layers of corporate brochure jargon. Make them rewrite it.',
      quote: null,
      mood: 'smirk'
    }
  ],
  verdict: {
    score: 58,
    headline: 'BURY THE SYNERGY, HIGHLIGHT THE 38%',
    oneLiner: 'Behind five layers of corporate fluff sits an engineer who migrated 45 services without downtime. Rewrite the fluff to get the interview.',
    fixes: [
      {
        title: 'Delete the Buzzword Summary',
        why: 'Recruiters spend 6 seconds per resume and skip generic intros about "synergistic thought leadership".',
        before: 'Results-driven, dynamic thought leader and synergistic software craftsman with 7+ years of end-to-end expertise leveraging modern paradigms...',
        after: 'Full-Stack & Systems Architect with 7+ years scaling distributed systems across AWS and Kubernetes, cutting latency by up to 38% for high-volume platforms.'
      },
      {
        title: 'Lead with Production Scale, Not Standups',
        why: 'Listing "responsible for daily standups" as bullet #1 makes you sound like a calendar organizer rather than a systems lead.',
        before: 'Responsible for daily standups, sprint grooming, and stakeholder alignment meetings.',
        after: 'Led architectural migration of 45 legacy microservices into Kubernetes clusters, achieving 99.9% SLA uptime with zero production downtime.'
      },
      {
        title: 'Clarify the Web3 Gap',
        why: '"Vision consulting" sounds evasive and triggers recruiter skepticism about what work actually happened.',
        before: 'Took intentional sabbatical to explore decentralized governance, Web3 synergies, and freelance vision consulting.',
        after: 'Contract Software Engineer (Independent): Designed smart contract architectures and backend analytics pipelines for 3 early-stage client platforms.'
      }
    ]
  }
};
