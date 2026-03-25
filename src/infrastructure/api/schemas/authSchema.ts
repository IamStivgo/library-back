import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
});

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    username: Joi.string().min(3).max(50).optional().messages({
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 50 characters',
    }),
    fullName: Joi.string().max(255).optional().messages({
        'string.max': 'Full name must not exceed 255 characters',
    }),
});

export const googleAuthSchema = Joi.object({
    googleToken: Joi.string().required().messages({
        'any.required': 'Google token is required',
    }),
});

export const microsoftAuthSchema = Joi.object({
    accessToken: Joi.string().required().messages({
        'any.required': 'Microsoft access token is required',
    }),
});

export const githubAuthSchema = Joi.object({
    accessToken: Joi.string().required().messages({
        'any.required': 'GitHub access token is required',
    }),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required',
    }),
});
