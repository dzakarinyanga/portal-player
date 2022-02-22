import { AppDispatch, AppStore, createStore } from '../../store';
import { selectMarkers, selectPlayer, setMarkers } from './player';

describe('models/Player', () => {
    describe('Actions', () => {
        let store: AppStore;
        let dispatch: AppDispatch;

        beforeEach(() => {
            store = createStore();
            dispatch = store.dispatch;
        });

        it('createPlayer()', () => {});

        it('setMarkers()', () => {
            // create test data
            // const state = orm.getEmptyState();
            // const { Player } = orm.mutableSession(state);
            // Player.create({ id: '324dec2' });
            // const player = Player.first();
            const player = selectPlayer(store.getState());
            const testMarkers = [['/path', '01:00']];

            // set markers
            dispatch(setMarkers({ id: player?.id, markers: testMarkers }));

            // should have been set
            expect(selectMarkers(store.getState())).toMatchObject(testMarkers);
        });
    });
});
