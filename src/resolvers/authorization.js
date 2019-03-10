import { ForbiddenError } from "apollo-server-express";
import { skip, combineResolvers } from "graphql-resolvers";

export const isAuthenticated = (parent, args, { req }) =>
  req.session.userId ? skip : new ForbiddenError("Not authenticated as user.");

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { req, models }) => {
    const user = models.User.findById(req.session.userId);
    return user.role === "ADMIN"
      ? skip
      : new ForbiddenError("Not authorized as admin.");
  }
);
