import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  playerId: string | null;
}

interface UIState {
  modal: ModalState;
}

const initialState: UIState = {
  modal: { isOpen: false, mode: 'add', playerId: null },
};

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddPlayerModal(state) { state.modal = { isOpen: true, mode: 'add', playerId: null }; },
    openEditPlayerModal(state, action: PayloadAction<string>) { state.modal = { isOpen: true, mode: 'edit', playerId: action.payload }; },
    closeModal(state) { state.modal.isOpen = false; state.modal.playerId = null; },
  },
});

export const {
  openAddPlayerModal, openEditPlayerModal, closeModal
} = slice.actions;

export default slice.reducer;
