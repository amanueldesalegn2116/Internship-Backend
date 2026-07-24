import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global prefix ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api', {
    exclude: ['/', 'docs'],
  });

  // ─── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: true, // Allow all origins in deployment (Vercel & local)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Global Validation Pipe ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true,        // transform plain objects to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Swagger / OpenAPI ──────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Internship Applicant Management API')
    .setDescription(
      `REST API for managing internship applications.\n\n` +
      `**Authentication**: Use POST /api/auth/login to receive a JWT token, ` +
      `then click "Authorize" and enter: \`Bearer <your-token>\`\n\n` +
      `**Seeded admin credentials**: email: \`admin@intern.dev\`, password: \`Admin@1234\``,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Applicants', 'Internship applicant CRUD and status management')
    .addTag('Dashboard', 'Summary statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };

  // Serve Swagger UI at both /docs and /api/docs for maximum compatibility
  SwaggerModule.setup('docs', app, document, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerOptions);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs:      http://localhost:${port}/api/docs`);
  console.log(`🌱 Environment:       ${process.env.NODE_ENV ?? 'development'}\n`);
}

bootstrap();
