export class ProductDto {
    name: string
    usp: string
    description: string
}

export class GenerateBlogContentDto {
    productInfo: ProductDto
    mood: string
    title: string
}

export class GenerateIdeaDto {
    productInfo: ProductDto
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
    productInfo: ProductDto
    mood: string
    purpose?: string
}

export class ShortPost {
    content: string
    keyword: string
    images: string[]
}