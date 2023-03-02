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
import { generateBlogIdeaDto } from './gency.dto';
import { GencyService } from './gency.service';

@Controller('gency')
export class GencyController {
    constructor(
        private readonly gencyService: GencyService
    ) {

    }

    @Post('blog/ideas')
    async getBlogIdeas(
        @Body() dto: generateBlogIdeaDto
    ): Promise<string[]> {
        const ideas = await this.gencyService.getBlogIdeas(dto.productInfo)
        return ideas
    }
}