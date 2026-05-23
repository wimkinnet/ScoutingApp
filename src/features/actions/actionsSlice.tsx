import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Action } from '../../app/types'

interface ActionsState {
	entities: Record<string, Action>;
	ids: string[];
}

const initialState: ActionsState = {
	entities: {},
	ids: [],
};

const slice = createSlice({
	name: 'actions',
	initialState,
	reducers: {
		addAction: {
			reducer(state, action: PayloadAction<Action>) {	
				const a = action.payload;
				state.entities[a.id] = a;
				state.ids.push(a.id);
			},
			prepare(action: Omit<Action, 'id'>) {
          		return { payload: { id: nanoid(), ...action } };
      		},
		},
		updateAction(state, action: PayloadAction<{ id: string; changes: Partial<Action> }>) {
			const { id, changes } = action.payload;
			Object.assign(state.entities[id], changes);
		},
		removeAction(state, action: PayloadAction<string>) {
			const id = action.payload;
			delete state.entities[id];
			state.ids = state.ids.filter(x => x !== id);
		},
	},
});

export const { addAction, updateAction, removeAction } = slice.actions;
export default slice.reducer;
