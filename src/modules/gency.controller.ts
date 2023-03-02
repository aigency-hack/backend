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
import { ApiBody } from '@nestjs/swagger';
import { Blog, GenerateBlogContentDto, GenerateIdeaDto, GenerateShortPostDto, ShortPost } from './gency.dto';
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

    @Post('post')
    async getPost(
        @Body() dto: GenerateShortPostDto
    ): Promise<ShortPost> {
        return await this.gencyService.getPost(dto.productInfo, dto.mood, dto.purpose)
    }
}