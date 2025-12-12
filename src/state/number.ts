import { BaseStateManager } from "./base";

export class NumberState extends BaseStateManager<number> {
  constructor(initial: number) {
    super(initial);
  }

  override shouldUpdate(other: number): boolean {
    return super.value !== other;
  }

  add(n: number): void {
    super.update(super.value + n);
  }

  sub(n: number): void {
    super.update(super.value - n);
  }

  mul(n: number): void {
    super.update(super.value * n);
  }

  div(n: number): void {
    super.update(super.value / n);
  }
}
