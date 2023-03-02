import { Module } from '@nestjs/common';
import { GencyController } from './gency.controller';
import { GencyService } from './gency.service';

@Module({
    imports: [],
    controllers: [GencyController],
    providers: [GencyService],
    exports: [GencyService],
})
export class GencyModule { }
