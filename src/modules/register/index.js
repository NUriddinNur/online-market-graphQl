import resolvers from "./resolvers.js"
import { gql } from "apollo-server-express"
import path from 'path'
import fs from 'fs'
import { fileURLToPath  } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.gql'), 'UTF-8')

export default {
    resolvers,
    typeDefs: gql`${typeDefs}`
}