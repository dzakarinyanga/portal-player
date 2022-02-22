import { configureStore } from '@reduxjs/toolkit';
import { createReducer, Orm } from '@portal/shared/redux-orm';
import { v4 as uuidV4 } from 'uuid';

import { Player } from './models/player/player';

const schema = { Player };

export type Schema = typeof schema;

export const orm = new Orm<Schema>({
    stateSelector: state => state,
});

orm.register(...Object.values(schema));

const ormReducer = createReducer(orm);

export type OrmReducer = typeof ormReducer;

export const createStore = () => {
    // init state
    const state = orm.getEmptyState();
    const { Player } = orm.mutableSession(state);
    Player.create({ id: uuidV4() });

    // create store with initial state
    return configureStore({
        reducer: ormReducer,
        // Additional middleware can be passed to this array
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
        devTools: process.env.NODE_ENV !== 'production',
        preloadedState: state,
    });
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
