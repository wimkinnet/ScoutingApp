import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import socket from '../socket';

export interface Player {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}

export interface Club {
	id: string;
	name: string;
    shortName: string;
	registrationNumber: string;
}

export interface Season {
	id: string;
	name: string;
}

export interface Team {
	id: string;
	name: string;
	clubId: string;
	seasonId: string;
	playerIds: string[];
}

export interface GamePlayer {
	playerId: string;
	shirtNumber: number;
	homeTeam: boolean;
}

export interface Game {
	id: string;
	homeTeamId: string;
	awayTeamId: string;
	date: string;
	homePlayers: GamePlayer[];
	awayPlayers: GamePlayer[];
}

export interface Log {
	id: string;
	gameId: string;
	actionId: string;
	playerId: string;
	positionX: number;
	positionY: number;
	quarter: number;
	secRem: number;
}

export interface Action {
	id: string;
	name: string;
	label: string;
}

export const scoutingApi = createApi({
    reducerPath: 'scoutingApi',
    baseQuery: fetchBaseQuery({
        //baseUrl: 'http://localhost:4000/api',
        baseUrl: 'https://scoutingapp-e1oh.onrender.com/api',
    }),
    tagTypes: ['Player', 'Club', 'Season', 'Team', 'Game', 'Log', 'Action'],
    endpoints: (builder) => ({
        
        //Player API's
        
        getPlayers: builder.query<Player[], void>({
            query: () => '/players',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((player) => ({type: 'Player' as const, id: player.id})),
                        { type: 'Player' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Player' as const, id: 'LIST' }],

            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const playerCreatedHandler = (newPlayer: Player) => {
                        updateCachedData((draft) => {
                            draft.push(newPlayer);
                        });
                    };

                    const playerUpdatedHandler = (updatedPlayer: Player) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((p) => p.id === updatedPlayer.id);
                            if (index !== -1) {
                                draft[index] = updatedPlayer;
                            }
                        });
                    };

                    const playerDeletedHandler = (deletedPlayerId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((p) => p.id === deletedPlayerId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('playerCreated', playerCreatedHandler);
                    socket.on('playerUpdated', playerUpdatedHandler);
                    socket.on('playerDeleted', playerDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('playerCreated', playerCreatedHandler);
                    socket.off('playerUpdated', playerUpdatedHandler);
                    socket.off('playerDeleted', playerDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getPlayerById: builder.query<Player, string>({
            query: (id) => `/players/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Player', id }],
        }),
 
        addPlayer: builder.mutation<Player, Omit<Player, 'id'>>({
        query: (body) => ({
            url: '/players',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Player', id: 'LIST' }],
        }),
    
        updatePlayer: builder.mutation<Player, { id: string; changes: Partial<Omit<Player, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/players/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Player', id: arg.id },
            { type: 'Player', id: 'LIST' },
        ],
        }),
    
        deletePlayer: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/players/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Player', id },
            { type: 'Player', id: 'LIST' },
        ],
        }),

        //Club API's

        getClubs: builder.query<Club[], void>({
            query: () => '/clubs',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((club) => ({type: 'Club' as const, id: club.id})),
                        { type: 'Club' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Club' as const, id: 'LIST' }],
            
            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const clubCreatedHandler = (newClub: Club) => {
                        updateCachedData((draft) => {
                            draft.push(newClub);
                        });
                    };

                    const clubUpdatedHandler = (updatedClub: Club) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((c) => c.id === updatedClub.id);
                            if (index !== -1) {
                                draft[index] = updatedClub;
                            }
                        });
                    };

                    const clubDeletedHandler = (deletedClubId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((c) => c.id === deletedClubId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('clubCreated', clubCreatedHandler);
                    socket.on('clubUpdated', clubUpdatedHandler);
                    socket.on('clubDeleted', clubDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('clubCreated', clubCreatedHandler);
                    socket.off('clubUpdated', clubUpdatedHandler);
                    socket.off('clubDeleted', clubDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getClubById: builder.query<Club, string>({
            query: (id) => `/clubs/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Club', id }],
        }),

        addClub: builder.mutation<Club, Omit<Club, 'id'>>({
        query: (body) => ({
            url: '/clubs',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Club', id: 'LIST' }],
        }),
    
        updateClub: builder.mutation<Club, { id: string; changes: Partial<Omit<Club, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/clubs/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Club', id: arg.id },
            { type: 'Club', id: 'LIST' },
        ],
        }),
    
        deleteClub: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/clubs/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Club', id },
            { type: 'Club', id: 'LIST' },
        ],
        }),

        //Season API's

        getSeasons: builder.query<Season[], void>({
            query: () => '/seasons',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((season) => ({type: 'Season' as const, id: season.id})),
                        { type: 'Season' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Season' as const, id: 'LIST' }],

            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const seasonCreatedHandler = (newSeason: Season) => {
                        updateCachedData((draft) => {
                            draft.push(newSeason);
                        });
                    };

                    const seasonUpdatedHandler = (updatedSeason: Season) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((s) => s.id === updatedSeason.id);
                            if (index !== -1) {
                                draft[index] = updatedSeason;
                            }
                        });
                    };

                    const seasonDeletedHandler = (deletedSeasonId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((s) => s.id === deletedSeasonId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('seasonCreated', seasonCreatedHandler);
                    socket.on('seasonUpdated', seasonUpdatedHandler);
                    socket.on('seasonDeleted', seasonDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('seasonCreated', seasonCreatedHandler);
                    socket.off('seasonUpdated', seasonUpdatedHandler);
                    socket.off('seasonDeleted', seasonDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getSeasonById: builder.query<Season, string>({
            query: (id) => `/seasons/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Season', id }],
        }),

        addSeason: builder.mutation<Season, Omit<Season, 'id'>>({
        query: (body) => ({
            url: '/seasons',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Season', id: 'LIST' }],
        }),
    
        updateSeason: builder.mutation<Season, { id: string; changes: Partial<Omit<Season, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/seasons/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Season', id: arg.id },
            { type: 'Season', id: 'LIST' },
        ],
        }),
    
        deleteSeason: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/seasons/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Season', id },
            { type: 'Season', id: 'LIST' },
        ],
        }),

        //Team API's

        getTeams: builder.query<Team[], void>({
            query: () => '/teams',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((team) => ({type: 'Team' as const, id: team.id})),
                        { type: 'Team' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Team' as const, id: 'LIST' }],

            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const teamCreatedHandler = (newTeam: Team) => {
                        updateCachedData((draft) => {
                            draft.push(newTeam);
                        });
                    };

                    const teamUpdatedHandler = (updatedTeam: Team) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((t) => t.id === updatedTeam.id);
                            if (index !== -1) {
                                draft[index] = updatedTeam;
                            }
                        });
                    };

                    const teamDeletedHandler = (deletedTeamId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((t) => t.id === deletedTeamId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('teamCreated', teamCreatedHandler);
                    socket.on('teamUpdated', teamUpdatedHandler);
                    socket.on('teamDeleted', teamDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('teamCreated', teamCreatedHandler);
                    socket.off('teamUpdated', teamUpdatedHandler);
                    socket.off('teamDeleted', teamDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getTeamById: builder.query<Team, string>({
            query: (id) => `/teams/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Team', id }],
        }),

        addTeam: builder.mutation<Team, Omit<Team, 'id'>>({
        query: (body) => ({
            url: '/teams',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Team', id: 'LIST' }],
        }),
    
        updateTeam: builder.mutation<Team, { id: string; changes: Partial<Omit<Team, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/teams/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Team', id: arg.id },
            { type: 'Team', id: 'LIST' },
        ],
        }),
    
        deleteTeam: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/teams/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Team', id },
            { type: 'Team', id: 'LIST' },
        ],
        }),

        //Game API's

        getGames: builder.query<Game[], void>({
            query: () => '/games',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((game) => ({type: 'Game' as const, id: game.id})),
                        { type: 'Game' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Game' as const, id: 'LIST' }],

            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const gameCreatedHandler = (newGame: Game) => {
                        updateCachedData((draft) => {
                            draft.push(newGame);
                        });
                    };

                    const gameUpdatedHandler = (updatedGame: Game) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((g) => g.id === updatedGame.id);
                            if (index !== -1) {
                                draft[index] = updatedGame;
                            }
                        });
                    };

                    const gameDeletedHandler = (deletedGameId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((g) => g.id === deletedGameId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('gameCreated', gameCreatedHandler);
                    socket.on('gameUpdated', gameUpdatedHandler);
                    socket.on('gameDeleted', gameDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('gameCreated', gameCreatedHandler);
                    socket.off('gameUpdated', gameUpdatedHandler);
                    socket.off('gameDeleted', gameDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getGameById: builder.query<Game, string>({
            query: (id) => `/games/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Game', id }],
        }),

        addGame: builder.mutation<Game, Omit<Game, 'id'>>({
        query: (body) => ({
            url: '/games',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Game', id: 'LIST' }],
        }),
    
        updateGame: builder.mutation<Game, { id: string; changes: Partial<Omit<Game, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/games/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Game', id: arg.id },
            { type: 'Game', id: 'LIST' },
        ],
        }),
    
        deleteGame: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/games/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Game', id },
            { type: 'Game', id: 'LIST' },
        ],
        }),

        //Log API's

        getLogs: builder.query<Log[], void>({
            query: () => '/logs',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((log) => ({type: 'Log' as const, id: log.id})),
                        { type: 'Log' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Log' as const, id: 'LIST' }],

            async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;

                    if (!socket.connected) {
                        socket.connect();
                    }

                    const logCreatedHandler = (newLog: Log) => {
                        updateCachedData((draft) => {
                            draft.push(newLog);
                        });
                    };

                    const logUpdatedHandler = (updatedLog: Log) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((l) => l.id === updatedLog.id);
                            if (index !== -1) {
                                draft[index] = updatedLog;
                            }
                        });
                    };

                    const logDeletedHandler = (deletedLogId: string) => {
                        updateCachedData((draft) => {
                            const index = draft.findIndex((l) => l.id === deletedLogId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('logCreated', logCreatedHandler);
                    socket.on('logUpdated', logUpdatedHandler);
                    socket.on('logDeleted', logDeletedHandler);

                    await cacheEntryRemoved;
                    
                    socket.off('logCreated', logCreatedHandler);
                    socket.off('logUpdated', logUpdatedHandler);
                    socket.off('logDeleted', logDeletedHandler);
                    
                    socket.disconnect();
                } catch {
                    // no need to do anything, subscription is automatically removed
                }
            }
        }),

        getLogById: builder.query<Log, string>({
            query: (id) => `/logs/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Log', id }],
        }),

        addLog: builder.mutation<Log, Omit<Log, 'id'>>({
        query: (body) => ({
            url: '/logs',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Log', id: 'LIST' }],
        }),
    
        updateLog: builder.mutation<Log, { id: string; changes: Partial<Omit<Log, 'id'>> }>({
        query: ({ id, changes }) => ({
            url: `/logs/${id}`,
            method: 'PATCH',
            body: changes,
        }),
        invalidatesTags: (_result, _error, arg) => [
            { type: 'Log', id: arg.id },
            { type: 'Log', id: 'LIST' },
        ],
        }),
    
        deleteLog: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
            url: `/logs/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
            { type: 'Log', id },
            { type: 'Log', id: 'LIST' },
        ],
        }),

        //Action API's

        getActions: builder.query<Action[], void>({
            query: () => '/actions',
            providesTags: (result) => 
                result
                    ? [
                        ...result.map((action) => ({type: 'Action' as const, id: action.id})),
                        { type: 'Action' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Action' as const, id: 'LIST' }],
        }),

        getActionById: builder.query<Action, string>({
            query: (id) => `/actions/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Action', id }],
        }),
    }),
});
 
export const {
    useGetPlayersQuery,
    useGetPlayerByIdQuery,
    useAddPlayerMutation,
    useUpdatePlayerMutation,
    useDeletePlayerMutation,
    useGetClubByIdQuery,
    useGetClubsQuery,
    useAddClubMutation,
    useUpdateClubMutation,
    useDeleteClubMutation,
    useGetSeasonByIdQuery,
    useGetSeasonsQuery,
    useAddSeasonMutation,
    useUpdateSeasonMutation,
    useDeleteSeasonMutation,
    useGetTeamByIdQuery,
    useGetTeamsQuery,
    useAddTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
    useGetGameByIdQuery,
    useGetGamesQuery,
    useAddGameMutation,
    useUpdateGameMutation,
    useDeleteGameMutation,
    useGetLogByIdQuery,
    useGetLogsQuery,
    useAddLogMutation,
    useUpdateLogMutation,
    useDeleteLogMutation,
    useGetActionByIdQuery,
    useGetActionsQuery,
} = scoutingApi;