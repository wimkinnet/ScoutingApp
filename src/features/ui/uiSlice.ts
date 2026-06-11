import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GamePlayer } from '../../app/types';

interface ModalState {
  mode: 'add' | 'edit';
  id: string | null;
}

interface UIState {
  playerModal: ModalState;
  clubModal: ModalState;
  seasonModal: ModalState;
  teamModal: ModalState;
  gameModal: ModalState;
  scoutModal: { id: string | null };
  gameStatsModal: { id: string | null };
  actionModal: { 
    game: string | null; player: GamePlayer | null; posX: number | null, posY: number | null,
    possession: string | null, direction: string | null, quarter: number | null, secRem: number | null
  }
}

const initialState: UIState = {
  playerModal: { mode: 'add', id: null },
  clubModal: { mode: 'add', id: null },
  seasonModal: { mode: 'add', id: null },
  teamModal: { mode: 'add', id: null },
  gameModal: { mode: 'add', id: null },
  scoutModal: { id: null },
  gameStatsModal: { id: null },
  actionModal: { game: null, player: null, posX: null, posY: null, possession: null, direction: null, quarter: null, secRem: null }
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddPlayerModal(state) { state.playerModal = { mode: 'add', id: null }; },
    openEditPlayerModal(state, action: PayloadAction<string>) { state.playerModal = { mode: 'edit', id: action.payload}; },
    openAddClubModal(state) { state.clubModal = {  mode: 'add', id: null }; },
    openEditClubModal(state, action: PayloadAction<string>) { state.clubModal = { mode: 'edit', id: action.payload }; },
    openAddSeasonModal(state) { state.seasonModal = { mode: 'add', id: null }; },
    openEditSeasonModal(state, action: PayloadAction<string>) { state.seasonModal = { mode: 'edit', id: action.payload}; },
    openAddTeamModal(state) { state.teamModal = { mode: 'add', id: null }; },
    openEditTeamModal(state, action: PayloadAction<string>) { state.teamModal = { mode: 'edit', id: action.payload}; },
    openAddGameModal(state) { state.gameModal = { mode: 'add', id: null }; },
    openEditGameModal(state, action: PayloadAction<string>) { state.gameModal = { mode: 'edit', id: action.payload}; },
    openScoutModal(state, action: PayloadAction<string>) { state.scoutModal = { id: action.payload}; },
    openGameStatsModal(state, action: PayloadAction<string>) { state.gameStatsModal = { id: action.payload}; },
    openActionModal(state, action) { 
      const { game, player, posX, posY, possession, direction, quarter, secRem } = action.payload;
      state.actionModal = { game: game, player: player, posX: posX, posY: posY, possession: possession, direction: direction, quarter: quarter, secRem: secRem};
    },
  },
});

export const {
  openAddPlayerModal, openEditPlayerModal,
  openAddClubModal, openEditClubModal,
  openAddSeasonModal, openEditSeasonModal,
  openAddTeamModal, openEditTeamModal,
  openAddGameModal, openEditGameModal,
  openScoutModal, openGameStatsModal, openActionModal,
} = slice.actions;

export default slice.reducer;
