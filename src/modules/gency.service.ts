import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { Blog, BlogParagraph, ProductDto, ShortPost } from './gency.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class GencyService {
  openai: OpenAIApi;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {
    const apiKey = this.configService.get<string>('app.openaiKey');
    const openaiConfig = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(openaiConfig);
  }

  async getIdeas(
    productInfo: ProductDto,
    mood: string = 'relaxed',
  ): Promise<string[]> {
    let response;
    const key = { mood, ...productInfo };
    const cachedData = await this.cacheService.get(JSON.stringify(key));
    if (cachedData) {
      response = cachedData;
    } else {
      response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        messages: [
          // {
          //     "role": "system",
          //     "content": `We have product name "${productInfo.name}". The unique selling point is "${productInfo.usp}"
          //     Can you suggest 10 idea for blog title to ${purpose} in the ${mood} tone`
          // }
          {
            role: 'system',
            content: `You are copy writer, who always think and write related content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create related topic about user product ideas. Sometime, you may not need to mention product name in the topic, just create related topics that will help customer have more knowledge about this product category.`,
          },
          {
            role: 'user',
            content: `Please, create a 7-day short topics idea about my product. My product name is "${productInfo.name}", ${productInfo.description}. This product unique selling point is "${productInfo.usp}" You don't need to explain about the topic`,
          },
          {
            role: 'assistant',
            content: '1.) ',
          },
        ],
      });
    }
    // strip bullet point
    const lists = response.data.choices[0].message.content.split('\n');
    let ideas: string[] = [];
    lists.forEach((content) => {
      if (content != '') {
        let idea = content
          .substring(content.indexOf(')') + 1)
          .trim()
          .replace(/"/g, '');
        ideas.push(idea);
      }
    });
    return ideas;
  }

  async getBlog(
    productInfo: ProductDto,
    mood: string,
    title?: string,
  ): Promise<Blog> {
    // title
    let newTitle;
    if (!title) {
      const titleResponse = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`,
          },
          {
            role: 'user',
            content: `Please, create a tagline about my product. My product name is "${productInfo.name}", ${productInfo.description}. This product unique selling point is "${productInfo.usp}". You don't need to mention product name in this tagline`,
          },
        ],
      });
      newTitle = titleResponse.data.choices[0].message.content.replace(
        /"/g,
        '',
      );
    } else {
      newTitle = title;
    }
    // get outline
    const key = { mood, newTitle, ...productInfo };
    let outlineResponse;
    const cachedData = await this.cacheService.get(JSON.stringify(key));
    if (cachedData) {
      outlineResponse = cachedData;
    } else {
      outlineResponse = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`,
          },
          {
            role: 'user',
            content: `My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}. Please, create a blog outline topics about my product with less than 8 topics in bullet format. You don't need to explain about the topic and don't need to mention the product name in every topic. The title of this blog is "${newTitle}"`,
          },
          {
            role: 'assistant',
            content: '1.) ',
          },
        ],
      });
    }
    let topics = [];
    const outlines =
      outlineResponse.data.choices[0].message.content.split('\n');
    outlines.forEach((outline) => {
      if (outline != '') {
        let topic = outline
          .substring(outline.indexOf(')') + 1)
          .trim()
          .replace(/"/g, '');
        topics.push(topic);
      }
    });
    // generate content per outline
    let contents: Record<string, any> = {};
    await Promise.all(
      topics.map(async (topic) => {
        const contentResponse = await this.openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          temperature: 0.8,
          messages: [
            {
              role: 'system',
              content: `You are copy writer, who always think and write content about customer product in ${mood} tone. User will tell you about product name, product description and product unique selling point and you can use all of these information to create content about user product ideas. Sometime, you may not need to mention product name in the topic, just create content that will help customer have more knowledge about this product category.`,
            },
            {
              role: 'user',
              content: `My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}. Please, create a 1 paragraph content with less than 120 words about my product in this topic "${topic}".`,
            },
          ],
        });
        contents[topic] = contentResponse.data.choices[0].message.content;
      }),
    );
    // image
    const imageResponse = await this.openai.createImage({
      prompt: `${newTitle}`,
      n: 2,
      size: '1024x1024',
    });
    let images = [];
    imageResponse.data.data.forEach((img) => {
      images.push(img.url);
    });
    // construct all blog information
    let paragraphs: BlogParagraph[] = [];
    const keys = Object.keys(contents);
    keys.forEach((key) => {
      paragraphs.push({
        topic: key,
        content: contents[key],
      });
    });
    let blog: Blog = {
      title: newTitle,
      paragraphs,
      images,
    };
    return blog;
  }

  async getPost(
    productInfo: ProductDto,
    mood: string,
    purpose: string = 'to give knowledge about my product category',
  ): Promise<ShortPost> {
    const key = { mood, ...productInfo, purpose };
    let contentResponse;
    const cachedData = await this.cacheService.get(JSON.stringify(key));
    if (cachedData) {
      contentResponse = cachedData;
    } else {
      contentResponse = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `You are copy writer assistant with ${mood} tone. You will helping to write a social network post. The content is about user product with the propose is "${purpose}". Post is limited to 200-300 words with only 1 paragraph. You don't need to mention product name in this post`,
          },
          {
            role: 'user',
            content: `Please, write a 1 paragraph for social network content. My product name is "${productInfo.name}", ${productInfo.description}. The unique selling point of this product is ${productInfo.usp}`,
          },
        ],
      });
    }
    const content = contentResponse.data.choices[0].message.content;
    // concept
    const conceptResponse = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: `Please, Extract keywords from this text:${content}`,
        },
        {
          role: 'assistant',
          content: 'keyword: ',
        },
      ],
    });
    const concept = conceptResponse.data.choices[0].message.content;
    // image
    const imageResponse = await this.openai.createImage({
      prompt: `${concept}`,
      n: 2,
      size: '1024x1024',
    });
    let images = [];
    imageResponse.data.data.forEach((img) => {
      images.push(img.url);
    });
    return {
      content,
      keyword: concept,
      images,
    };
  }
}
