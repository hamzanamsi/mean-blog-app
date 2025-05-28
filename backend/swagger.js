const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog Collaboratif API",
      version: "1.0.0",
      description: "Documentation de l'API du blog collaboratif (MEAN Stack)",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./models/*.js"], // fichiers à scanner pour les annotations
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
