import { Body, Controller, Delete, Get, Param, ParseFloatPipe, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from '@prisma/client';

@Controller('todo')
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Get()
    async findAll(): Promise<Todo[]> {
        return this.todoService.getTodos();
    }

    @Get(":id")
    async findOne(@Param("id", ParseFloatPipe) id: number): Promise<Todo | null> {
        return this.todoService.getTodoById(id);
    }

    @Post()
    async create(
        @Body("title") title: string,
        @Body("description") description: string,
    ): Promise<Todo> {
        return this.todoService.create(title, description);
    }

    @Put(":id")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: Partial<Todo>,
    ): Promise<Todo> {
        return this.todoService.update(id, data);
    }

    @Delete(":id")
    async remove(@Param("id", ParseIntPipe) id: number): Promise<Todo> {
        return this.todoService.delete(id);
    }
}
