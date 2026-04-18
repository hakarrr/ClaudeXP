export const LEVELS = [
  { level: 1,  title: 'Script Kiddie',        xpRequired: 0      },
  { level: 2,  title: 'Bug Hunter',           xpRequired: 500    },
  { level: 3,  title: 'Snippet Slinger',      xpRequired: 1500   },
  { level: 4,  title: 'Junior Dev',           xpRequired: 3000   },
  { level: 5,  title: 'Feature Builder',      xpRequired: 5500   },
  { level: 6,  title: 'Refactor Wizard',      xpRequired: 9000   },
  { level: 7,  title: 'Pull Request Pro',     xpRequired: 14000  },
  { level: 8,  title: 'Module Master',        xpRequired: 21000  },
  { level: 9,  title: 'System Thinker',       xpRequired: 30000  },
  { level: 10, title: 'Code Architect',       xpRequired: 42000  },
  { level: 11, title: 'Staff Engineer',       xpRequired: 57000  },
  { level: 12, title: 'Senior Code Wrangler', xpRequired: 75000  },
  { level: 13, title: 'Principal Dev',        xpRequired: 97000  },
  { level: 14, title: 'Claude Whisperer',     xpRequired: 124000 },
  { level: 15, title: '10x Legend',           xpRequired: 157000 },
];

export function levelFor(totalXP) {
  let found = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.xpRequired) found = lvl;
    else break;
  }
  return found;
}

export function nextLevelOf(levelInfo) {
  const idx = LEVELS.findIndex(l => l.level === levelInfo.level);
  if (idx < 0 || idx === LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function progressToNext(totalXP, levelInfo) {
  const next = nextLevelOf(levelInfo);
  if (!next) return 100;
  const range = next.xpRequired - levelInfo.xpRequired;
  const into = totalXP - levelInfo.xpRequired;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((into / range) * 100)));
}
