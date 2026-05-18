const fs = require('fs');
const files = [
  './src/pages/Profile.jsx',
  './src/components/prescription/Prescription.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // For Profile.jsx
  content = content.replace(/cyan-500/g, 'teal-600');
  content = content.replace(/cyan-600/g, 'teal-700');
  content = content.replace(/cyan-400/g, 'teal-400');
  content = content.replace(/cyan-100/g, 'teal-100');
  content = content.replace(/cyan-50/g, 'teal-50');
  content = content.replace(/cyan-700/g, 'teal-800');
  content = content.replace(/cyan-900/g, 'teal-900');
  
  // For Prescription.jsx
  content = content.replace(/blue-600/g, 'teal-600');
  content = content.replace(/blue-700/g, 'teal-700');
  content = content.replace(/blue-500/g, 'teal-500');
  content = content.replace(/blue-300/g, 'teal-300');
  content = content.replace(/blue-100/g, 'teal-100');
  content = content.replace(/blue-50/g, 'teal-50');
  content = content.replace(/blue-800/g, 'teal-800');
  content = content.replace(/blue-900/g, 'teal-900');

  // Text colors
  content = content.replace(/text-slate-900/g, 'text-[color:var(--txt-primary)]');
  content = content.replace(/text-slate-800/g, 'text-[color:var(--txt-primary)]');
  content = content.replace(/text-slate-700/g, 'text-[color:var(--txt-primary)]');
  content = content.replace(/text-slate-600/g, 'text-[color:var(--txt-secondary)]');
  content = content.replace(/text-slate-500/g, 'text-[color:var(--txt-muted)]');
  content = content.replace(/text-slate-400/g, 'text-[color:var(--txt-muted)]');
  
  // Let text-white be text-white since it's used inside buttons that are colored.
  
  // Background colors
  content = content.replace(/bg-white/g, 'bg-[var(--bg-card)]');
  content = content.replace(/bg-slate-50/g, 'bg-[var(--bg-subtle)]');
  content = content.replace(/bg-slate-900/g, 'bg-[var(--bg-card)]');
  content = content.replace(/bg-slate-800\/50/g, 'bg-[var(--bg-subtle)]');
  content = content.replace(/bg-slate-800/g, 'bg-[var(--bg-subtle)]');
  content = content.replace(/bg-slate-950/g, 'bg-[var(--bg-card)]');
  
  // Dark mode specific removals
  content = content.replace(/dark:bg-slate-[0-9]+(\/[0-9]+)?/g, '');
  content = content.replace(/dark:border-slate-[0-9]+/g, '');
  content = content.replace(/dark:text-white/g, '');
  content = content.replace(/dark:text-slate-[0-9]+/g, '');
  content = content.replace(/dark:text-teal-[0-9]+/g, '');
  content = content.replace(/dark:bg-teal-[0-9]+\/[0-9]+/g, '');
  content = content.replace(/dark:border-teal-[0-9]+/g, '');
  
  // Borders
  content = content.replace(/border-slate-100/g, 'border-[var(--border)]');
  content = content.replace(/border-slate-200/g, 'border-[var(--border)]');
  content = content.replace(/border-slate-700/g, 'border-[var(--border)]');
  content = content.replace(/border-slate-800/g, 'border-[var(--border)]');

  fs.writeFileSync(file, content);
});
console.log("Done");
