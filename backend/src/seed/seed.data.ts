export interface SeedUser {
  handle: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface SeedSite {
  address: string;
  title: string;
  authorHandle: string;
  htmlContent: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    handle: 'alice',
    name: 'Alice Walker',
    bio: 'Archivist and collector of fragile digital signals across the small web.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice',
  },
  {
    handle: 'aris',
    name: 'Dr. Aris Thorne',
    bio: 'Marine ecologist, tidepool observer, soundscape researcher.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aris',
  },
  {
    handle: 'maya',
    name: 'Maya Lin',
    bio: 'Cartographer of untrodden terrain, field botanist, slow web advocate.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya',
  },
  {
    handle: 'julian',
    name: 'Julian Vance',
    bio: 'VLF radio enthusiast, shortwave listener, compiler of ephemeral signals.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Julian',
  },
];

export const SEED_SITES: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'The Intertidal Archive',
    authorHandle: 'aris',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>The Intertidal Archive</title>
<style>
  body { font-family: 'Georgia', serif; background: #0c1821; color: #b8d0eb; max-width: 680px; margin: 40px auto; padding: 0 24px; line-height: 1.7; }
  h1 { color: #f0f4f8; font-size: 28px; border-bottom: 1px solid #1f3a52; padding-bottom: 12px; }
  h2 { color: #8da9c4; font-size: 20px; margin-top: 32px; }
  p { margin-bottom: 20px; font-size: 16px; }
  a { color: #64dfdf; text-decoration: none; border-bottom: 1px dotted #64dfdf; }
  a:hover { color: #ffffff; border-bottom: 1px solid #ffffff; }
  .note { background: #132a3e; padding: 14px 18px; border-left: 3px solid #64dfdf; margin: 24px 0; border-radius: 4px; }
  .footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid #1f3a52; font-size: 14px; color: #537a9a; }
</style>
</head>
<body>
  <h1>The Intertidal Archive</h1>
  <p>Between high and low water marks lives an ecology defined entirely by patience. For six hours every day, an entire continent of barnacles, green anemones, and brittle stars is submerged in oceanic brine. For the next six hours, it is left naked under cold coastal mist.</p>
  <div class="note">
    <strong>Field Note 402:</strong> Observed a colony of <em>Anthopleura elegantissima</em> maintaining precise millimeter boundaries against a rival clone on the basalt shelf.
  </div>
  <h2>Current Observations</h2>
  <p>To understand the shoreline, one must listen not to the breaking surf, but to the drainage through gravel bars. The acoustic spectrum here intersects directly with <a href="deepchronicle.org">Benthic Soundscapes</a>, recorded forty nautical miles out from Cape Blanco.</p>
  <p>Further inland, the salt spray gives way to the strange granite cairns documented in <a href="atlas.void">The Unmapped Constellations</a>, while the rock faces shelter slow colonies of <a href="lichen.notes">Crustose Lichens</a>.</p>
  <p>Last winter, local fishermen reported unusual beacon reflections near the submerged shelf of <a href="sunken.reef">Sunken Reef</a>, though maritime charts insist nothing remains there.</p>
  <div class="footer">Published by Dr. Aris Thorne · Address: <code>tidepool.zz</code></div>
</body>
</html>`,
  },
  {
    address: 'deepchronicle.org',
    title: 'Benthic Soundscapes & Hydrophone Logs',
    authorHandle: 'aris',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Benthic Soundscapes</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #070b12; color: #a5b4cb; max-width: 650px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
  h1 { color: #5ce1e6; font-size: 26px; }
  .hydro { background: #0e1726; border: 1px solid #1e2c44; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px; }
  a { color: #38bdf8; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <h1>Benthic Soundscapes</h1>
  <p>At 3,000 meters below sea level, there is no twilight, but there is immense acoustic pressure. Our hydrophone array tethered off the Cascadia Margin records constant subterranean resonance.</p>
  <div class="hydro">
    RECORDING ID: HYDRO-B77<br>
    DEPTH: 2,840m<br>
    FREQ PEAK: 17.4 Hz (Ultra-low vibrational pulse)<br>
    ANALYSIS: Non-tectonic, periodic modulation
  </div>
  <p>These underwater acoustic signatures mirror atmospheric radio disturbances monitored by Julian at <a href="signal.zone">The Signal Zone</a>. What enters through the ionosphere appears to echo through ocean trenches.</p>
  <p>For shallow water comparative tables, see <a href="tidepool.zz">The Intertidal Archive</a>. Deep acoustic traces pointing toward <a href="abyssal.plain">Abyssal Plain Outpost</a> have not responded since 2024.</p>
</body>
</html>`,
  },
  {
    address: 'atlas.void',
    title: 'The Unmapped Constellations',
    authorHandle: 'maya',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>The Unmapped Constellations</title>
<style>
  body { font-family: 'Courier New', monospace; background: #fdfbf7; color: #2b2b2b; max-width: 640px; margin: 40px auto; padding: 0 20px; line-height: 1.8; }
  h1 { font-size: 22px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #2b2b2b; padding-bottom: 6px; }
  a { color: #8b3a0f; font-weight: bold; }
  .grid { border: 1px dashed #777; padding: 12px; margin: 20px 0; }
</style>
</head>
<body>
  <h1>The Unmapped Constellations</h1>
  <p>Cartography always tells you more about what the cartographer wanted to omit than what actually exists on the ground. When you turn off GPS receivers and look through the cloud ceiling above the dunes, you find configurations that Ptolemy never cataloged.</p>
  <div class="grid">
    COORDINATE DRAFT 12:<br>
    Vector 44°12'N / Sector Null<br>
    Observation: Heavy fog bank resting upon ancient glacial erratics.
  </div>
  <p>I frequently hike out from the coastal rock colonies of <a href="tidepool.zz">tidepool.zz</a>, crossing the scree slopes where <a href="lichen.notes">Lichen Notes</a> are collected.</p>
  <p>On clear autumn dawns, the silhouettes of concrete communication pylons appear on the horizon, documented by Kaelen in <a href="monolith.io">The Quiet Geometry</a>.</p>
  <p>Navigation note: Avoid following old compass bearings toward <a href="lost.meridian">The Lost Meridian</a>; the trail washed away decades ago.</p>
</body>
</html>`,
  },
  {
    address: 'lichen.notes',
    title: 'Symbiosis in Slow Motion',
    authorHandle: 'maya',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Lichen Notes</title>
<style>
  body { font-family: serif; background: #f4f6f0; color: #283618; max-width: 620px; margin: 50px auto; padding: 0 20px; line-height: 1.7; }
  h1 { color: #606c38; font-size: 26px; }
  a { color: #bc6c25; text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
  blockquote { font-style: italic; border-left: 3px solid #dda15e; margin: 20px 0; padding-left: 16px; color: #435429; }
</style>
</head>
<body>
  <h1>Symbiosis in Slow Motion</h1>
  <p>A lichen is not a single organism. It is a biological treaty: a fungal partner providing shelter and water, and an alga or cyanobacteria generating food from sunshine. They grow at fractions of a millimeter per century.</p>
  <blockquote>"To touch yellow Xanthoria parietina on headland granite is to rest your fingertips on an ongoing conversation started during the Little Ice Age."</blockquote>
  <p>These slow growths bridge geology and botany. My observations correlate closely with botanical humidity logs kept at <a href="greenhouse.lab">The Night Garden Journal</a>, as well as fungal signalling research in <a href="soil.network">Mycelial Telegraphy</a>.</p>
  <p>For celestial orientation during field expeditions, I cross-reference <a href="atlas.void">The Unmapped Constellations</a>.</p>
</body>
</html>`,
  },
  {
    address: 'signal.zone',
    title: 'Shortwave, VLF & Atmospheric Noise',
    authorHandle: 'julian',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Signal Zone</title>
<style>
  body { font-family: monospace; background: #121214; color: #39ff14; max-width: 660px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
  h1 { color: #ffffff; border-bottom: 1px solid #39ff14; padding-bottom: 8px; font-size: 22px; }
  a { color: #00e5ff; }
  .freq { background: #1c1d22; padding: 10px 14px; border: 1px solid #333; margin: 18px 0; }
</style>
</head>
<body>
  <h1>SIGNAL.ZONE // 0.01 - 30 MHz</h1>
  <p>Every night after 02:00 UTC, the D-layer of the ionosphere dissipates, opening propagation paths across thousands of kilometers of dark ocean.</p>
  <div class="freq">
    DIAL LOG: 4625 kHz — The buzzer maintains steady rhythm.<br>
    DIAL LOG: 8992 kHz — High-frequency global communications system.<br>
    DIAL LOG: 14.195 MHz — Faint Morse signals drifting through magnetic turbulence.
  </div>
  <p>Acoustic echoes from these radio bursts penetrate deep ocean trenches, matching logs in <a href="deepchronicle.org">Benthic Soundscapes</a>.</p>
  <p>The transmission masts often stand atop derelict coastal radar installations described in <a href="monolith.io">The Quiet Geometry</a>.</p>
  <p>Signal tracking to <a href="ghost.station">Ghost Station E-07</a> timed out with dead carrier tone.</p>
</body>
</html>`,
  },
  {
    address: 'monolith.io',
    title: 'The Quiet Geometry — Brutalism in Fog',
    authorHandle: 'kaelen',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>The Quiet Geometry</title>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #e5e5e5; color: #1a1a1a; max-width: 640px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
  h1 { font-size: 30px; letter-spacing: -1px; margin-bottom: 16px; }
  a { color: #000; font-weight: bold; border-bottom: 2px solid #000; }
  .box { background: #fff; padding: 20px; border: 2px solid #1a1a1a; margin: 24px 0; }
</style>
</head>
<body>
  <h1>The Quiet Geometry</h1>
  <p>Reinforced concrete does not rot; it stains. In maritime climates, salt-laden moisture penetrates the microscopic pores of cast concrete, creating patterns of dark weeping streaks that resemble contour maps.</p>
  <div class="box">
    <strong>Structure Index 08:</strong> Coastal Acoustic Mirror, Denge Sound Mirrors.<br>
    Massive concave concrete dishes built in the 1920s to detect approaching engines before radar existed. Still standing, listening to gulls and foghorns.
  </div>
  <p>Many of these towers support antennae carrying transmissions logged at <a href="signal.zone">signal.zone</a>. Their weathered surfaces form ideal substrates for urban <a href="concrete.poem">Typography of Neglect</a>.</p>
  <p>On clear mornings, their summits offer visual line-of-sight to the navigation cairns plotted in <a href="atlas.void">The Unmapped Constellations</a>.</p>
</body>
</html>`,
  },
  {
    address: 'greenhouse.lab',
    title: 'The Night Garden Journal',
    authorHandle: 'maya',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Night Garden Journal</title>
<style>
  body { font-family: 'Palatino', serif; background: #0f1c15; color: #d8e2dc; max-width: 630px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
  h1 { color: #95d5b2; font-size: 26px; }
  a { color: #52b788; text-decoration: none; border-bottom: 1px dotted; }
  .entry { border-bottom: 1px solid #2d4a3e; padding-bottom: 16px; margin-bottom: 20px; }
</style>
</head>
<body>
  <h1>Night Garden Journal</h1>
  <div class="entry">
    <p><em>Selenicereus grandiflorus</em> blooms for exactly one night each summer. The buds begin opening at 21:30, releasing a sweet fragrance of vanilla into the glasshouse, and wilt completely before the sun crests the trees.</p>
  </div>
  <p>The root systems are linked with fungal cultures received from Aris's culture collections described in <a href="soil.network">Mycelial Telegraphy</a>.</p>
  <p>Adjacent exterior walls are kept untreated to monitor the comparative growth rates from <a href="lichen.notes">Lichen Notes</a> and tidal moisture from <a href="tidepool.zz">The Intertidal Archive</a>.</p>
</body>
</html>`,
  },
  {
    address: 'soil.network',
    title: 'Mycelial Telegraphy & Root Communication',
    authorHandle: 'aris',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Mycelial Telegraphy</title>
<style>
  body { font-family: system-ui, sans-serif; background: #191512; color: #d4c5b9; max-width: 640px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
  h1 { color: #d97706; font-size: 26px; }
  a { color: #f59e0b; text-decoration: underline; }
  .bio { background: #261e19; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
</style>
</head>
<body>
  <h1>Mycelial Telegraphy</h1>
  <p>Under every square meter of temperate forest soil lies hundreds of kilometers of fungal hyphae. When an aphid attacks an elderberry branch on the northern perimeter, calcium waves pulse through the mycorrhizal grid within minutes.</p>
  <div class="bio">
    MEASUREMENT: Micro-electrode probe inserted in <em>Armillaria</em> rhizomorph recorded spike trains of 2.5 mV during moisture transitions.
  </div>
  <p>These bio-electric pulses feed into humidity experiments at <a href="greenhouse.lab">The Night Garden Journal</a> and slow lichen symbioses in <a href="lichen.notes">Lichen Notes</a>.</p>
  <p>Warning: An attempt to query the defunct registry at <a href="nowhere.void">Nowhere Void</a> results in an address resolution failure.</p>
</body>
</html>`,
  },
  {
    address: 'concrete.poem',
    title: 'Typography of Neglect',
    authorHandle: 'julian',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Typography of Neglect</title>
<style>
  body { font-family: 'Space Mono', monospace; background: #222; color: #eee; max-width: 620px; margin: 40px auto; padding: 0 20px; line-height: 1.8; }
  h1 { font-size: 24px; color: #ffcc00; text-transform: uppercase; }
  a { color: #ff6600; text-decoration: none; border-bottom: 1px solid; }
  .plate { background: #333; padding: 14px; border-left: 4px solid #ffcc00; margin: 18px 0; }
</style>
</head>
<body>
  <h1>Typography of Neglect</h1>
  <p>There is a specific poetry in lettering that has survived the enterprise that commissioned it. Enamel door plates from railway companies that dissolved fifty years ago; hand-painted arrows pointing to air-raid shelters converted into potato cellars.</p>
  <div class="plate">
    SIGN SPECIMEN: "CAUTION: HIGH TENSION CABLES IN TRENCH"<br>
    Location: Disused radar gantry outside town.<br>
    Lettering style: Hand-cut Gill Sans stencil in lead white.
  </div>
  <p>These artifacts cling to the structures documented in <a href="monolith.io">The Quiet Geometry</a> and listen to frequencies humming on <a href="signal.zone">signal.zone</a>.</p>
</body>
</html>`,
  },
  {
    address: 'ephemera.log',
    title: 'The Cabinet of Lost Addresses',
    authorHandle: 'alice',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>The Cabinet of Lost Addresses</title>
<style>
  body { font-family: 'Georgia', serif; background: #fbfbfa; color: #1c1c1c; max-width: 660px; margin: 40px auto; padding: 0 20px; line-height: 1.8; }
  h1 { font-size: 28px; font-weight: normal; border-bottom: 2px solid #e0e0dc; padding-bottom: 10px; }
  a { color: #1a5fb4; text-decoration: none; border-bottom: 1px dotted #1a5fb4; }
  a:hover { color: #e01b24; border-bottom: 1px solid #e01b24; }
  .index { list-style: square; padding-left: 20px; }
  .index li { margin-bottom: 8px; }
</style>
</head>
<body>
  <h1>The Cabinet of Lost Addresses</h1>
  <p>This is my personal catalog of nodes in the small web. Sites built by single people, maintained out of fascination rather than commerce. Some flourish quietly; others have already slipped beneath the digital horizon.</p>
  <h2>Curated Outposts</h2>
  <ul class="index">
    <li><a href="tidepool.zz">tidepool.zz</a> — Marine field notebook by Dr. Aris Thorne.</li>
    <li><a href="atlas.void">atlas.void</a> — Celestial coordinates and unmapped terrain by Maya Lin.</li>
    <li><a href="signal.zone">signal.zone</a> — VLF and shortwave frequencies by Julian Vance.</li>
    <li><a href="monolith.io">monolith.io</a> — Brutalist towers and coastal fog by Kaelen Ross.</li>
    <li><a href="deepchronicle.org">deepchronicle.org</a> — Benthic acoustic recordings.</li>
    <li><a href="broken.page">broken.page</a> — An old portal that no longer responds.</li>
  </ul>
  <p>If you wander long enough across these links, you will realize that every address is a doorway into someone's private universe.</p>
</body>
</html>`,
  },
];
