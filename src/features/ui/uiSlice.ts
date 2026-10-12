import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  playerStatsModal: {id: string | null };
  gameReportModal: { id: string | null };
}

const initialState: UIState = {
  playerModal: { mode: 'add', id: null },
  clubModal: { mode: 'add', id: null },
  seasonModal: { mode: 'add', id: null },
  teamModal: { mode: 'add', id: null },
  gameModal: { mode: 'add', id: null },
  scoutModal: { id: null },
  gameStatsModal: { id: null },
  playerStatsModal: { id: null },
  gameReportModal: { id: null }
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
    openPlayerStatsModal(state, action: PayloadAction<string>) { state.playerStatsModal = { id: action.payload}; },
    openGameReportModal(state, action: PayloadAction<string>) { state.gameReportModal = { id: action.payload}; },
  },
});

export const {
  openAddPlayerModal, openEditPlayerModal,
  openAddClubModal, openEditClubModal,
  openAddSeasonModal, openEditSeasonModal,
  openAddTeamModal, openEditTeamModal,
  openAddGameModal, openEditGameModal,
  openScoutModal, openGameStatsModal,
  openPlayerStatsModal,
  openGameReportModal,
} = slice.actions;

export default slice.reducer;
