import { SuperTest, Test } from 'supertest';

declare module 'nightwatch' {
  export interface NightwatchCustomCommands {
    supertest: {
      request: (app: any) => SuperTest<Test>;
    };
  }
}
