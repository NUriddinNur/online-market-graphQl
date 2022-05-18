import { makeExecutableSchema } from '@graphql-tools/schema'

import userModule from './user/index.js'
import registerModule from './register/index.js'
import categoryModule from './category/index.js'
import productModule from './products/index.js'
import loginModule from './login/index.js'
import orderModule from './order/index.js'

export const schema = makeExecutableSchema({
    typeDefs: [
        userModule.typeDefs,
        registerModule.typeDefs,
        categoryModule.typeDefs,
        productModule.typeDefs,
        loginModule.typeDefs,
        orderModule.typeDefs
    ],
    
    resolvers: [
        userModule.resolvers,
        registerModule.resolvers,
        categoryModule.resolvers,
        productModule.resolvers,
        loginModule.resolvers,
        orderModule.resolvers
    ]
})