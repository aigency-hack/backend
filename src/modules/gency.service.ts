import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { Blog, BlogParagraph, ProductDto } from './gency.dto';

@Injectable()
export class GencyService {

    openai: OpenAIApi

    constructor(
        private readonly configService: ConfigService
    ) {
        const apiKey = this.configService.get<string>('app.openaiKey')
        const openaiConfig = new Configuration({
            apiKey
        })
        this.openai = new OpenAIApi(openaiConfig)
    }

    async getIdeas(
        productInfo: ProductDto,
        mood: string = 'relaxed'
    ): Promise<string[]> {
        const response = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            messages: [
                // {
                //     "role": "system",
                //     "content": `We have product name "${productInfo.name}". The unique selling point is "${productInfo.usp}"
                //     Can you suggest 10 idea for blog title to ${purpose} in the ${mood} tone`
                // }
                {
                    "role": "system",
                    "content": `You are copy writer, who always think and write related content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create related topic about user product ideas. Sometime, you may not need to mention product name in the topic, just create related topics that will help customer have more knowledge about this product category.`
                },
                {
                    "role": "user",
                    "content": `Please, create a 7-day short topics idea about my product. My product name is "${productInfo.name}", ${productInfo.description}. This product unique selling point is "${productInfo.usp}" You don't need to explain about the topic`
                },
                {
                    "role": "assistant",
                    "content": "1.) "
                }
            ]
        })
        // strip bullet point
        const lists = response.data.choices[0].message.content.split('\n')
        let ideas: string[] = []
        lists.forEach(content => {
            if (content != '') {
                let idea = content.substring(content.indexOf(')') + 1)
                    .trim()
                    .replace(/"/g, '')
                ideas.push(idea)
            }
        })
        return ideas
    }

    async getBlog(
        productInfo: ProductDto,
        mood: string,
        title?: string
    ): Promise<Blog> {
        // title
        let newTitle
        if (!title) {
            const titleResponse = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                temperature: 0.8,
                messages: [
                    {
                        "role": "system",
                        "content": `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`
                    },
                    {
                        "role": "user",
                        "content": `Please, create a tagline about my product. My product name is "${productInfo.name}", ${productInfo.description}. This product unique selling point is "${productInfo.usp}". You don't need to mention product name in this tagline`
                    }
                ]
            })
            newTitle = titleResponse.data.choices[0].message.content
        } else {
            newTitle = title
        }
        // get outline
        const outlineResponse = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            messages: [
                {
                    "role": "system",
                    "content": `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`
                },
                {
                    "role": "user",
                    "content": `My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}. Please, create a blog outline topics about my product with less than 8 topics in bullet format. You don't need to explain about the topic and don't need to mention the product name in every topic. The title of this blog is "${newTitle}"`
                },
                {
                    "role": "assistant",
                    "content": "1.) "
                }
            ]
        })
        let topics = []
        const outlines = outlineResponse.data.choices[0].message.content.split('\n')
        outlines.forEach(outline => {
            if (outline != '') {
                let topic = outline.substring(outline.indexOf(')') + 1)
                    .trim()
                    .replace(/"/g, '')
                topics.push(topic)
            }
        })
        // generate content per outline
        let contents: Record<string, any> = {}
        await Promise.all(topics.map(async (topic) => {
            const contentResponse = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                temperature: 0.8,
                messages: [
                    {
                        "role": "system",
                        "content": `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`
                    },
                    {
                        "role": "user",
                        "content": `My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}. Please, create a 1 paragraph content with less than 120 words about my product in this topic "${topic}".`
                    }
                ]
            })
            contents[topic] = contentResponse.data.choices[0].message.content
        }))
        // image
        const imageResponse = await this.openai.createImage({
            prompt: `${newTitle}`,
            n: 2,
            size: '1024x1024'
        })
        let images = []
        imageResponse.data.data.forEach(img => {
            images.push(img.url)
        })
        // construct all blog information
        let paragraphs: BlogParagraph[] = []
        const keys = Object.keys(contents)
        keys.forEach(key => {
            paragraphs.push({
                topic: key,
                content: contents[key]
            })
        })
        let blog: Blog = {
            title: newTitle,
            paragraphs,
            images
        }
        return blog
    }

    // async getBlog(
    //     productInfo: productDto,
    //     mood: string,
    //     title: string
    // ) {
    //     const response = await this.openai.createChatCompletion({
    //         model: 'gpt-3.5-turbo',
    //         temperature: 0.8,
    //         messages: [
    //             {
    //                 "role": "system",
    //                 "content": `You are copy writer assistant with ${mood} tone. You will helping to write a blog post to give knowledge about customer product. Post is limited to 200-300 words.`
    //             },
    //             {
    //                 "role": "user",
    //                 "content": `My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}`
    //             }
    //         ]
    //     })
    //     console.log(response.data.choices[0].message)
    // }
}