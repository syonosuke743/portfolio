import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Todo } from '@prisma/client';

@Injectable()
export class TodoService {
    constructor(private readonly prisma: PrismaService) { }

    async getTodos(): Promise<Todo[]> {
        return this.prisma.todo.findMany();
    }

    async getTodoById(id: number): Promise<Todo | null> {
        return this.prisma.todo.findUnique({ where: { id } });
    }

    async create(title: string, description: string): Promise<Todo> {
        return this.prisma.todo.create({
            data:
            {
                title,
                description,
                completed: false,
            },
        })
    }

    async update(id: number, data: Partial<Todo>): Promise<Todo> {
        return this.prisma.todo.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Todo> {
        return this.prisma.todo.delete({ where: { id } });
    }
}
