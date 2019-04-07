import { combineResolvers } from "graphql-resolvers";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { isAdmin } from "./authorization";
import redis from "../redis";
import sendEmail from "../utils/sendEmail";
import {
  confirmUserPrefix,
  forgotPasswordPrefix
} from "../constants/redisPrefixes";
import createConfirmationUrl from "../utils/createConfirmationUrl";
import createChangePasswordUrl from "../utils/createChangePasswordUrl";
import { signUpSchema, passwordValidation } from "../yupSchemas/user";

export default {
  Query: {
    users: async (parent, args, { models }) => {
      return await models.User.find();
    },

    user: async (parent, { id }, { models }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await models.User.findById(id);
    },

    me: async (parent, args, { req, models }) => {
      const { userId } = req.session;
      if (!userId) return null;

      return await models.User.findById(userId);
    }
  },

  Mutation: {
    signUp: async (parent, { input }, { models }) => {
      try {
        await signUpSchema.validate(input, { abortEarly: false });
      } catch (err) {
        return new Error(err.errors);
      }

      const { firstName, lastName, username, email, password } = input;

      const user = new models.User({
        firstName,
        lastName,
        username,
        email,
        password: await bcrypt.hash(password, 12)
      });
      await user.save();

      const url = await createConfirmationUrl(user.id);

      sendEmail(user.email, url);

      return user;
    },

    signIn: async (parent, { login, password }, { req, models }) => {
      let user = await models.User.findByLogin(login);
      if (!user) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      if (!user.confirmed) return null;

      req.session.userId = user.id;

      return user;
    },

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
        return await models.User.findByIdAndDelete(id);
      }
    ),

    confirmUser: async (parent, { token }, { models }) => {
      const userId = await redis.get(`${confirmUserPrefix}${token}`);
      if (!userId) return false;

      await models.User.findByIdAndUpdate(userId, { confirmed: true });

      await redis.del(`${confirmUserPrefix}${token}`);

      return true;
    },

    forgotPassword: async (parent, { email }, { models }) => {
      const user = await models.User.findOne({ email });
      if (!user) return true;

      const url = await createChangePasswordUrl(user.id);
      sendEmail(email, url);

      return true;
    },

    changePassword: async (
      parent,
      { input: { token, password } },
      { req, models }
    ) => {
      const userId = await redis.get(`${forgotPasswordPrefix}${token}`);
      if (!userId) return null;

      try {
        await passwordValidation.validate(password);
      } catch (err) {
        return new Error(err.errors);
      }

      const user = await models.User.findByIdAndUpdate(userId, {
        password: await bcrypt.hash(password, 12)
      });
      await redis.del(`${forgotPasswordPrefix}${token}`);

      req.session.userId = userId;

      return user;
    },

    logout: (parent, args, { req, res }) => {
      return new Promise((resolve, reject) =>
        req.session.destroy(err => {
          if (err) return reject(false);
          res.clearCookie("qid");
          return resolve(true);
        })
      );
    }
  },

  User: {
    fullName: user => {
      return `${user.firstName} ${user.lastName}`;
    }
  }
};
