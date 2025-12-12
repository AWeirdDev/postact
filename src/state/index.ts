import { MaybeState, type State } from "./base";

export {
  BaseStateManager,
  MaybeState,
  type Updater,
  type UpdateDispatch,
  type State,
} from "./base";
import { NumberState } from "./number";
import { BooleanState } from "./boolean";
export { BigIntState } from "./bigint";
export { StringState } from "./string";

export const state = {
  number(initial: number = 0): NumberState {
    return new NumberState(initial);
  },
  maybeNumber(initial: number | null = null): MaybeState<number> {
    return new MaybeState(new NumberState(initial ?? 0), initial === null);
  },

  boolean(initial: boolean = false): BooleanState {
    return new BooleanState(initial);
  },
  maybeBoolean(initial: boolean | null = null): MaybeState<boolean> {
    return new MaybeState(new BooleanState(initial ?? false));
  },
};
