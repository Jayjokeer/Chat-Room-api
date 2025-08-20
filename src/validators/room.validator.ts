import Joi from "joi";

export const createRoomSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Room name is required",
      "string.min": "Room name must be at least 3 characters",
      "string.max": "Room name must be less than 50 characters",
    }),
  isPrivate: Joi.boolean()
    .required()
    .messages({
      "any.required": "isPrivate field is required",
    }),
});

export const joinRoomSchema = Joi.object({
  roomId: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.number().integer())
    .required()
    .messages({
      "any.required": "Room ID is required",
    }),
  inviteCode: Joi.string()
    .alphanum()
    .min(6)
    .max(12)
    .optional()
    .messages({
      "string.alphanum": "Invite code must contain only letters and numbers",
    }),
});

export const getUserRoomsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Page must be a number",
      "number.min": "Page must be at least 1",
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      "number.base": "Limit must be a number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
});