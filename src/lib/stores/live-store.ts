import { create } from 'zustand';
import type { LeaderboardEntry } from '@/lib/api/types';

interface LiveState {
  /** Live leaderboard data from WebSocket */
  liveLeaderboard: LeaderboardEntry[];
  /** Current challenge countdown in seconds */
  timerSeconds: number;
  /** Whether a live challenge is active */
  isLive: boolean;
  /** Currently active challenge ID */
  activeChallengeId: string | null;
  /** Currently active round ID */
  activeRoundId: string | null;
  /** Online team member IDs */
  onlineMembers: string[];

  setLiveLeaderboard: (entries: LeaderboardEntry[]) => void;
  setTimer: (seconds: number) => void;
  tickTimer: () => void;
  startLive: (challengeId: string, roundId: string, seconds: number) => void;
  endLive: () => void;
  setOnlineMembers: (members: string[]) => void;
  addOnlineMember: (memberId: string) => void;
  removeOnlineMember: (memberId: string) => void;
}

export const useLiveStore = create<LiveState>()((set) => ({
  liveLeaderboard: [],
  timerSeconds: 0,
  isLive: false,
  activeChallengeId: null,
  activeRoundId: null,
  onlineMembers: [],

  setLiveLeaderboard: (entries) => set({ liveLeaderboard: entries }),

  setTimer: (seconds) => set({ timerSeconds: seconds }),

  tickTimer: () =>
    set((state) => ({
      timerSeconds: Math.max(0, state.timerSeconds - 1),
    })),

  startLive: (challengeId, roundId, seconds) =>
    set({
      isLive: true,
      activeChallengeId: challengeId,
      activeRoundId: roundId,
      timerSeconds: seconds,
    }),

  endLive: () =>
    set({
      isLive: false,
      activeChallengeId: null,
      activeRoundId: null,
      timerSeconds: 0,
    }),

  setOnlineMembers: (members) => set({ onlineMembers: members }),

  addOnlineMember: (memberId) =>
    set((state) => ({
      onlineMembers: [...new Set([...state.onlineMembers, memberId])],
    })),

  removeOnlineMember: (memberId) =>
    set((state) => ({
      onlineMembers: state.onlineMembers.filter((id) => id !== memberId),
    })),
}));
