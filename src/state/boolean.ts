import { BaseStateManager } from "./base";

export class BooleanState extends BaseStateManager<boolean> {
  constructor(initial: boolean) {
    super(initial);
  }

  override shouldUpdate(other: boolean): boolean {
    return super.value !== other;
  }

  flip(): void {
    super.update(!super.value);
  }
}
