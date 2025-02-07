declare module "ascii-table" {
  interface AsciiTableOptions {
    heading?: string[];
  }

  export default class AsciiTable {
    constructor(options?: AsciiTableOptions);
    setHeading(...headings: string[]): this;
    addRow(...cells: any[]): this;
    toString(): string;
  }
}
