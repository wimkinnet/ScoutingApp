import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GamePlayer } from '../../app/types';

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  id: string | null;
}

interface UIState {
  playerModal: ModalState;
  clubModal: ModalState;
  seasonModal: ModalState;
  teamModal: ModalState;
  gameModal: ModalState;
  scoutModal: { isOpen: boolean; id: string | null };
  actionModal: { isOpen: boolean; player: GamePlayer | null; posX: number | null, posY: number | null}
}

const initialState: UIState = {
  playerModal: { isOpen: false, mode: 'add', id: null},
  clubModal: { isOpen: false, mode: 'add', id: null},
  seasonModal: { isOpen: false, mode: 'add', id: null},
  teamModal: { isOpen: false, mode: 'add', id: null},
  gameModal: { isOpen: false, mode: 'add', id: null},
  scoutModal: { isOpen: false, id: null},
  actionModal: { isOpen: false, player: null, posX: null, posY: null}
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddPlayerModal(state) { state.playerModal = { isOpen: true, mode: 'add', id: null }; },
    openEditPlayerModal(state, action: PayloadAction<string>) { state.playerModal = { isOpen: true, mode: 'edit', id: action.payload}; },
    openAddClubModal(state) { state.clubModal = { isOpen: true, mode: 'add', id: null }; },
    openEditClubModal(state, action: PayloadAction<string>) { state.clubModal = { isOpen: true, mode: 'edit', id: action.payload }; },
    openAddSeasonModal(state) { state.seasonModal = { isOpen: true, mode: 'add', id: null }; },
    openEditSeasonModal(state, action: PayloadAction<string>) { state.seasonModal = { isOpen: true, mode: 'edit', id: action.payload}; },
    openAddTeamModal(state) { state.teamModal = { isOpen: true, mode: 'add', id: null }; },
    openEditTeamModal(state, action: PayloadAction<string>) { state.teamModal = { isOpen: true, mode: 'edit', id: action.payload}; },
    openAddGameModal(state) { state.gameModal = { isOpen: true, mode: 'add', id: null }; },
    openEditGameModal(state, action: PayloadAction<string>) { state.gameModal = { isOpen: true, mode: 'edit', id: action.payload}; },
    openScoutModal(state, action: PayloadAction<string>) { state.scoutModal = { isOpen: true, id: action.payload}; },
    openActionModal(state, action) { 
      const { player, posX, posY } = action.payload;
      console.log(player);
      console.log(player.playerId);
      state.actionModal = { isOpen: true, player: player, posX: posX, posY: posY};
    },
    closeModal(state) { 
      state.playerModal.isOpen = false; 
      state.clubModal.isOpen = false; 
      state.seasonModal.isOpen = false; 
      state.teamModal.isOpen = false; 
      state.gameModal.isOpen = false; 
      state.scoutModal.isOpen = false;
      state.actionModal.isOpen = false;
    },
    closeActionModal(state) {
      state.actionModal.isOpen = false;
    }
  },
});

export const {
  openAddPlayerModal, openEditPlayerModal,
  openAddClubModal, openEditClubModal,
  openAddSeasonModal, openEditSeasonModal,
  openAddTeamModal, openEditTeamModal,
  openAddGameModal, openEditGameModal,
  openScoutModal, openActionModal,
  closeModal, closeActionModal,
} = slice.actions;

export default slice.reducer;
