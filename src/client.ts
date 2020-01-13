import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink, split } from 'apollo-link';

const httpUri = process.env.REACT_APP_SERVER_URL + '/graphql';
const wsUri = httpUri.replace(/^https?/, 'ws');

const httpLink = new HttpLink({
  uri: httpUri,
  // cors 요청을 위한 헤더
  credentials: 'include',
});

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    // Automatic reconnect in case of connection error
    reconnect: true,
  },
});

const terminatingLink = split(
  ({ query }) => {
    //const { kind, operation } = getMainDefinition(query);
    const data = getMainDefinition(query);

    // If this is a subscription query, use wsLink, otherwise use httpLink
    return (
      data.kind === 'OperationDefinition' && data.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const link = ApolloLink.from([terminatingLink]);

const inMemoryCache = new InMemoryCache();

export default new ApolloClient({
  link,
  cache: inMemoryCache,
  connectToDevTools: true,
});
