import { ValidationError } from "apollo-server-express";
import sha256 from 'sha256'
import JWT from '../../utils/jwt.js'


export default {
    Query: {
        login: (_, args, {read, write, agent}) => {
            args.password = sha256(args.password)
            let users = read('users')
            const user = users.find(user => user.username == args.username && user.password == args.password)

            if (!user) {
                throw new ValidationError("Wrong username or password!")
            }
            delete user.password

            return {
                status: 200,
                message: "The user successfully logged in!",
                token: JWT.sign({ devise: agent, userId: user.userId, username: user.username, email: user.email, admin: user.admin }),
                data: user
            }
        }

    }
}