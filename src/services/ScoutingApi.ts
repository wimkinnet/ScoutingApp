import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Player {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}

export interface Club {
	id: string;
	name: string;
	registrationNumber: string;
}

export interface Season {
	id: string;
	name: string;
}

export const scoutingApi = createApi({
    reducerPath: 'scoutingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/api',
    }),
    tagTypes: ['Player', 'Club', 'Season'],
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
} = scoutingApi;