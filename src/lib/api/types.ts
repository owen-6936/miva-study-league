/** ============================================================
   API Type Definitions
   Full TypeScript interfaces for every API entity
   ============================================================ */

// ---- Auth ----
/** Login request payload. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Registration payload for a new student user. */
export interface RegisterRequest {
  email: string;
  fullName: string;
  matricNumber: string;
}

/** Auth response returned after successful login. */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Password reset request payload. */
export interface PasswordResetRequest {
  email: string;
}

/** Password setup or reset payload that includes token and confirmation. */
export interface PasswordSetupRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ---- User ----
/** Application user role. */
export type UserRole = 'student' | 'admin';

/** User profile model used throughout the frontend. */
export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  matricNumber: string;
  role: UserRole;
  teamId: string | null;
  team?: string;
  avatarUrl: string | null;
  transferTokens: number;
  graceDeadline: string | null;
  totalPoints: number;
  points?: number;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

// ---- Team ----
/** Team assignment roles for members. */
export type TeamRole =
  'captain' | 'academic_lead' | 'presenter' | 'record_keeper' | 'timekeeper' | 'qa' | 'strategist';

/** Team member record including user details and assigned responsibility. */
export interface TeamMember {
  id: string;
  userId: string;
  user: User;
  teamId: string;
  role: TeamRole | null;
  joinedAt: string;
}

/** Team domain model used by overview and leaderboard pages. */
export interface Team {
  _id?: string;
  id: string;
  name: string;
  emoji: string;
  color?: string;
  slogan?: string;
  maxMembers: number;
  members: User[];
  points: number;
  point?: number; // legacy
  captainId?: string;
  rank?: number;
  createdAt: string;
  updatedAt: string;
}

/** Team join request payload. */
export interface TeamJoinRequest {
  teamId: string;
}

/** Team transfer request payload. */
export interface TeamTransferRequest {
  targetTeamId: string;
}

/** Role assignment payload for bulk team role updates. */
export interface TeamRolesUpdate {
  assignments: Array<{ userId: string; role: TeamRole }>;
}

// ---- Mission ----
/** Lifecycle status for missions. */
export type MissionStatus = 'draft' | 'published' | 'active' | 'completed';

export interface MissionResource {
  id?: string;
  title: string;
  type: 'video' | 'audio' | 'article' | 'document';
  url: string;
  description?: string;
}

/** Individual mission task item. */
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface MissionTask {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'TEXT_RESPONSE' | 'URL_SUBMISSION' | 'QUIZ';
  points: number;
  isRequired: boolean;
  
  // Quiz Specific Fields
  quizQuestions?: QuizQuestion[];
}

/** Weekly mission model. */
export interface Mission {
  id: string;
  title: string;
  courseId: string;
  
  // The B.R.A.D framework
  storyBrief: string;      // The gamified scenario (Markdown supported)
  resources: MissionResource[]; // Rich media resources for the Briefing Room
  tasks: MissionTask[];    // The actual deliverables
  
  // Loot & Mechanics
  basePoints: number;
  firstBloodBonus: number; // Extra points for fast submitters
  teamSynergyBonus: number;// Bonus if the whole team completes it
  
  // Timing
  createdAt: string;
  deadline: string;
  status?: 'active' | 'expired' | 'completed' | 'upcoming' | 'grading';
}

// ---- Challenge ----
/** Lifecycle status for weekly challenges. */
export type ChallengeStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
/** Supported challenge round styles. */
export type RoundType = 'quick_fire' | 'problem_battle' | 'team_challenge' | 'final_challenge';

/** Challenge round model. */
export interface Round {
  id: string;
  challengeId: string;
  type: RoundType;
  title: string;
  description: string;
  prompt: string;
  timeLimitSeconds: number;
  maxPoints: number;
  order: number;
  status: ChallengeStatus;
  startedAt: string | null;
  endedAt: string | null;
}

/** Challenge model with nested rounds. */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  weekNumber: number;
  status: ChallengeStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

// ---- Submission ----
/** Supported submission content formats. */
export type SubmissionType = 'text' | 'file';

/** Submission model for challenge answers. */
export interface Submission {
  id: string;
  challengeId: string;
  roundId: string;
  teamId: string;
  userId: string;
  type: SubmissionType;
  textContent: string | null;
  fileUrl: string | null;
  fileName: string | null;
  submittedAt: string;
}

/** Submit answer request payload. */
export interface SubmitAnswerRequest {
  challengeId: string;
  roundId: string;
  teamId: string;
  type: SubmissionType;
  textContent?: string;
}

// ---- Leaderboard ----
/** Team leaderboard row. */
export interface LeaderboardEntry {
  rank: number;
  team: Team;
  totalPoints: number;
  points?: number;
  weeklyPoints: number;
  wins: number;
  losses: number;
  streak: number;
  trend: 'up' | 'down' | 'same';
  pointHistory: number[];
}

/** Individual student leaderboard row. */
export interface IndividualRanking {
  rank: number;
  user: User;
  totalPoints: number;
  points?: number;
  teamName: string;
}

// ---- Scores ----
/** Score ledger entry for a challenge round. */
export interface Score {
  id: string;
  challengeId: string;
  roundId: string;
  teamId: string;
  points: number;
  enteredBy: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

/** Payload for score creation. */
export interface ScoreEntryRequest {
  challengeId: string;
  roundId: string;
  teamId: string;
  points: number;
}

// ---- Awards ----
/** Supported award categories. */
export type AwardCategory =
  | 'academic_mvp'
  | 'best_teacher'
  | 'quick_thinker'
  | 'most_improved'
  | 'team_player'
  | 'rising_star';

/** Award definition model. */
export interface Award {
  id: string;
  category: AwardCategory;
  title: string;
  description: string;
  icon: string;
}

/** Award winner record for a given week. */
export interface AwardWinner {
  id: string;
  award: Award;
  user: User;
  weekNumber: number;
  reason: string;
  awardedAt: string;
}

/** Award nomination payload. */
export interface NominationRequest {
  awardId: string;
  nomineeId: string;
  reason: string;
}

// ---- Notifications ----
/** Supported notification event categories. */
export type NotificationType =
  | 'mission_published'
  | 'challenge_starting'
  | 'challenge_ended'
  | 'score_update'
  | 'award_received'
  | 'team_update'
  | 'system';

/** User notification model. */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: unknown;
  createdAt: string;
}


// ---- Season ----
/** Active season configuration model. */
export interface Season {
  id: string;
  seasonNumber: number;
  academicStartDate: string;
  totalWeeks: number;
  isActive: boolean;
}

// ---- Timetable ----
/** Days of the week for scheduling. */
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/** An individual class or event on the timetable. */
export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  date?: string; // Optional specific date (YYYY-MM-DD)
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "11:00 AM"
  courseCode: string;
  title: string;
  instructor?: string;
  location?: string; // e.g. "Room 302" or Zoom link
  type: 'Lecture' | 'Tutorial' | 'Lab' | 'Study Session' | 'Other';
}


// ---- API Response Wrappers ----
/** Generic successful API envelope with typed data payload. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Generic paginated collection envelope. */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Generic API error envelope. */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ---- Socket Events ----
/** Realtime event contract consumed by frontend socket listeners. */
export interface SocketEvents {
  'leaderboard:update': LeaderboardEntry[];
  'challenge:started': { challengeId: string; roundId: string; endsAt: string };
  'challenge:tick': { remainingSeconds: number };
  'challenge:ended': { challengeId: string; results: LeaderboardEntry[] };
  'score:update': { teamId: string; roundId: string; points: number; totalPoints: number };
  'notification:new': Notification;
  'team:memberJoined': { teamId: string; user: User };
  'team:memberLeft': { teamId: string; userId: string };
  'timer:sync': { remainingSeconds: number; serverTime: string };
}
