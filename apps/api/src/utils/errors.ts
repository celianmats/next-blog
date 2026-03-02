import { GraphQLError } from 'graphql';

export function formatError(formattedError: any, error: any) {
    // Add custom error formatting logic here
    // For now, just return the default formatted error

    // You can mask internal database errors in production
    if (process.env.NODE_ENV === 'production' && formattedError.extensions?.code === 'DATABASE_ERROR') {
        return {
            message: 'Internal server error',
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        };
    }

    return formattedError;
}
