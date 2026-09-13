/**
 * Centralized REST endpoint definitions consumed by API hooks.
 *
 * All paths are relative to VITE_API_URL.
 * Keep this file synchronized with docs/api/openapi.yaml.
 */
export const ENDPOINTS = {
  /** Authentication and session endpoints. */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    setupPassword: '/auth/setup-password',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/users/me',
  },
  /** User management endpoints. */
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    updateRole: (id: string) => `/users/${id}/role`,
    delete: (id: string) => `/users/${id}`,
  },
  /** Team membership and role management endpoints. */
  teams: {
    list: '/teams',
    detail: (id: string) => `/teams/${id}`,
    create: '/teams',
    update: (id: string) => `/teams/${id}`,
    join: (id: string) => `/teams/${id}/join`,
    leave: (id: string) => `/teams/${id}/leave`,
    transfer: (id: string) => `/teams/${id}/transfer`,
    roles: (id: string) => `/teams/${id}/roles`,
  },
  /** Weekly mission management endpoints. */
  missions: {
    list: '/missions',
    current: '/missions/current',
    detail: (id: string) => `/missions/${id}`,
    create: '/missions',
    update: (id: string) => `/missions/${id}`,
    delete: (id: string) => `/missions/${id}`,
    publish: (id: string) => `/missions/${id}/publish`,
  },
  /** Challenge lifecycle and rounds endpoints. */
  challenges: {
    list: '/challenges',
    detail: (id: string) => `/challenges/${id}`,
    create: '/challenges',
    update: (id: string) => `/challenges/${id}`,
    start: (id: string) => `/challenges/${id}/start`,
    stop: (id: string) => `/challenges/${id}/stop`,
    rounds: (id: string) => `/challenges/${id}/rounds`,
    addRound: (id: string) => `/challenges/${id}/rounds`,
  },
  /** Submission creation and upload endpoints. */
  submissions: {
    create: '/submissions',
    list: '/submissions',
    upload: (id: string) => `/submissions/${id}/upload`,
  },
  /** Team and individual leaderboard endpoints. */
  leaderboard: {
    standings: '/leaderboard',
    weekly: '/leaderboard/weekly',
    history: '/leaderboard/history',
    individual: '/leaderboard/individual',
  },
  /** Score ledger endpoints. */
  scores: {
    create: '/scores',
    update: (id: string) => `/scores/${id}`,
    list: '/scores',
  },
  /** Awards and winner declaration endpoints. */
  awards: {
    list: '/awards',
    winners: '/awards/winners',
    create: '/awards',
    nominate: (id: string) => `/awards/${id}/nominate`,
    declareWinner: (id: string) => `/awards/${id}/winner`,
  },
  /** Notification inbox endpoints. */
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  /** Season configuration endpoints. */
  season: {
    current: '/season',
    update: '/season',
  },
} as const;
