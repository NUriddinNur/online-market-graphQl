
export default {
    Query: {
        user: (_, __, { read, write }) => {
            console.log(read('users'));
            return "Alo"
        }
    }
}