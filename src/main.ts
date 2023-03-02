import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // swagger
  const documentConfig = new DocumentBuilder()
    .setTitle('AiGency')
    .setVersion('0.1')
    .build()
  const document = SwaggerModule.createDocument(app, documentConfig)
  SwaggerModule.setup('doc', app, document)
  // cors
  app.enableCors({
    origin: '*'
  })
  // port
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  await app.listen(port);
}
bootstrap();
