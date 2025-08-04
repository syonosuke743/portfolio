import { IsEmail,IsString,MinLength,IsOptional } from "class-validator";

export class LoginDto{
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class GoogleAuthDto{
    @IsEmail()
    email :string;

    @IsString()
    @IsOptional()
    provider?: string;
}

