'use client';

/**
 * Apollo Client Configuration
 * Configures GraphQL client with authentication and caching
 */

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// ================================
// HTTP Link
// ================================
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/graphql',
  credentials: 'include',
});

// ================================
// Auth Link - Add JWT token to headers
// ================================
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// ================================
// Error Link - Handle errors globally
// ================================
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// ================================
// Cache Configuration
// ================================
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Pagination for articles
        articles: {
          keyArgs: ['locale', 'categoryId', 'tagId', 'status'],
          merge(existing = { edges: [], pageInfo: {} }, incoming) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
        // Pagination for search
        searchArticles: {
          keyArgs: ['query', 'locale'],
          merge(existing = { edges: [], pageInfo: {} }, incoming) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          },
        },
      },
    },
    Article: {
      fields: {
        // Cache article content separately
        content: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// ================================
// Create Apollo Client
// ================================
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// ================================
// Helper Functions
// ================================

/**
 * Clear Apollo cache
 */
export const clearCache = async () => {
  await apolloClient.clearStore();
};

/**
 * Refetch all active queries
 */
export const refetchQueries = async () => {
  await apolloClient.refetchQueries({
    include: 'active',
  });
};

/**
 * Reset Apollo store (clears cache and refetches)
 */
export const resetStore = async () => {
  await apolloClient.resetStore();
};

// ================================
// Apollo Provider Component
// ================================

import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProviderBase client={apolloClient}>
      {children}
    </ApolloProviderBase>
  );
}

// ================================
// Custom Hooks
// ================================

/**
 * Hook to manually refetch a query
 */
export function useRefetch() {
  return {
    refetchQueries,
    clearCache,
    resetStore,
  };
}
