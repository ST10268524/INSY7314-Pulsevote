import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export default function setupSwagger(app) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'PulseVote API', version: '1.0.0' }
    },
    apis: ['./routes/*.js']
  };
  const spec = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}
