import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const game_sessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  session_code: text("session_code").notNull().unique(),
  phase: text("phase").notNull().default("lobby"), // 'lobby', 'quiz', 'results'
  current_question: integer("current_question").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  session_id: varchar("session_id").notNull().references(() => game_sessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  score: integer("score").default(0),
  answers: jsonb("answers").default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSessionSchema = createInsertSchema(game_sessions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSession = typeof game_sessions.$inferSelect;
export type Player = typeof players.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
