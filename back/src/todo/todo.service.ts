import { Injectable } from '@nestjs/common';
import { PrismaClient, Todo } from '@prisma/client';

@Injectable()
export class TodoService {
    private prisma = new PrismaClient();
}
