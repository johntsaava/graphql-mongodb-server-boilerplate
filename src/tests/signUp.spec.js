import { expect } from "chai";
import faker from "faker";

import * as api from "./api";

describe("signUp(input: SignUpInput!): User", () => {
  it("Creates and returns a user", async () => {
    const user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(6)
    };

    const { firstName, lastName, username, email } = user;

    const expectedResult = {
      data: {
        signUp: {
          fullName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          username,
          email
        }
      }
    };

    const result = await api.signUp({ input: user });

    expect(result.data).to.eql(expectedResult);
  });
});
