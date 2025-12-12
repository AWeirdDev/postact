import { BaseStateManager } from "./base";

export class StringState extends BaseStateManager<string> {
  constructor(initial: string) {
    super(initial);
  }

  override shouldUpdate(other: string): boolean {
    return super.value !== other;
  }

  push(slice: string) {
    this.update(super.value + slice);
  }
}
