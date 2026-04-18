import {
  unlockAchievement, getUnlockedAchievementKeys, countSessions,
  countSessionsWithBreakdown, getConsecutiveDays,
} from './db.js';

export const ACHIEVEMENTS = [
  { key: 'first_blood',    title: 'First Blood',    desc: 'Complete your first session' },
  { key: 'on_a_roll',      title: 'On a Roll',      desc: '7-day coding streak' },
  { key: 'deep_diver',     title: 'Deep Diver',     desc: '30+ tool uses in a single session' },
  { key: 'bug_slayer',     title: 'Bug Slayer',     desc: '10 bug-fix sessions' },
  { key: 'ship_it',        title: 'Ship It',        desc: '10 feature sessions' },
  { key: 'century',        title: 'Century',        desc: '100 total sessions' },
  { key: 'xp_millionaire', title: 'XP Millionaire', desc: 'Reach 10,000 total XP' },
  { key: 'legendary',      title: 'Legendary',      desc: 'Reach level 15' },
];

export function getAchievementByKey(key) {
  return ACHIEVEMENTS.find(a => a.key === key);
}

export function checkAchievements(db, userId, signals, totalXP, levelInfo) {
  const unlocked = getUnlockedAchievementKeys(db, userId);
  const newly = [];

  const tryUnlock = (key) => {
    if (unlocked.has(key)) return;
    if (unlockAchievement(db, userId, key)) {
      unlocked.add(key);
      newly.push(getAchievementByKey(key));
    }
  };

  const sessionCount = countSessions(db, userId);
  if (sessionCount >= 1)   tryUnlock('first_blood');
  if (sessionCount >= 100) tryUnlock('century');

  if ((signals.toolUses ?? 0) >= 30) tryUnlock('deep_diver');

  if (countSessionsWithBreakdown(db, userId, 'Bug fix bonus')    >= 10) tryUnlock('bug_slayer');
  if (countSessionsWithBreakdown(db, userId, 'New feature bonus') >= 10) tryUnlock('ship_it');

  if (totalXP >= 10000)       tryUnlock('xp_millionaire');
  if (levelInfo.level >= 15)  tryUnlock('legendary');

  if (getConsecutiveDays(db, userId) >= 7) tryUnlock('on_a_roll');

  return newly;
}
