import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { join } from 'path';
import * as express from 'express';
import { exec } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // 🔁 Migraciones automáticas en producción
  if (process.env.NODE_ENV === 'production') {
    exec('npx prisma migrate deploy', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Error ejecutando migración:', stderr);
      } else {
        console.log('✅ Migraciones aplicadas:\n', stdout);
      }
    });
  }

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://xurp-j7zmc2qm1-davids-projects-e567e938.vercel.app',
      'https://xurp-ia.onrender.com',
      'https://xurp-ia.vercel.app',
    ],
    credentials: true,
  });
  console.log('✅ CORS enabled for frontend at http://localhost:3000');

  // Validaciones globales
  app.useGlobalPipes(new ValidationPipe());
  console.log('✅ Validation pipe enabled');

  // Conexión a la base de datos
  const prismaService = app.get(PrismaService);
  await prismaService.$connect();

  if (process.env.LOG_LEVEL === 'query') {
    prismaService.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
      return result;
    });
  }

  console.log('✅ Database connection established');

  // Servir archivos de /uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`
🚀 Server is running on: http://localhost:${port}
📝 API Documentation: http://localhost:${port}/api
⚡ Environment: ${process.env.NODE_ENV || 'development'}
🔐 Authentication endpoints:
   POST http://localhost:${port}/auth/register
   POST http://localhost:${port}/login
`);
}

bootstrap();
