import crypto from 'crypto';

export interface IDGen {
  generateID(): string;
}

export class DefaultIDGenerator {
  private prefix = crypto.randomUUID();
  private keyseq = 0;
  generateID() {
    return `${this.prefix}-${(this.keyseq += 1)}`;
  }
}
