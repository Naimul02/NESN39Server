const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
// const jwt = require('jsonwebtoken')


// middleware
app.use(cors())
app.use(express.json(
  {

    origin : ['http://localhost:5173/' , 'https://departmental-store-bbb57.web.app/']
  }
))






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f21lusd.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).send('unauthorized access')
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: 'forbidden access' })

//     }
//     req.decoded = decoded;
//     next();
//   })
// }
async function run() {
  try {

    // const milkProductsCollection = client.db("NESN39").collection("milkProducts")
    const categoryProductsCollection = client.db("NESN39").collection("Products")
    const productsCollection = client.db("NESN39").collection("Products")
    
    
    // const chocolateProductsColletion = client.db("departmentalStore").collection("chocolateproducts")
    const bookingsCollection = client.db("departmentalStore").collection('bookings');
    const addServiceCollection = client.db("departmentalStore").collection("addservice");
    const reviewCollection = client.db("NESN39").collection("reviews");
    // const randomCollection = client.db("departmentalStore").collection("randomproducts");
    const usersCollection = client.db("NESN39").collection("users");
    const cartsCollection = client.db("NESN39").collection("carts");
    const confirmOrderCollection = client.db("NESN39").collection("confirmOrder");
    


    app.post('/users', async (req, res) => {
      const info = req.body;
      const result = await usersCollection.insertOne(info)
      res.send(result)
    })
    app.get('/carts' , async(req , res) => {
      const email = req.query.email;
      const query = {email : email};
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    })

    
app.get('/cart', async (req, res) => {
  const { email, id } = req.query;
  const item = await cartsCollection.findOne({ email, id });
  res.send(item ? [item] : []);
});


app.patch('/carts/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  await cartsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { quantity } }
  );
  res.send({ success: true });
});
    app.post('/carts' , async(req , res) => {
      const info = req.body;
      const result = await cartsCollection.insertOne(info);
      res.send(result);
    })
    app.post('/orderConfirm' , async(req , res) => {
        const info = req.body;
        const result = await confirmOrderCollection.insertOne(info)



        const query ={ _id : {
          $in : info.cartsId?.map(id => new ObjectId(id))
        }}
        const deleteResult = await cartsCollection.deleteMany(query);
        // console.log(deleteResult);
        res.send({result , deleteResult});
        
    })
    app.delete('/order/:id' , async(req , res) => {
      const id = req.params.id;
      const query = {"orders._id" : id};
      const update = {$pull : {orders : {_id : id}}}
      
      
      const result = await confirmOrderCollection.updateOne(query , update)
      res.send(result)
    })
    app.get('/orders' , async(req , res) => {
      const email = req.query.email;
      const query = {email : email}
      const allOrders = await confirmOrderCollection.find(query).toArray();
      const orders =  allOrders?.flatMap(order => order?.orders);
      // console.log("orders" , orders)
      res.send(orders)
    })
    app.get("/usersImg" , async(req , res) => {
        const email = req.query.email;
        const query = {email}
        const result = await usersCollection.findOne(query)
        console.log("useriMG : " , result)
        res.send(result);
    })
    app.patch('/changePassword' , async(req , res) => {
      const info = req.body;
      
      
      const filter = { email: info?.email}

      
     const options = { upsert: true };
        const updatedDoc = {
          $set: {
            password : info?.password
  
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
        res.send(result)
    
     
     
    })
    app.patch('/users/:email' , async(req , res) => {
      const info = req.body;
      
      const email = req.params.email;
      const filter = { email: email}
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name : info.name,
          email : info.email,
          address : info.address,
          phoneNumber : info.phoneNumber,
          photourl : info.photoURL

        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
      res.send(result)
        
    })
    app.get('/users', async (req, res) => {
      const query = {}
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/products' , async(req ,res) => {
      const query = {}
      const result = await productsCollection.find(query).toArray();
      // console.log("result : " , result)
      res.send(result);
    })

    app.get('/product/:id' , async(req , res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.send(result);
    })
    app.get('/relatedProducts/:category' , async(req , res) => {
      const category = req.params.category;
      const query = {category : category}
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    })
    
    
    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }
      const query = { email: email }
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;

      
      const filter = { _id: new ObjectId(id) }
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result)




    })
    app.delete('/product' , async(req , res) => {
      const id = req.query.id;
      const query = {_id : new ObjectId(id)}
      const result = await cartsCollection.deleteOne(query)
      res.send(result)
    })
    app.post('/bookings', async (req, res) => {
      const info = req.body;
      
      const result = await bookingsCollection.insertOne(info)
      res.send(result)

    })
    app.get('/review/:email/:id' , async(req , res) => {
        const email = req.params.email;
        const productId = req.params.id
        const query = {
          email : email,
          productId : productId
        }

        const  result = await reviewCollection.findOne(query);
        console.log("result" , result)
        
    if (result) {
      res.send({ reviewed : true, data: result });
    } else {
      res.send({ reviewed: false });
    }
        
    })
    app.post('/reviews', async (req, res) => {
      const info = req.body;
      const result = await reviewCollection.insertOne(info)
      res.send(result)
    })

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id
      const query = {productId : id}
      const result = await reviewCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/addservice', async (req, res) => {
      const query = {}
      const result = await addServiceCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/randomproducts', async (req, res) => {
      const query = {}
      const result = await randomCollection.find(query).toArray()
      res.send(result);
    })
    app.get("/categoryProducts/:category" , async(req , res) => {
      const category = req.params.category;
      
      const query = {category : category};
      const result = await categoryProductsCollection.find(query).toArray();
      
      res.send(result);
    })

    // app.get('/jwt', async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email }
    //   const user = await usersCollection.findOne(query);
    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
    //     return res.send({ accessToken: token })
    //   }

      
    //   res.status(403).send({ accessToken: '' })
    // })

  

    // app.get('/users/admin/:email', async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email }
    //   const user = await usersCollection.findOne(query);
    //   res.send({ isAdmin: user?.role === 'admin' });
    // })
    // app.put('/users/admin/:id', verifyJWT, async (req, res) => {
    //   const decodedEmail = req.decoded.email;
      
    //   const query = { email: decodedEmail };
    //   const user = await usersCollection.findOne(query)
    //   if (user?.role !== 'admin') {
    //     return res.status(403).send({ message: 'forbidden access' })
    //   }
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) }
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       role: 'admin'
    //     }
    //   }
    //   const result = await usersCollection.updateOne(filter, updatedDoc, options);
    //   res.send(result)
    // })

    app.listen(port, () => {
      console.log(`Server is running on ${port}`)
    })

  }


  finally {

  }
}
run().catch(error => console.error(error));
app.get('/', async (req, res) => {
  res.send('we are going start our server-side')
})