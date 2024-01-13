import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, CreatePostResponse } from './dto/create-post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/dto/currentUser';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { PaginationMetadata } from 'src/common/dto/pagination.dto';
import { Request } from 'express';
import { LinksMetadata } from 'src/common/dto/links.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@Controller('posts')
@UseInterceptors(ResponseInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ResponseMessage('Post created')
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<CreatePostResponse> {
    const post = await this.postsService.createPost(createPostDto, user.id);

    return plainToInstance(CreatePostResponse, post);
  }

  @Get()
  @ResponseMessage('Ok')
  async getPosts(@Query() getPostsDto: GetPostsDto, @Req() req: Request) {
    const [posts, total] = await this.postsService.findAll(getPostsDto);

    return {
      items: posts,
      pagination: plainToInstance(PaginationMetadata, {
        total,
        limit: getPostsDto.limit,
        offset: getPostsDto.offset,
      }),
      links: new LinksMetadata(
        req,
        getPostsDto.offset,
        getPostsDto.limit,
        total,
      ),
    };
  }

  @Get(':id')
  @ResponseMessage('Ok')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Post updated')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    await this.postsService.update(id, updatePostDto, user.id);

    return { id };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Post deleted')
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: CurrentUser,
  ) {
    await this.postsService.remove(id, user.id);
  }
}
