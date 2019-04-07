import * as Yup from "yup";

export const notLongEnough = (name, length) =>
  `${name} must be at least ${length} characters`;
export const tooLong = (name, length) =>
  `${name} must be at most ${length} characters`;
export const invalidEmail = "email must be a valid email";

export const passwordValidation = Yup.string()
  .min(3, notLongEnough("password", 3))
  .max(50, tooLong("password", 50))
  .required();

export const signUpSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, notLongEnough("first name", 2))
    .max(50, tooLong("first name", 50))
    .required(),
  lastName: Yup.string()
    .min(2, notLongEnough("last name", 2))
    .max(50, tooLong("last name", 50))
    .required(),
  username: Yup.string()
    .min(2, notLongEnough("username", 2))
    .max(50, tooLong("username", 50))
    .required(),
  email: Yup.string()
    .min(3, notLongEnough("email", 3))
    .max(50, tooLong("email", 50))
    .email(invalidEmail)
    .required(),
  password: passwordValidation
});
