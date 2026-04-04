import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  smallint,
  uuid,
  boolean,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Auth tables (managed by better-auth) ───────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    idToken: text('id_token'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('accounts_provider_account').on(t.providerId, t.accountId)],
)

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Puzzle tables ───────────────────────────────────────────────────────────

export const puzzles = pgTable('puzzles', {
  id: uuid('id').primaryKey().defaultRandom(),
  difficulty: text('difficulty').notNull(),
  givens: text('givens').notNull(),        // 81 chars, '0' = empty — safe to send
  solution: text('solution').notNull(),    // 81 chars — NEVER sent to client
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const dailyPuzzles = pgTable('daily_puzzles', {
  id: uuid('id').primaryKey().defaultRandom(),
  puzzleId: uuid('puzzle_id').notNull().references(() => puzzles.id),
  date: date('date').notNull().unique(),
  difficulty: text('difficulty').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const puzzleSessions = pgTable(
  'puzzle_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    puzzleId: uuid('puzzle_id').notNull().references(() => puzzles.id),
    dailyPuzzleId: uuid('daily_puzzle_id').references(() => dailyPuzzles.id),
    sessionToken: text('session_token').notNull().unique(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    clientElapsed: integer('client_elapsed'),
    status: text('status').notNull().default('active'),
    errorsMade: smallint('errors_made').notNull().default(0),
    hintsUsed: smallint('hints_used').notNull().default(0),
  },
  (t) => [
    index('idx_puzzle_sessions_user_puzzle').on(t.userId, t.puzzleId),
    check('status_check', sql`${t.status} IN ('active','completed','abandoned')`),
  ],
)

export const completions = pgTable(
  'completions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    puzzleId: uuid('puzzle_id').notNull().references(() => puzzles.id),
    dailyPuzzleId: uuid('daily_puzzle_id').references(() => dailyPuzzles.id),
    sessionToken: text('session_token').notNull(),
    elapsedSeconds: integer('elapsed_seconds').notNull(),
    errorsMade: smallint('errors_made').notNull(),
    hintsUsed: smallint('hints_used').notNull(),
    autoPencilUsed: smallint('auto_pencil_used').notNull().default(0),
    adjustedTime: integer('adjusted_time').notNull(),
    playsCount: integer('plays_count').notNull().default(1),
    difficulty: text('difficulty').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('completions_user_puzzle').on(t.userId, t.puzzleId),
    index('idx_completions_daily').on(t.dailyPuzzleId),
    index('idx_completions_completed_at').on(t.completedAt),
    index('idx_completions_user_id').on(t.userId),
  ],
)

export const weeklyRankings = pgTable(
  'weekly_rankings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    weekStart: date('week_start').notNull(),
    totalAdjustedTime: integer('total_adjusted_time').notNull().default(0),
    gamesPlayed: integer('games_played').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('weekly_rankings_user_week').on(t.userId, t.weekStart),
    index('idx_weekly_rankings_week').on(t.weekStart, t.totalAdjustedTime),
  ],
)

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('upcoming'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
