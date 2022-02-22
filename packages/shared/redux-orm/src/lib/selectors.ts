// eslint-disable-next-line no-restricted-imports
import { createSelector as createOrmSelector } from 'redux-orm';
// eslint-disable-next-line no-restricted-imports
import { OrmState } from 'redux-orm/ORM';
// eslint-disable-next-line no-restricted-imports
import { Selector } from 'redux-orm/redux';

import { Orm } from './orm';

type SelectorCreator = (
    orm: InstanceType<typeof Orm>
) => ReturnType<typeof createOrmSelector>;
const pendingSelectors: Record<symbol, SelectorCreator> = {};
const createdSelectors: Record<
    symbol,
    Selector<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        OrmState<any>,
        unknown
    >
> = {};

export const registerSelectors = (orm: InstanceType<typeof Orm>) => {
    // create our selectors!
    for (const selectorKey of Object.getOwnPropertySymbols(pendingSelectors)) {
        createdSelectors[selectorKey] = pendingSelectors[selectorKey](orm);
    }
};

export const createSelector = <S, R, O = never, M = never>(
    getOrmModel?: (orm: O) => M,
    ...args: unknown[]
): Selector<OrmState<S>, R> => {
    // create selector creator
    const selectorCreator = (orm: InstanceType<typeof Orm>) => {
        // if we were given an orm model fetcher, then fetch the model spec
        if (getOrmModel) {
            args.unshift(getOrmModel(orm as unknown as O));
        }
        // LOL!
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return createOrmSelector(...args);
    };
    // create selector key
    const selectorKey = Symbol();
    // create pending selector
    pendingSelectors[selectorKey] = selectorCreator;
    return (state: OrmState<S>): R => {
        // get selector
        const selector = createdSelectors[selectorKey];
        // if we don't have one yet
        if (!selector) {
            // who called us??
            throw new Error(
                `Attempted to call selector: ${getOrmModel} before ORM instance was instantiated.`
            );
        }
        // else, we have our selector
        return selector(state) as R;
    };
};
