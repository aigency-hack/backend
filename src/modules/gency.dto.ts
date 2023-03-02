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

export class Blog {
    title: string
    paragraphs: BlogParagraph[]
    images: string[]
}

export class BlogParagraph {
    topic: string
    content: string
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
    content: string
    keyword: string
    images: string[]
}