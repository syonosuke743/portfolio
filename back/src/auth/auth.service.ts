import { Injectable,UnauthorizedException,ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto,RegisterDto,GoogleAuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';


export interface JwtPayload{
    sub: string;
    email: string;
    provider: string | null;
}

export interface AuthResponse{

   user: {
    id: string;
    email: string;
    provider: string | null;
    createdAt: Date;
};
    accessToken: string;
    refreshToken?: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ){}

    //password認証でログイン
    async login(LoginDto: LoginDto): Promise<AuthResponse>{
        const {email, password} = LoginDto;

        //userを検索
        const user = await this.prisma.user.findUnique({
            where: {email},
        });
        //userが存在しない、またはパスワードハッシュがない場合
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException("Invalid credentials");
        }

        //passwordの検証
        const isValidPassword = await bcrypt.compare(password,user.passwordHash);
        if (!isValidPassword){
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokenResponse(user);
    }

    //password認証での新規登録
    async register(ResisterDto: RegisterDto): Promise<AuthResponse>{
        const {email,password} = ResisterDto;

        //登録済みのuserをチェック
        const existingUser = await this.prisma.user.findUnique({
            where: {email},
        });

        if (existingUser){
            throw new ConflictException('User already exist');
        }

        //パスワードのハッシュ化
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password,saltRounds);

        //user作成
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                provider: null,
            },
        });

        return this.generateTokenResponse(user);
    }

    //google認証（ユーザーが存在すればログイン、存在しなければ作成）
    async googleAuth(GoogleAuthDto: GoogleAuthDto): Promise<AuthResponse>{
        const {email, provider} = GoogleAuthDto;

        let user = await this.prisma.user.findUnique({
            where: {email},
        });

        if(user){
            //既存ユーザーの場合、作成
            if (!user.provider && provider){
                user = await this.prisma.user.update({
                    where:{id: user.id},
                    data: {provider},
                });
            }
        }else{
            //新規ユーザーの場合、作成
            user = await this.prisma.user.create({
                data: {
                    email,
                    passwordHash: null,
                    provider,
                },
            });
        }
        return this.generateTokenResponse(user);
    }


    //JWTトークン生成
    private async generateTokenResponse(user: any): Promise<AuthResponse>{
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            provider: user.provider,
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload,{
            expiresIn: '60d',
        })

        return{
            user:{
                id: user.id,
                email: user.email,
                provider: user.provider,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };
    }

    //JWT payloadからuser取得
    async validateUser(payload: JwtPayload){
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub},
        });

        if (!user){
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
