import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { generateBlogContentDto, generateIdeaDto } from './gency.dto';
import { GencyService } from './gency.service';

@Controller('gency')
export class GencyController {
    constructor(
        private readonly gencyService: GencyService
    ) {

    }

    @Post('ideas')
    async getIdeas(
        @Body() dto: generateIdeaDto
    ): Promise<string[]> {
        const ideas = await this.gencyService.getBlogIdeas(dto.productInfo, dto.mood)
        return ideas
    }

    @Post('blog')
    async getBlog(
        @Body() dto: generateBlogContentDto
    ): Promise<string[]> {
        const ideas = await this.gencyService.getBlogIdeas(dto.productInfo, dto.mood)
        return ideas
    }
}