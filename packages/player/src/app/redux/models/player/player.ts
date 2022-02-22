import {
    attr,
    createSelector,
    Model,
    ModelSelectorSpec,
    ModelType,
    Orm,
    OrmSession,
} from '@portal/shared/redux-orm';
import { PayloadAction, Slice } from '@reduxjs/toolkit';

interface PlayerFields {
    id: string;
    markers: string[][];
}

export class Player
    extends Model<typeof Player, PlayerFields>
    implements PlayerFields
{
    id = '0';
    markers = [];

    // private constructed
    // set id(id: string) {
    //     super.set('id', id as RefPropOrSimple<this, 'id'>);
    // }

    // set markers(markers: string[][]) {
    //     super.set('markers', markers as RefPropOrSimple<this, 'markers'>);
    // }

    static override modelName = 'Player';

    static override fields = {
        // relational accessors
        // non-relational fields
        id: attr(), //string, required
        // list of markers to pass to liqvid
        markers: attr(), //array
    };

    static override options = {
        idAttribute: 'id',
    };

    // REDUCER
    static slice: Slice<ModelType<typeof Player>> = this.createSlice({
        name: 'PlayerSlice',
        // ORM will provide an initial state for us
        initialState: undefined as unknown as ModelType<typeof Player>,
        reducers: {
            createPlayer(
                Player,
                action: PayloadAction<PlayerFields & Record<string, unknown>>
            ) {
                Player.create(action.payload);
            },

            setMarkers(
                Player,
                {
                    payload: { id, markers },
                }: PayloadAction<{ id: string; markers: string[][] }>
            ) {
                Player.requireId(id).set('markers', markers);
            },
        },
    });
    static override reducer = this.createReducer(this.slice);

    constructor(props: PlayerFields) {
        super(props);

        // inform our base class that we've finished being constructed
        this.constructed();
    }

    override toString() {
        return `Player: ${this.id}`;
    }

    testThis() {
        return 'ha';
    }
}

//export actions
export const { createPlayer, setMarkers } = Player.slice.actions;

type Schema = { Player: typeof Player };
const ormType = () => new Orm<Schema>();
type OrmInstance = ReturnType<typeof ormType>;

export const selectPlayer = createSelector<
    Schema,
    Player,
    OrmInstance,
    ModelSelectorSpec<Player>
>(
    orm => orm.Player,
    (players: Player[]) => players[0]
);

export const selectMarkers = createSelector(
    orm => orm,
    selectPlayer,
    (session: OrmSession<Schema>, player: Player) => player.markers
);
