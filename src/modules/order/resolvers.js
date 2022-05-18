import checkToken from '../../utils/checkToken.js'
import Datee from "../../utils/getTime.js"

export default {
    Query: {
        getOrders: ( _, {token, orderId}, {read, agent}) => {
            let {userId} = checkToken(token, agent)
            let orders = read("orders")

            orders = orders.filter(order => order.userId === +userId)
            return orders.filter(order => orderId ? order.orderId == orderId : true)
        }
    },


    Mutation: {
        addProduct: (_, args, {read, write, agent}) => {
            let {userId, admin} = checkToken(args.token, agent)
            let orders = read('orders')
            let products = read('products')
            const product = products.find(product => product.productId == args.productId)
            const order = orders.find(order => order.userId == userId && !order.isPaid)

            if(!product) {
                throw new Error('Product not found')
            }

            let chek = true
            if(order && !admin) {
                for (let p of order.products){
                    if(p.productId == product.productId) {
                        chek = false
                        p.count++
                    }
                }
                if(chek) {
                    order.products.push({
                        productId: product.productId,
                        count: 1
                    })
                }
                order.totalPrice = order.totalPrice + product.price
                order.date = Datee(Date.now())
                write("orders", orders)
                return {
                    status: 200,
                    message: "Product added!",
                    data: order
                }
            }

            const newOrder = {
                orderId: orders.length ? orders[orders.length - 1].orderId + 1 : 1,
                userId: userId,
                totalPrice: product.price,
                isPaid: false,
                date: Datee(Date.now()),
                products: [{productId : product.productId, count: 1}]
            }
            orders.push(newOrder)
            write("orders", orders)

            return {
                status: 200,
                message: "Product added!",
                data: newOrder
            }
        },

        // edit order delete product in order
        editOrder: (_, {token, productId}, {read, write, agent}) => {
            let {userId, admin} = checkToken(token, agent)
            let orders = read('orders')
            let order = orders.find(order => order.userId == userId && !order.isPaid)

            if(!order) {
                throw new Error("You do not have an unregistered order")
            }
            if(admin) {
                throw new Error("The administrator cannot change customer-specific orders")
            }
            
            for (let product of order.products) {
                if(product.productId === +productId && product.count > 0) {
                    product.count--
                    order.products = order.products.filter(p => p.count != 0)
                    write("orders", orders)
                        return {
                            status: 200,
                            message: "Order changed!",
                            data: order
                        }
                }

            }
            write("orders", orders)
            return {
                status: 200,
                message: "Product not found!",
                data: order
            }
        },

        // register order
        registerOrder: (_, {token}, {read, write, agent}) => {
            let {userId, admin} = checkToken(token, agent)
            let orders = read('orders')
            let order = orders.find(order => order.userId == userId && !order.isPaid)

            if(!order) {
                throw new Error("You do not have an unregistered order")
            }
            if(admin) {
                throw new Error("The administrator cannot change customer-specific orders")
            }

            order.isPaid = true
            write("orders", orders)
            return {
                status: 200,
                message: "The order was successfully registered!",
                data: order
            }

        }, 

        // delete order
        deleteOrder: (_, {token}, {read, write, agent}) => {
            let {userId, admin} = checkToken(token, agent)
            let orders = read('orders')
            let indexOrder = orders.findIndex(order => order.userId == userId && !order.isPaid)

            console.log(userId);

            if(indexOrder == -1) {
                throw new Error("You do not have an unregistered order")
            }
            if(admin) {
                throw new Error("The administrator cannot change customer-specific orders")
            }
            let deletedOrder = orders.splice(+indexOrder, 1)
            write('orders', orders)

            console.log(deletedOrder);

            return {
                status: 200,
                message: "Order Deleted!",
                data: deletedOrder[0]
            }
        }
    },


    ProductUser: {
        product: (parent, _, {read}) => {
            let data = read("products")
            data = data.find(e => e.productId == +parent.productId)
            return data
        },
        count: (parent) => parent.count
    }
}