// eslint-disable-next-line
import { Knex } from "knex";

console.log(Knex);

declare module "knex/types/tables" {
  export interface Tables {
    transactions: {
      id: string;
      title: string;
      ammount: number;
      created_at: string;
      session_id?: string;
    };
  }
}
