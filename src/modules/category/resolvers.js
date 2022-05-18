import checkToken from '../../utils/checkToken.js'

export default {
    Query: {
        getCategorys: (_, { categoryId }, { read }) => {
            return read('categorys').filter(category => categoryId ? category.categoryId == categoryId : true)
        },
    },

    Mutation: {
        // add category
        addCategory: (_, {token, categoryname}, {read, write, agent}) => {
            let {admin} = checkToken(token, agent)
            let categorys = read('categorys')
            categoryname = categoryname.trim()
            let category = categorys.find(c => c.categoryname == categoryname)


            if(!categoryname || categoryname.length > 30) {
                return {
                    status: 400,
                    message: "Invalid category name!",
                    data: null
                }
            }
            if(!admin) {
                return {
                    status: 400,
                    message: "Only the admin can add categories",
                    data: null
                }
            }
            if(category) {
                return {
                    status: 400,
                    message: "The category already exists",
                    data: null
                }
            }

            const newCategory = {
                categoryId: categorys.length ? categorys[categorys.length - 1].categoryId + 1 : 1,
                categoryname: categoryname
            }

            categorys.push(newCategory)
            write("categorys", categorys)

            return {
                status: 200,
                message: "The category successfully added!",
                data: newCategory
            }
        },

        // edit category
        editCategory: (_, {token, categoryId, categoryname}, {read, write, agent}) => {
            let {admin} = checkToken(token, agent)
            let categorys = read('categorys')
            categoryname = categoryname.trim()

            let category = categorys.find(c => c.categoryname == categoryname)

            if(!admin) {
                return {
                    status: 400,
                    message: "Only the admin can edit categories",
                    data: null
                }
            }
            if(!categoryname || categoryname.length > 30) {
                return {
                    status: 400,
                    message: "Invalid category name!",
                    data: null
                }
            }
            if(category) {
                return {
                    status: 400,
                    message: "The category already exists",
                    data: null
                }
            }
            category = categorys.find(c => c.categoryId == categoryId)
            category.categoryname = categoryname
            write("categorys", categorys)
            return {
                status: 200,
                message: "category name changed!",
                data: category
            }
        },

        // delete Category
        deleteCategory: (_, {token, categoryId}, {read, write, agent}) => {
            let {admin} = checkToken(token, agent)
            let categorys = read('categorys')
            let categoryIndex = categorys.findIndex(c => c.categoryId == categoryId)

            if(!admin) {
                return {
                    status: 400,
                    message: "Only the admin can delete categories",
                    data: null
                }
            }
            if(categoryIndex == -1) {
                return {
                    status: 400,
                    message: "Category not found",
                    data: null
                }
            }
            let deletedcategory = categorys.splice(+categoryIndex, 1)
            write('categorys', categorys)

            return {
                status: 200,
                message: "Category Deleted!",
                data: deletedcategory[0]
            }
        }
    }
}