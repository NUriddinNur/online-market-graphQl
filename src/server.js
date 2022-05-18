import {
    ApolloServerPluginLandingPageGraphQLPlayground,
    ApolloServerPluginDrainHttpServer
} from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import { schema } from './modules/index.js'
import express from "express"
import http from 'http'
import model from './utils/module.js'
import path from 'path'

import { graphqlUploadExpress } from 'graphql-upload'

import './utils/validation.js'
import './config.js'


async function startApolloServer() {
    const app = express()

    app.use(graphqlUploadExpress());
    app.use(express.static(path.join(process.cwd(), 'uploads')))

    const httpServer = http.createServer(app)

    const server = new ApolloServer({
        context: ({req, res}) => {
            model.agent = req.headers['user-agent']
            return model
        },
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            ApolloServerPluginLandingPageGraphQLPlayground
        ]
    })

    await server.start()
    server.applyMiddleware({
        app,
        path: '/graphql'
    })
    await new Promise(resolve => httpServer.listen({port: process.env.PORT || 4001}, resolve))
    console.log(`Server ready at http://localhost:4001${server.graphqlPath}`);
}


startApolloServer()