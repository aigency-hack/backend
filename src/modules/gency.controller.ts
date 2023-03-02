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
import { Blog, GenerateBlogContentDto, GenerateIdeaDto } from './gency.dto';
import { GencyService } from './gency.service';

@Controller('gency')
export class GencyController {
    constructor(
        private readonly gencyService: GencyService
    ) {

    }

    @Post('ideas')
    async getIdeas(
        @Body() dto: GenerateIdeaDto
    ): Promise<string[]> {
        const ideas = await this.gencyService.getIdeas(dto.productInfo, dto.mood)
        return ideas
    }

    @Post('blog')
    async getBlog(
        @Body() dto: GenerateBlogContentDto
    ): Promise<Blog> {
        return await this.gencyService.getBlog(dto.productInfo, dto.mood, dto.title)
    }
}