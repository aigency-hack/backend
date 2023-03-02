import { ApiProperty } from "@nestjs/swagger"

export class ProductDto {
    @ApiProperty()
    name: string
    @ApiProperty()
    usp: string
    @ApiProperty()
    description: string
}

export class GenerateBlogContentDto {
    @ApiProperty()
    productInfo: ProductDto
    @ApiProperty()
    mood: string
    @ApiProperty()
    title: string
}

export class GenerateIdeaDto {
    @ApiProperty()
    productInfo: ProductDto
    @ApiProperty()
    mood: string
}

export class BlogParagraph {
    @ApiProperty()
    topic: string
    @ApiProperty()
    content: string
}

export class Blog {
    @ApiProperty()
    title: string
    @ApiProperty({ isArray: true, type: BlogParagraph })
    paragraphs: BlogParagraph[]
    @ApiProperty({ isArray: true, type: 'string' })
    images: string[]
}

export class GenerateShortPostDto {
    @ApiProperty()
    productInfo: ProductDto
    @ApiProperty()
    mood: string
    @ApiProperty({ nullable: true })
    purpose?: string
}

export class ShortPost {
    @ApiProperty()
    content: string
    @ApiProperty()
    keyword: string
    @ApiProperty()
    images: string[]
}