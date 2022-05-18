import Joi from 'joi'

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/),
    contact: Joi.string().pattern(/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['mail', 'com'] } })
})



process.JOI = {
    registerSchema
}