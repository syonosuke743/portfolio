


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://back:3001";

export interface AuthResponse{
    user: {
        id: string,
        email: string,
        provider: string | null,
        createdAt: string;
    };
    accessToken: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData{
    email: string;
    password: string;
}

export const authApi = {
    async login(data: LoginData): Promise<AuthResponse>{
        const response = await fetch(`${backendUrl}/auth/login`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok){
            const error = await response.json();
            throw new Error(error.message || "Loginに失敗しました");
        }

        return response.json();
    },

    async register(data: RegisterData): Promise<AuthResponse>{
        const response = await fetch(`${backendUrl}/auth/register`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok){
            const error = await response.json();
            throw new Error(error.message || "アカウント登録に失敗しました")
        }

        return response.json();
    },

    async getProfile(token: string){
        const response = await fetch(`${backendUrl}/auth/profile`,{
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok){
            const error = await response.json();
            throw new Error(error.message || "Profileの取得に失敗しました");
        }

        return response.json();
    }
}
