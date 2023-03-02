import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GencyModule } from './modules/gency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig
      ],
      isGlobal: true
    }),
    GencyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
