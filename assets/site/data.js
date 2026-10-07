/* ------------------------------------------------------------------
   EDIT ME — portfolio content.
   Add a project by copying the commented template into PROJECTS.
   Only list work that is real: the grid, filters and empty states
   all update automatically.
------------------------------------------------------------------- */

window.SITE = {
  email: 'hello@aderemisalako.me',

  // Filter chips shown above the grid (id must match a project category)
  categories: [
    { id: 'all', label: 'All' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'short-form', label: 'Short-form' },
    { id: 'social', label: 'Social media' },
    { id: 'color', label: 'Color grading' },
    { id: 'motion', label: 'Motion graphics' }
  ],

  projects: [
    {
      id: 'red-eye-effect',
      featured: true,
      title: 'Red Eye Effect',
      categories: ['color'],
      categoryLabel: 'Color grading',
      year: '2026',
      duration: '0:31',
      description:
        'A 31-second cinematic colour study that turns a quiet close-up into an unsettling red-eye reveal through restrained grading and selective colour.',
      tools: ['DaVinci Resolve', 'Color page', 'Qualifiers & masks'],
      thumb: 'assets/site/red-eye-thumb.webp',
      thumbSmall: 'assets/site/red-eye-thumb-sm.webp',
      poster: 'assets/red-eye-effect-poster.webp',
      video: 'assets/red-eye-effect.mp4',
      alt: 'Close-up of a man looking down, graded in muted greens with a single red highlight in one eye',
      caseStudy: '#case-study'
    }

    /* TEMPLATE — copy, fill in, remove the comment marks
    ,{
      id: 'my-project',
      title: 'Project title',
      categories: ['youtube'],            // one or more ids from `categories`
      categoryLabel: 'YouTube',
      year: '2026',
      duration: '8:42',
      description: 'One or two sentences.',
      tools: ['DaVinci Resolve'],
      thumb: 'assets/site/my-project.webp',   // 16:9, ~1280×720
      poster: 'assets/site/my-project.webp',
      video: 'assets/my-project.mp4',        // or leave '' and add `link`
      link: 'https://www.youtube.com/watch?v=…',
      alt: 'Describe the frame for screen-reader users'
    }
    */
  ],

  /* Social proof. Leave the array empty to show the empty state, or add:
     { quote: '…', name: 'Full name', role: 'Role, Company', link: 'https://…' }
     Only add feedback you have permission to publish. */
  testimonials: [],

  /* Optional: path to a résumé / portfolio PDF, e.g. 'assets/aderemi-salako-resume.pdf'.
     While empty, the contact button shows a disabled "coming soon" state. */
  resume: '',

  /* Skill levels: 1 = Developing, 2 = Working knowledge, 3 = Comfortable */
  skills: [
    { id: 'editing', title: 'Editing', icon: 'i-scissors', items: [
      ['DaVinci Resolve', 3], ['Cutting & assembly', 3], ['Pacing & rhythm', 3], ['Storytelling structure', 2] ] },
    { id: 'color', title: 'Color', icon: 'i-palette', items: [
      ['Color correction', 3], ['Shot matching', 2], ['Cinematic grading', 2] ] },
    { id: 'audio', title: 'Audio', icon: 'i-audio', items: [
      ['Dialogue cleanup', 2], ['Synchronization', 3], ['Sound balancing', 2] ] },
    { id: 'motion', title: 'Motion', icon: 'i-motion', items: [
      ['Titles', 2], ['Masking & tracking', 2], ['Basic Fusion graphics', 1] ] },
    { id: 'strategy', title: 'Strategy', icon: 'i-chart', items: [
      ['Content structure', 2], ['Audience retention', 2], ['Social-media formatting', 3] ] }
  ]
};
