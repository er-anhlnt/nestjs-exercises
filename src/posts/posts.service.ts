import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async createPost(createPostDto: CreatePostDto, userId: number) {
    return this.postRepository.save({
      title: createPostDto.title,
      content: createPostDto.content,
      user: { id: userId },
    });
  }

  findAll(getPostsDto: GetPostsDto) {
    const queryBuilder = this.postRepository.createQueryBuilder('post');

    if (getPostsDto.sort) {
      getPostsDto.sort.forEach((field) => {
        queryBuilder.orderBy(
          `post.${field.replace('-', '')}`,
          field[0] === '-' ? 'DESC' : 'ASC',
        );
      });
    }

    return queryBuilder
      .select(getPostsDto.fields.map((field) => 'post.' + field))
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.email'])
      .offset(getPostsDto.offset)
      .limit(getPostsDto.limit)
      .getManyAndCount();
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
      select: {
        user: {
          id: true,
          lastName: true,
          firstName: true,
          email: true,
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post does not exist');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post does not exist');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('User is not author of the post');
    }

    return await this.postRepository.update(
      { id },
      { id: id, ...updatePostDto },
    );
  }

  async remove(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) {
      throw new NotFoundException('Post does not exist');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('User is not author of the post');
    }

    return this.postRepository.delete({ id });
  }
}
