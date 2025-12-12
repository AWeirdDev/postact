import { BaseStateManager } from "./base";

export class BigIntState extends BaseStateManager<bigint> {
  constructor(initial: bigint) {
    super(initial);
  }

  override shouldUpdate(other: bigint): boolean {
    return super.value !== other;
  }

  add(n: bigint): void {
    super.update(super.value + n);
  }

  sub(n: bigint): void {
    super.update(super.value - n);
  }

  mul(n: bigint): void {
    super.update(super.value * n);
  }

  div(n: bigint): void {
    super.update(super.value / n);
  }
}
