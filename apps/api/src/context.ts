import { Request } from 'express';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { Client as ElasticClient } from '@elastic/elasticsearch';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize PostgreSQL Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/republik',
});

// Initialize Redis Client (optional)
let redisClient: any = null;
if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
    redisClient.connect().catch((err: any) => console.error('Redis Connection Failed', err));
}

// Initialize Elasticsearch Client (optional)
let esClient: any = null;
if (process.env.ELASTICSEARCH_URL) {
    esClient = new ElasticClient({ node: process.env.ELASTICSEARCH_URL });
}

export async function createContext({ req }: { req: Request }) {
    const locale = (req.headers['x-locale'] as string) || 'en';

    // Auth logic
    let user = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            user = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            // Allow unauthenticated requests, resolvers will handle protection if needed
        }
    }

    return {
        req,
        db: pool,
        user,
        locale,
        redis: redisClient,
        elasticsearch: esClient,
    };
}
