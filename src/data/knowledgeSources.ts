import type { KnowledgeSource } from '@/domain';

/**
 * Curated, legal starter set of sources the coach is grounded in. These are
 * official / freely-available resources (or the free tier of paid ones). They are
 * read-only reference entries (`isSeed: true`); the athlete adds their own sources
 * — including PDFs they legally own — on top, in the Wiedza tab.
 *
 * Keep this in sync with `knowledge-sources.md` at the repo root.
 */
const SEED_DATE = '2026-07-13';

function seed(source: Omit<KnowledgeSource, 'status' | 'addedAt' | 'isSeed'>): KnowledgeSource {
  return { ...source, status: 'linked', addedAt: SEED_DATE, isSeed: true };
}

export const SEED_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  // A. CrossFit methodology
  seed({
    id: 'seed-crossfit-l1',
    title: 'CrossFit Level 1 Training Guide',
    author: 'CrossFit',
    category: 'crossfit_methodology',
    type: 'pdf',
    url: 'https://library.crossfit.com/free/pdf/CFJ_English_Level1_TrainingGuide.pdf',
    notes: 'Foundational methodology — movement standards, programming, "What is Fitness?". The single most important source.',
    isFree: true,
  }),
  seed({
    id: 'seed-crossfit-com',
    title: 'CrossFit.com',
    author: 'CrossFit',
    category: 'crossfit_methodology',
    type: 'article',
    url: 'https://www.crossfit.com/',
    notes: 'Daily WOD archive plus free technique articles and videos.',
    isFree: true,
  }),

  // B. Olympic lifting
  seed({
    id: 'seed-catalyst-athletics',
    title: 'Catalyst Athletics',
    author: 'Greg Everett',
    category: 'olympic_lifting',
    type: 'article',
    url: 'https://www.catalystathletics.com/',
    notes: 'Largest free Olympic weightlifting library — 600+ exercise demos, 1300+ articles, programs.',
    isFree: true,
  }),

  // C. Strength & hypertrophy
  seed({
    id: 'seed-stronger-by-science',
    title: 'Stronger by Science — Complete Strength Training Guide',
    author: 'Greg Nuckols',
    category: 'strength_hypertrophy',
    type: 'article',
    url: 'https://www.strongerbyscience.com/complete-strength-training-guide/',
    notes: 'Deeply-researched strength/hypertrophy articles plus a free program bundle.',
    isFree: true,
  }),
  seed({
    id: 'seed-barbell-medicine',
    title: 'Barbell Medicine — Blog',
    author: 'Jordan Feigenbaum & Austin Baraki',
    category: 'strength_hypertrophy',
    type: 'article',
    url: 'https://www.barbellmedicine.com/blog/',
    notes: 'Evidence-based strength, pain and rehab from MDs who are also elite lifters.',
    isFree: true,
  }),
  seed({
    id: 'seed-rp-strength',
    title: 'Renaissance Periodization — Articles',
    author: 'Dr. Mike Israetel',
    category: 'strength_hypertrophy',
    type: 'article',
    url: 'https://rpstrength.com/blogs/articles',
    notes: 'Hypertrophy and volume landmarks (MEV/MAV/MRV). Free articles; books are paid.',
    isFree: true,
  }),

  // D. Gymnastics
  seed({
    id: 'seed-bwf-wiki',
    title: 'r/bodyweightfitness — Wiki & Recommended Routine',
    category: 'gymnastics',
    type: 'article',
    url: 'https://www.reddit.com/r/bodyweightfitness/wiki/index/',
    notes: 'Community-vetted calisthenics / gymnastics strength progressions.',
    isFree: true,
  }),

  // E. Endurance & Hyrox
  seed({
    id: 'seed-uphill-athlete',
    title: 'Uphill Athlete',
    author: 'Steve House & Scott Johnston',
    category: 'endurance_hyrox',
    type: 'article',
    url: 'https://uphillathlete.com/blogs/all-articles',
    notes: 'Aerobic base building and endurance periodization.',
    isFree: true,
  }),
  seed({
    id: 'seed-hyrox',
    title: 'HYROX (official)',
    category: 'endurance_hyrox',
    type: 'article',
    url: 'https://hyrox.com/',
    notes: 'Official station standards, rules and training guidance.',
    isFree: true,
  }),

  // F. Nutrition
  seed({
    id: 'seed-examine',
    title: 'Examine.com',
    category: 'nutrition',
    type: 'article',
    url: 'https://examine.com/',
    notes: 'Independent evidence database on nutrition and supplements. Partly free.',
    isFree: true,
  }),
  seed({
    id: 'seed-issn-position-stands',
    title: 'ISSN Position Stands (JISSN)',
    author: 'Int. Society of Sports Nutrition',
    category: 'nutrition',
    type: 'research',
    url: 'https://jissn.biomedcentral.com/',
    notes: 'Peer-reviewed, open-access stands: protein, creatine, nutrient timing, caffeine.',
    isFree: true,
  }),
  seed({
    id: 'seed-nih-ods',
    title: 'NIH Office of Dietary Supplements',
    author: 'National Institutes of Health',
    category: 'nutrition',
    type: 'article',
    url: 'https://ods.od.nih.gov/factsheets/list-all/',
    notes: 'Authoritative government fact sheets on vitamins and supplements.',
    isFree: true,
  }),
  seed({
    id: 'seed-precision-nutrition',
    title: 'Precision Nutrition — Blog',
    category: 'nutrition',
    type: 'article',
    url: 'https://www.precisionnutrition.com/blog',
    notes: 'Large library of practical, evidence-based nutrition-coaching articles.',
    isFree: true,
  }),
  seed({
    id: 'seed-macrofactor',
    title: 'MacroFactor — Knowledge Base',
    author: 'Stronger by Science team',
    category: 'nutrition',
    type: 'article',
    url: 'https://macrofactor.com/articles/',
    notes: 'Macros, energy balance and workout nutrition, evidence-based.',
    isFree: true,
  }),

  // G. Mobility & rehab
  seed({
    id: 'seed-e3-rehab',
    title: 'E3 Rehab',
    category: 'mobility_rehab',
    type: 'article',
    url: 'https://e3rehab.com/',
    notes: 'Evidence-based rehab and injury-risk reduction from Doctors of Physical Therapy.',
    isFree: true,
  }),
  seed({
    id: 'seed-squat-university',
    title: 'Squat University',
    author: 'Dr. Aaron Horschig',
    category: 'mobility_rehab',
    type: 'article',
    url: 'https://squatuniversity.com/',
    notes: 'Mobility and lifting mechanics, working around pain for strength athletes.',
    isFree: true,
  }),
  seed({
    id: 'seed-prehab-guys',
    title: 'The Prehab Guys',
    category: 'mobility_rehab',
    type: 'article',
    url: 'https://theprehabguys.com/',
    notes: 'Prehab / rehab and injury prevention from physiotherapists. Mostly free.',
    isFree: true,
  }),

  // H. Sleep & recovery
  seed({
    id: 'seed-sleep-foundation',
    title: 'Sleep Foundation',
    category: 'sleep_recovery',
    type: 'article',
    url: 'https://www.sleepfoundation.org/',
    notes: 'Authoritative sleep and sleep-hygiene reference.',
    isFree: true,
  }),
  seed({
    id: 'seed-huberman-sleep',
    title: 'Huberman Lab — Toolkit for Sleep',
    author: 'Andrew Huberman',
    category: 'sleep_recovery',
    type: 'article',
    url: 'https://www.hubermanlab.com/newsletter/toolkit-for-sleep',
    notes: 'Actionable sleep-optimization protocol plus a recovery-focused podcast.',
    isFree: true,
  }),

  // I. Sport psychology
  seed({
    id: 'seed-aasp',
    title: 'AASP — Applied Sport Psychology',
    category: 'sport_psychology',
    type: 'article',
    url: 'https://appliedsportpsych.org/resources/',
    notes: 'Professional body — free resources and blog for athletes and coaches.',
    isFree: true,
  }),
  seed({
    id: 'seed-apa-div47',
    title: 'APA Division 47',
    author: 'Society for Sport, Exercise & Performance Psychology',
    category: 'sport_psychology',
    type: 'article',
    url: 'https://www.apadivisions.org/division-47',
    notes: 'Materials from the scientific society of sport and performance psychology.',
    isFree: true,
  }),

  // J. Podcasts
  seed({
    id: 'seed-iron-culture',
    title: 'Iron Culture Podcast',
    author: 'Eric Helms & Omar Isuf',
    category: 'podcast',
    type: 'podcast',
    notes: 'Evidence-based lifting and nutrition. Find it in your podcast app.',
    isFree: true,
  }),
  seed({
    id: 'seed-barbell-medicine-podcast',
    title: 'Barbell Medicine Podcast',
    author: 'Jordan Feigenbaum & Austin Baraki',
    category: 'podcast',
    type: 'podcast',
    url: 'https://www.barbellmedicine.com/podcast/',
    notes: 'Medicine, strength and rehab discussion from the Barbell Medicine team.',
    isFree: true,
  }),
];
