import {
    Action,
    createSlice,
    CreateSliceOptions,
    Selector,
    Slice,
    SliceCaseReducers,
    ValidateSliceCaseReducers,
} from '@reduxjs/toolkit';
// eslint-disable-next-line no-restricted-imports
import { Model as OrmModel, ModelType as OrmModelType } from 'redux-orm';
// eslint-disable-next-line no-restricted-imports
import {
    AnyModel,
    ModelFieldMap,
    RefPropOrSimple,
    Serializable,
} from 'redux-orm/Model';
// eslint-disable-next-line no-restricted-imports
import { OrmSession } from 'redux-orm/Session';

export abstract class Model<
    MClass extends typeof AnyModel = typeof AnyModel,
    Fields extends ModelFieldMap = Record<string, unknown>
> extends OrmModel<MClass, Fields> {
    /**
     * Lookup an instance by id. If not found, throw an error.
     * @param {*} id - The id to lookup
     * @return {EnhancedModel} - The found instance
     * @throws {Error} - If the object is not found
     */
    static requireId(id: string) {
        // lookup id
        const found = this.withId(id);
        if (found) {
            return found;
        }
        throw new Error(
            `Required instance of ${this} not found with id: ${id}.`
        );
    }

    static createSlice<
        State,
        CaseReducers extends SliceCaseReducers<State>,
        Name extends string = string
    >(sliceOpts: CreateSliceOptions<State, CaseReducers, Name>) {
        /*
         * redux-toolkit 1.5 requires reducers to NOT return undefined.
         * However, standard redux-orm reducers return undefined.
         * Wrap this model's case reducers to NOT return undefined.
         *
         */
        Object.keys(sliceOpts.reducers).forEach((name: keyof CaseReducers) => {
            const original = sliceOpts.reducers[name];
            sliceOpts.reducers[name] = function (modelClass, ...rest) {
                // call original
                let result;
                if (typeof original == 'function') {
                    result = original(modelClass, ...rest);
                }
                // don't return undefined
                if (typeof result == 'undefined') {
                    result = null;
                }
                return result;
            } as ValidateSliceCaseReducers<
                State,
                CaseReducers
            >[keyof CaseReducers];
        });
        return createSlice(sliceOpts);
    }

    static createReducer<
        State,
        CaseReducers extends SliceCaseReducers<State>,
        Name extends string = string
    >(slice: Slice<State, CaseReducers, Name>) {
        return (
            action: Action,
            modelClass: ModelType<typeof AnyModel>,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session: OrmSession<any>
        ) => slice.reducer(modelClass as unknown as State, action);
    }

    // used to prevent Typescript property initialization from
    // calling ReduxORM setters before construction
    #constructed = false;

    constructed() {
        this.#constructed = true;
    }

    override set<K extends string>(
        propertyName: K,
        value: RefPropOrSimple<AnyModel, K> | Serializable
    ): void {
        // if we haven't been constructed yet
        if (!this.#constructed) {
            // this property should be initialized soon enough
            return;
        }
        // else, go ahead and set the property
        // (will result in new instance being constructed)
        super.set(propertyName, value as RefPropOrSimple<this, K>);
    }
}

// `any` type seems to be neccessary to allow a model that accepts
// any arguments in constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelType<M extends new (props: any) => InstanceType<M>> =
    OrmModelType<InstanceType<M>> & M;

export type ModelSelectorSpec<M extends Model> = {
    key: string;
    dependencies: Selector[];
    resultFunc: Selector;
    model: M;
};
