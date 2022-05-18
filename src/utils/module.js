import path from 'path'
import fs from 'fs'

export default {
    read: (fileName) => {
        let data = fs.readFileSync(path.join(process.cwd(), 'src', 'database', fileName + '.json'), 'UTF-8') 
        return data ? JSON.parse(data) : []
    },

    write: (fileName, data) => {
        fs.writeFileSync(path.join(process.cwd(), 'src', 'database', fileName + '.json',), JSON.stringify(data, null, 4))
    }
}