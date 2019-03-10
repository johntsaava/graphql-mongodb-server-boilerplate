import bcrypt from "bcrypt";
import faker from "faker";

import models from "../models";

export default async () => {
  const user1 = new models.User({
    firstName: "Robin",
    lastName: "Wieruch",
    username: "rwieruch",
    email: "hello@robin.com",
    password: await bcrypt.hash("rwieruch", 12),
    confirmed: true,
    role: "ADMIN"
  });
  await user1.save();

  const user2 = new models.User({
    firstName: "David",
    lastName: "Davids",
    username: "ddavids",
    email: "hello@david.com",
    password: await bcrypt.hash("ddavids", 12),
    confirmed: true
  });
  await user2.save();

  for (let i = 0; i < 10; i++) {
    const user = new models.User({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: await bcrypt.hash(faker.internet.password(6), 12),
      confirmed: true
    });
    await user.save();
  }
};
