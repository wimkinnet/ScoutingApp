import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  id: string | null;
}

interface UIState {
  playerModal: ModalState;
  clubModal: ModalState;
  seasonModal: ModalState;
}

const initialState: UIState = {
  playerModal: { isOpen: false, mode: 'add', id: null},
  clubModal: { isOpen: false, mode: 'add', id: null},
  seasonModal: { isOpen: false, mode: 'add', id: null},
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
    closeModal(state) { state.playerModal.isOpen = false; state.clubModal.isOpen = false; state.seasonModal.isOpen = false;},
  },
});

export const {
  openAddPlayerModal, openEditPlayerModal, openAddClubModal, 
  openEditClubModal, openAddSeasonModal, openEditSeasonModal,
  closeModal
} = slice.actions;

export default slice.reducer;
