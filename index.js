const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { makeExecutableSchema } = require("graphql-tools");
const { ApolloServer } = require("apollo-server-express");

const PORT = 8090;

// Create Express application
const app = express();

// Apply CORS to the endpoints
app.use(cors({}));

// Add body parser
app.use(bodyParser.json());

// Add health endpoint for testing
app.get("/health", (req, res) => {
  res.send({ status: "UP" });
});

const waiit = (time) => new Promise((res)=>{
  setTimeout(()=>{
    res();
  },time)
}); 

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

const dogs = {
  '1A': {
    id: '1A', 
    ownerId: '1B',
    name: "Rex",
    personality: 'Wild',
    age: 1
  }, 
  '2A': {
    id: '2A', 
    ownerId: '2B',
    name: "Dobby",
    personality: 'Happy',
    age: 2
  }, 
  '3A': {
    id: '3A', 
    ownerId: '3B',
    name: "Oscar",
    personality: 'Moody',
    age: 3
  }, 
};

const owners = {
  '1B': {
    id: '1B', 
    name: "Joe",
    personality: 'Awesome',
  }, 
  '2B': {
    id: '2B', 
    name: "Alyssa",
    personality: 'Alright'
  }, 
}


// Create GRAPHQL SCHEMA
const dogQueryResolver = async ( root, args ) => {
  const dog = dogs[args.id];
  console.log('Dog:', dog);
  await waiit(2000);
  return dog;
};

const ownerResolver = ( dog ) => {
  const owner = owners[dog.ownerId];
  if( !owner ){
    throw new Error(`${dog.name} lost his owner!!!! Ahh!!!`);
  }
  return owner;
};

const ownerQueryResolver = async ( root, args ) => {
  const owner = owners[args.id];
  console.log('Owner:', owner);
  await waiit(2000);
  return owner;
}

const randResolver = () => {
  return getRandomIntInclusive(0, 100000); 
}

const changeDogAge = ( root, { id, age } ) => {
  console.log('Change dog age', id, age);
  dogs[id].age = age;
  console.log('Dog:', dogs[id]);
  return dogs[id];
}

const dogsResolver = () => {
  // Change the rand every time the fav dog res is called
  dogs['1A'].rand = randResolver();
  return [ dogs['1A'] ];
}

const dogParkResolver = async () => {
  await waiit(2000);
  return {
    name: 'The Dog Park',
    dogs: dogsResolver()
  };
} 

const averageAgeResolver = (root) => {
  const sum = root.dogs.reduce( (acc, cur) => acc + cur.age, 0)
  const length = root.dogs.length;
  console.log('SUM', sum);
  console.log('LENGHT', length);
  return sum / length;
}

const resolvers = {
  Query: {
    dog: dogQueryResolver,
    owner: ownerQueryResolver,
    dogPark: dogParkResolver,
    dogParkByName: dogParkResolver
  },
  Mutation: {
    changeDogAge
  },
  Dog: {
    owner: ownerResolver,
    rand: randResolver
  }, 
  Owner: { 
    rand: randResolver
  },
  DogPark: {
    averageAge: averageAgeResolver
  }
};

const typeDefs = `
  type Dog {
    id: ID!
    name: String!
    owner: Owner
    rand: Int
    age: Int
  }
  type Owner {
    name: String!
    id: ID!
    rand: Int
  }
  type DogPark {
    name: String
    dogs: [Dog]
    averageAge: Int
  }
  type Query {
    dog(id: ID!): Dog!
    owner(id: ID!): Owner!
    dogPark: DogPark!
    dogParkByName( name: String! ): DogPark!
  }
  type Mutation {
    changeDogAge(id: ID!, age: Int!): Dog!
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({
  schema,
  context: ({ req, res }) => ({
    req,
    res
  })
});

server.applyMiddleware({ app, path: "/graphql", cors: {} });

// Create the http server
http.createServer(app).listen(PORT, () => {
  console.log("Http server is now running on port", PORT);
});

