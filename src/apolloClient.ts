// src/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URI });

// const httpLink = createHttpLink({
//   uri: "https://erpv4api.appxes-erp.in/graphql", // 🔁 Replace this with your actual GraphQL endpoint
// });

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});