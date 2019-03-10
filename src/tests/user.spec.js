import { expect } from "chai";

import * as api from "./api";

describe("user(id: ID!): User", () => {
  it("returns null when user cannot be found", async () => {
    const expectedResult = {
      data: {
        user: null
      }
    };

    const result = await api.user({ id: "42" });

    expect(result.data).to.eql(expectedResult);
  });
});
