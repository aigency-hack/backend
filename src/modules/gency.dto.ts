export class productDto {
    name: string
    usp: string
    description: string
}

export class generateBlogContentDto {
    productInfo: productDto
    mood: string
    title: string
}

export class generateBlogIdeaDto {
    productInfo: productDto
    mood: string
}