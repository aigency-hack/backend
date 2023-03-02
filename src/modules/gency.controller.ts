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
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { Blog, GenerateBlogContentDto, GenerateIdeaDto, GenerateShortPostDto, ShortPost } from './gency.dto';
import { GencyService } from './gency.service';

@Controller('gency')
export class GencyController {
    constructor(
        private readonly gencyService: GencyService
    ) {

    }

    @ApiOkResponse({
        description: 'list of ideas',
        type: 'string',
        isArray: true
    })
    @Post('ideas')
    async getIdeas(
        @Body() dto: GenerateIdeaDto
    ): Promise<string[]> {
        const ideas = await this.gencyService.getIdeas(dto.productInfo, dto.mood)
        return ideas
    }

    @ApiOkResponse({
        description: 'blog object',
        type: Blog,
        isArray: false
    })
    @Post('blog')
    async getBlog(
        @Body() dto: GenerateBlogContentDto
    ): Promise<Blog> {
        return await this.gencyService.getBlog(dto.productInfo, dto.mood, dto.title)
    }

    @ApiOkResponse({
        description: 'post object',
        type: ShortPost,
        isArray: false
    })
    @Post('post')
    async getPost(
        @Body() dto: GenerateShortPostDto
    ): Promise<ShortPost> {
        return await this.gencyService.getPost(dto.productInfo, dto.mood, dto.purpose)
    }
}