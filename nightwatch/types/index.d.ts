import { SuperTest, Test } from 'supertest';
export * from 'nightwatch';

declare module 'nightwatch' {
  export interface NightwatchCustomCommands {
    supertest: {
      request: (app: any) => SuperTest<Test>;
    };
  }
}
