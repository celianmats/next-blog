/**
 * GraphQL API Server for Republik Multi-Language Platform
 * Main entry point with Apollo Server setup
 */

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import http from 'http';
import cors from 'cors';
import { GraphQLError } from 'graphql';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { formatError } from './utils/errors';

const PORT = process.env.PORT || 5010;

interface Context {
  user?: any;
  locale: string;
  db: any;
  redis: any;
  elasticsearch: any;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Apollo Server configuration
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    formatError,
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // Middleware
  app.use(
    '/graphql',
    cors({
      origin: [
        process.env.WEB_URL || 'http://localhost:3000',
        process.env.ADMIN_URL || 'http://localhost:3001'
      ],
      credentials: true,
    }),
    express.json({ limit: '10mb' }),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start server
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`🚀 GraphQL API server ready at http://localhost:${PORT}/graphql`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
