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

const dogs = {
  '1A': {
    id: '1A', 
    ownerId: '1B',
    name: "Rex",
    personality: 'Wild'
  }, 
  '2A': {
    id: '2A', 
    ownerId: '2B',
    name: "Dobby",
    personality: 'Happy'
  }, 
  '3A': {
    id: '3A', 
    ownerId: '3B',
    name: "Oscar",
    personality: 'Moody'
  }, 
};

const owners = {
  '1B': {
    id: '1B', 
    name: "Joe",
    personality: 'Awesome'
  }, 
  '2B': {
    id: '2B', 
    name: "Alyssa",
    personality: 'Alright'
  }, 
}

// Create GRAPHQL SCHEMA
const dogQueryResolver = ( root, args ) => {
  const dog = dogs[args.id];
  console.log('Dog:', dog);
  return dog;
};

const ownerResolver = ( dog ) => {
  const owner = owners[dog.ownerId];
  if( !owner ){
    throw new Error(`${dog.name} lost his owner!!!! Ahh!!!`);
  }
  return owner;
};

const ownerQueryResolver = ( root, args ) => {
  const owner = owners[args.id];
  console.log('Owner:', owner);
  return owner;
}

const resolvers = {
  Query: {
    dog: dogQueryResolver,
    owner: ownerQueryResolver
  },
  Dog: {
    owner: ownerResolver
  }
};

const typeDefs = `
  type Dog {
    id: ID!
    name: String!
    owner: Owner
  }
  type Owner {
    name: String!
    id: ID!
  }
  type Query {
    dog(id: ID!): Dog!
    owner(id: ID!): Owner!
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

