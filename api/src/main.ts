import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validates and transforms every request body using the DTO classes.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // The web app runs on another origin (port), so the browser needs CORS.
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
