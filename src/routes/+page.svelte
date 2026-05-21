<script>
  import { _, locale, isLoading } from 'svelte-i18n';
  import en from '$lib/i18n/locales/en.json';
  import ru from '$lib/i18n/locales/ru.json';
  import ja from '$lib/i18n/locales/ja.json';
  import { theme, toggleTheme } from '$lib/stores/theme';

  const translations = { en, ru, ja };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' }
  ];

  let languageDropdownOpen = false;

  function selectLanguage(value) {
    locale.set(value);
    languageDropdownOpen = false;
  }

  function handleClickAway(e) {
    if (languageDropdownOpen && !e.target.closest('.language-selector-wrapper')) {
      languageDropdownOpen = false;
    }
  }

  // Platform display order, top-down (most recent first)
  const platformOrder = ['chulakov', 'workhuman', 'upwork', 'toptal'];

  // Tech color palette used for badges. Same source as the game's bubbles.
  const techColors = {
    'React': '#61DAFB', 'TypeScript': '#3178C6', 'Node.js': '#339933',
    'Redux': '#764ABC', 'MobX': '#FF9955', 'PostgreSQL': '#336791',
    'MongoDB': '#47A248', 'Express': '#888888', 'Highcharts': '#8087E8',
    'Material UI': '#0081CB', 'Material-UI': '#0081CB', 'Draft.js': '#6b8cba',
    'JavaScript': '#F7DF1E', 'CSS': '#1572B6', 'HTML': '#E34F26',
    'Git': '#F05032', 'React Router': '#CA4245', 'Context API': '#00BCD4',
    'react-beautiful-dnd': '#9b8aff', 'React 18': '#61DAFB',
  };

  function techBadges(stack) {
    if (!stack) return [];
    return stack.split(/[,،、]\s*/).map(t => t.trim()).filter(Boolean);
  }

  function colorFor(tech) {
    return techColors[tech] || '#888';
  }

  $: data = translations[$locale] || translations.en;
  $: cv = data.cv;
</script>

<svelte:head>
  <title>{$isLoading ? 'CV' : `${cv.header.name} — ${cv.header.title}`}</title>
  <meta name="description" content={$isLoading ? '' : cv.summary} />
</svelte:head>

<svelte:window on:click={handleClickAway} />

{#if !$isLoading}
<div class="page" data-theme={$theme}>
  <header class="topbar">
    <a class="brand" href="/">CV</a>

    <div class="controls">
      <div class="language-selector-wrapper">
        <button class="language-selector" on:click|stopPropagation={() => languageDropdownOpen = !languageDropdownOpen} type="button">
          {languageOptions.find(opt => opt.value === $locale)?.label || 'English'}
        </button>
        {#if languageDropdownOpen}
          <div class="language-dropdown">
            {#each languageOptions as option}
              <button
                class="language-option"
                class:selected={option.value === $locale}
                on:click={() => selectLanguage(option.value)}
                type="button"
              >
                {option.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <button class="theme-switcher" on:click={toggleTheme} aria-label="Toggle theme">
        {$theme === 'light' ? '🌙' : '☀️'}
      </button>

      <a class="play-cta" href="/play" title={cv.cta.playGameHint}>
        <span class="play-icon">▶</span> {cv.cta.playGame}
      </a>
    </div>
  </header>

  <main class="cv">
    <section class="hero">
      <h1>{cv.header.name}</h1>
      <p class="title">{cv.header.title}</p>
      <ul class="contacts">
        <li>{cv.header.location}</li>
        <li><a href="mailto:{cv.header.email}">{cv.header.email}</a></li>
        <li><a href={cv.header.github} target="_blank" rel="noreferrer">GitHub</a></li>
        <li><a href={cv.header.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
      </ul>
    </section>

    <section class="block">
      <h2>{cv.sections.summary}</h2>
      <p class="summary">{cv.summary}</p>
    </section>

    <section class="block">
      <h2>{cv.sections.experience}</h2>
      <div class="experience">
        {#each platformOrder as key}
          {@const job = data.platforms[key]}
          {#if job}
            <article class="job">
              <header class="job-header">
                <div class="job-title">
                  <h3>{job.company}</h3>
                  <span class="role">— {job.role}</span>
                </div>
                <span class="period">{job.period}</span>
              </header>

              {#each job.intro.split('\n').filter(l => l.trim()) as line}
                <p class="job-intro">{line}</p>
              {/each}

              {#if job.techStack}
                <div class="badges">
                  {#each techBadges(job.techStack) as tech}
                    <span class="badge" style="--badge-color: {colorFor(tech)}">{tech}</span>
                  {/each}
                </div>
              {/if}

              {#if job.achievements?.length}
                <ul>
                  {#each job.achievements as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              {/if}

              {#if job.additional?.length}
                <p class="additional-label">{data.sections.additional}</p>
                <ul>
                  {#each job.additional as item}
                    <li>{item}</li>
                  {/each}
                </ul>
              {/if}
            </article>
          {/if}
        {/each}
      </div>
    </section>

    <section class="block">
      <h2>{cv.sections.skills}</h2>
      <div class="skills">
        {#each Object.values(cv.skills) as group}
          <div class="skill-group">
            <h4>{group.title}</h4>
            <p>{group.items}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="block">
      <h2>{cv.sections.languages}</h2>
      <ul class="languages">
        {#each cv.languages as lang}
          <li><strong>{lang.name}</strong> — {lang.level}</li>
        {/each}
      </ul>
    </section>

  </main>

  <footer class="page-footer">
    <a class="play-cta-foot" href="/play">
      <span class="play-icon">▶</span> {cv.cta.playGame}
    </a>
  </footer>
</div>
{/if}

<style>
  :global(body) {
    margin: 0;
  }

  .page {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    line-height: 1.6;
  }

  .page[data-theme='dark'] {
    --page-bg: #0a0a1e;
    --page-text: #e8d8b0;
    --page-muted: #a09070;
    --page-accent: #d4af37;
    --page-accent-soft: #f0c840;
    --page-border: #3a3020;
    --card-bg: #14142e;
    --button-bg: rgba(0,0,0,0.6);
    --button-border: rgba(255,255,255,0.4);
    --link: #f0c840;
    --shadow: rgba(0,0,0,0.6);
  }

  .page[data-theme='light'] {
    --page-bg: #f4ecd6;
    --page-text: #2a1a0a;
    --page-muted: #6a4a1a;
    --page-accent: #8a3a10;
    --page-accent-soft: #b8501a;
    --page-border: #c8a860;
    --card-bg: #fff6e0;
    --button-bg: rgba(216, 200, 154, 0.85);
    --button-border: rgba(0,0,0,0.25);
    --link: #8a3a10;
    --shadow: rgba(0,0,0,0.25);
  }

  .page {
    background: var(--page-bg);
    color: var(--page-text);
    min-height: 100vh;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 32px;
    background: var(--page-bg);
    border-bottom: 2px solid var(--page-border);
  }

  .brand {
    font-family: 'Press Start 2P', monospace;
    font-size: 14px;
    color: var(--page-accent);
    text-decoration: none;
    letter-spacing: 2px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .language-selector-wrapper { position: relative; }

  .language-selector,
  .theme-switcher {
    background: var(--button-bg);
    border: 2px solid var(--button-border);
    color: var(--page-text);
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    line-height: 1;
    height: 38px;
    padding: 0 14px;
    cursor: pointer;
    box-shadow: 3px 3px 0 var(--shadow);
  }

  .theme-switcher {
    width: 38px;
    padding: 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .language-selector:hover,
  .theme-switcher:hover {
    background: var(--page-border);
  }

  .language-selector:active,
  .theme-switcher:active {
    box-shadow: 1px 1px 0 var(--shadow);
    transform: translate(2px, 2px);
  }

  .language-dropdown {
    position: absolute;
    top: 44px;
    right: 0;
    background: var(--card-bg);
    border: 2px solid var(--page-border);
    box-shadow: 4px 4px 0 var(--shadow);
    min-width: 140px;
    z-index: 110;
  }

  .language-option {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--page-border);
    color: var(--page-text);
    padding: 12px 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    text-align: left;
    cursor: pointer;
  }

  .language-option:last-child { border-bottom: none; }
  .language-option:hover { background: var(--page-accent); color: var(--card-bg); }
  .language-option.selected { background: var(--page-border); color: var(--page-accent); }

  .play-cta,
  .play-cta-foot {
    background: var(--page-accent);
    color: var(--page-bg);
    border: 2px solid var(--page-accent);
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    line-height: 1;
    height: 38px;
    padding: 0 16px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 3px 3px 0 var(--shadow);
    letter-spacing: 1px;
  }

  .play-cta:hover,
  .play-cta-foot:hover {
    background: var(--page-accent-soft);
    border-color: var(--page-accent-soft);
  }

  .play-cta:active,
  .play-cta-foot:active {
    box-shadow: 1px 1px 0 var(--shadow);
    transform: translate(2px, 2px);
  }

  .play-icon {
    font-family: sans-serif;
    font-size: 11px;
  }

  .cv {
    max-width: 880px;
    margin: 0 auto;
    padding: 48px 32px 24px;
  }

  .hero {
    text-align: left;
    margin-bottom: 48px;
    padding-bottom: 24px;
    border-bottom: 2px solid var(--page-border);
  }

  .hero h1 {
    font-family: 'Press Start 2P', monospace;
    font-size: 26px;
    line-height: 1.4;
    margin: 0 0 12px;
    color: var(--page-accent);
    text-shadow: 3px 3px 0 var(--shadow);
  }

  .title {
    font-size: 18px;
    color: var(--page-muted);
    margin: 0 0 20px;
  }

  .contacts {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 24px;
    font-size: 14px;
  }

  .contacts li::before { content: ''; }

  .contacts a {
    color: var(--link);
    text-decoration: none;
  }

  .contacts a:hover { text-decoration: underline; }

  .block {
    margin-bottom: 40px;
  }

  .block h2 {
    font-family: 'Press Start 2P', monospace;
    font-size: 13px;
    color: var(--page-accent);
    margin: 0 0 20px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--page-border);
    letter-spacing: 1px;
  }

  .summary {
    font-size: 15px;
    margin: 0;
    color: var(--page-text);
  }

  .experience {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .job {
    background: var(--card-bg);
    border: 2px solid var(--page-border);
    padding: 20px 24px;
    box-shadow: 4px 4px 0 var(--shadow);
  }

  .job-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 16px;
    margin-bottom: 8px;
  }

  .job-title {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 10px;
  }

  .job h3 {
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    color: var(--page-accent);
    margin: 0;
  }

  .role {
    color: var(--page-muted);
    font-size: 13px;
  }

  .period {
    color: var(--page-muted);
    font-size: 13px;
    white-space: nowrap;
  }

  .job-intro {
    margin: 6px 0;
    font-size: 14px;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 12px 0 14px;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 11px;
    background: var(--badge-color);
    color: #fff;
    border: 1px solid rgba(0,0,0,0.2);
    text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
    box-shadow: 2px 2px 0 var(--shadow);
  }

  .job ul {
    padding-left: 20px;
    margin: 8px 0;
    font-size: 14px;
  }

  .job li { margin-bottom: 6px; }

  .additional-label {
    font-size: 12px;
    color: var(--page-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 14px 0 4px;
  }

  .skills {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .skill-group {
    background: var(--card-bg);
    border: 2px solid var(--page-border);
    padding: 16px 18px;
    box-shadow: 4px 4px 0 var(--shadow);
  }

  .skill-group h4 {
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    color: var(--page-accent);
    margin: 0 0 10px;
    letter-spacing: 1px;
  }

  .skill-group p {
    margin: 0;
    font-size: 14px;
  }

  .languages {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;
  }

  .languages li { margin-bottom: 6px; }

  .page-footer {
    display: flex;
    justify-content: center;
    padding: 40px 32px 60px;
  }

  /* Mobile */
  @media (max-width: 640px) {
    .topbar { padding: 10px 16px; flex-wrap: wrap; gap: 8px; }
    .cv { padding: 32px 16px 24px; }
    .hero h1 { font-size: 18px; }
    .title { font-size: 15px; }
    .play-cta { font-size: 8px; padding: 0 10px; }
    .job-header { flex-direction: column; align-items: flex-start; gap: 4px; }
  }

  /* Print: clean single-page resume */
  @media print {
    :global(body) { background: #fff !important; color: #000 !important; }
    .topbar, .page-footer { display: none; }
    .cv { padding: 0; max-width: 100%; }
    .page {
      --page-bg: #fff;
      --page-text: #000;
      --page-muted: #555;
      --page-accent: #000;
      --page-border: #ccc;
      --card-bg: #fff;
      --shadow: transparent;
      --link: #000;
    }
    .hero h1 { text-shadow: none; }
    .job, .skill-group {
      box-shadow: none;
      border: 1px solid #ccc;
      break-inside: avoid;
    }
    .badge {
      box-shadow: none;
      background: #f0f0f0 !important;
      color: #000 !important;
      text-shadow: none;
      border: 1px solid #aaa;
    }
    a { color: #000 !important; text-decoration: underline; }
  }
</style>
