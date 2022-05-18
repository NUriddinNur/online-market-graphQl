import checkToken from '../../utils/checkToken.js'
import fs from 'fs'
import path from 'path'
import {GraphQLUpload} from 'graphql-upload'
import { finished } from 'stream'


export default {
    Upload: GraphQLUpload,

    Query: {
        getProducts: (_, { productId }, { read }) => {
            const products = read('products').filter(product => productId ? product.productId == productId : true)

            return products
        },
    },

    Mutation: {
      // add product
      insertProduct: async (parent, {file, categoryId, productname, price, shortdesc, longdesc, token}, {read, write, agent}) => {
        let { createReadStream, filename, mimetype } = await file
        const stream = createReadStream()
        const products = read("products")
        const categorys = read("categorys")
        const {admin} = checkToken(token, agent)

        productname = productname.trim()

        if(!productname || productname.length > 30) {
          return {
            status: 400,
            message: "Invalid Product name input!",
            data: null
          }
        }
        if(!admin) {
          return {
            status: 400,
            message: "Not allowed!",
            data: null
          }
        }
        if(!categorys.find(c => c.categoryId == categoryId)) {
          return {
            status: 400,
            message: "Category not found!",
            data: null
          }
        }
        if(products.find(p => p.productname === productname)) {
          return {
            status: 400,
            message: "The product already exists!",
            data: null
          }
        }
        if(mimetype.split("/")[0] != "image"){
          return {
            status: 400,
            message: "Invalid file input!",
            data: null
          }
        }
        if(shortdesc.length > 55){
          return {
            status: 400,
            message: "the short description should not exceed 55 characters!",
            data: null
          }
        }
        if(longdesc.length > 1000){
          return {
            status: 400,
            message: "the description should not exceed 1000 characters!",
            data: null
          }
        }

        filename = Date.now() + filename

        const newProduct = {
          productId: products.length ? products[products.length - 1].productId + 1 : 1,
          categoryId: +categoryId,
          productname,
          price,
          shortdesc: shortdesc,
          longdesc: longdesc,
          img:  "/images/" + filename,
        }
        
        products.push(newProduct)
        write("products", products)

        const out = fs.createWriteStream(path.join(process.cwd(), 'uploads', 'images', filename));
        stream.pipe(out);
        // await finished(out);
  
        return {
          status: 200,
          message: "Product added!",
          data: newProduct
        }
      },

      // edit product data
      editProduct: async (parent, {token, productId, productname, price, shortdesc, longdesc, file}, {read, write, agent}) => {
        let { createReadStream, filename, mimetype } = await file
        const stream = createReadStream()
        const {admin} = checkToken(token, agent)
        const products = read("products")
        const product = products.find(c => c.productId == productId)
        
        
        if(!admin) {
          return {
            status: 400,
            message: "Not allowed!",
            data: null
          }
        }
        if(productname){
          productname = productname.trim()
          if(!productname || productname.length > 30) {
            return {
              status: 400,
              message: "Invalid Product name input!",
              data: null
            }
          }
          if(products.find(p => p.productname === productname)) {
            return {
              status: 400,
              message: "The product already exists!",
              data: null
            }
          }
        }
        if(!product) {
          return {
            status: 400,
            message: "product not found!",
            data: null
          }
        }
        if(mimetype && mimetype.split("/")[0] != "image"){
          return {
            status: 400,
            message: "Invalid file input!",
            data: null
          }
        }
        if(shortdesc && shortdesc.length > 55){
          return {
            status: 400,
            message: "the short description should not exceed 55 characters!",
            data: null
          }
        }
        if(longdesc && longdesc.length > 1000){
          return {
            status: 400,
            message: "the description should not exceed 1000 characters!",
            data: null
          }
        }

        filename = Date.now() + filename

        product.productname = productname ? productname : product.productname
        product.price = price ? price : product.price
        product.shortdesc = shortdesc ? shortdesc : product.shortdesc
        product.longdesc = longdesc ? longdesc : product.longdesc
        product.img = filename ? "/images/" + filename : product.img
        
        if(filename){
          const out = fs.createWriteStream(path.join(process.cwd(), 'uploads', 'images', filename));
          stream.pipe(out);
          // await finished(out);
        }
        
        write("products", products)
        return {
          status: 200,
          message: "Product changed!",
          data: product
        }
      },

      // delete product
      deleteProduct: (_, {token, productId}, {read, write, agent}) => {
        const {admin} = checkToken(token, agent)
        const products = read("products")
        let productIndex = products.findIndex(c => c.productId == productId)

        if(!admin) {
          return {
            status: 400,
            message: "Not allowed!",
            data: null
          }
        }
        if(productIndex == -1) {
          return {
              status: 400,
              message: "Product not found",
              data: null
          }
      }
      let deletedProduct = products.splice(+productIndex, 1)
      write('products', products)

        return {
            status: 200,
            message: "Product Deleted!",
            data: deletedProduct[0]
        }
      }
    },
    

    Product:{
        productId: parent => parent.productId,
        category: (parent, _, {read}) =>  read("categorys").find(category => category.categoryId == parent.categoryId).categoryname,
        productname: parent => parent.productname,
        price: parent => parent.price,
        shortdesc: parent => parent.shortdesc,
        longdesc: parent => parent.longdesc,
        img: parent => parent.img
    }
}
