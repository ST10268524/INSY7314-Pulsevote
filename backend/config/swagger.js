/**
 * Swagger Configuration
 *
 * Sets up Swagger/OpenAPI documentation for the PulseVote API.
 * Provides interactive API documentation accessible at /api-docs endpoint.
 *
 * @author PulseVote Team
 * @version 1.0.0
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Setup Swagger documentation for the Express app
 *
 * Configures Swagger UI to serve API documentation with OpenAPI 3.0 specification.
 * Documentation is generated from JSDoc comments in route files.
 *
 * @param {Object} app - Express application instance
 */
export default function setupSwagger(app) {
  // Swagger configuration options
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PulseVote API',
        version: '1.0.0',
        description: 'API documentation for PulseVote polling application'
      }
    },
    // Path to route files containing Swagger annotations
    apis: ['./routes/*.js']
  };

  // Generate Swagger specification from JSDoc comments
  const spec = swaggerJsdoc(options);

  // Setup Swagger UI middleware
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}
