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
        purpose: string = 'give user knowledge about this product',
        mood: string = 'relaxed'
    ): Promise<string[]> {
        const response = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    "role": "system",
                    "content": `We have product name "${productInfo.name}". The unique selling point is "${productInfo.usp}"
                    Can you suggest 10 idea for blog title to ${purpose} in the ${mood} tone`
                }
            ]
        })
        // strip bullet point
        const lists = response.data.choices[0].message.content.split('\n')
        let ideas: string[] = []
        lists.forEach(content => {
            if (content != '') {
                let idea = content.substring(content.indexOf('.') + 1)
                    .trim()
                    .replace(/"/g, '')
                ideas.push(idea)
            }
        })
        return ideas
    }
}