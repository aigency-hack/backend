import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { productDto } from './gency.dto';

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

    async getBlogIdeas(
        productInfo: productDto,
        mood: string = 'relaxed',
        purpose: string = 'give user knowledge about this product',
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
}