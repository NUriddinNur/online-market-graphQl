import { ValidationError } from "apollo-server-express";
import sha256 from 'sha256'
import JWT from '../../utils/jwt.js'


export default {
    Mutation: {
        register: (_, args, {read, write, agent}) => {
            let data = process.JOI.registerSchema.validate(args)
            if(data.error) {
                throw new ValidationError(data.error.message)
            }else {
                let users = read('users') 
                if (users.find(user => user.username == args.username)) {
                    throw new ValidationError('The user already exists')
                }

                args.userId = users.length ? users[users.length - 1].userId + 1 : 1
                args.password = sha256(args.password)
                args.admin = false
                users.push(args)
                write('users', users)
                args.token = JWT.sign({ devise: agent, userId: args.userId, username: args.username, email: args.email, admin: args.admin })

                return {
                    status: 200,
                    message: "The user successfully registered!",
                    data: args
                }
            }

        }
    }
}