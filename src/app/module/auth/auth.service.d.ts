import type { IForgotPasswordPayload, IGoogleUser, ILoginUserPayload, IRegisterPayload, IRequestUser, IResetPasswordPayload, IVerifyEmailPayload } from "./auth.interface.js";
import { AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums.js";
declare const register: (payload: IRegisterPayload) => Promise<void>;
declare const verifyEmail: (payload: IVerifyEmailPayload) => Promise<{
    user: {
        id: string;
        name: string;
        email: string;
        googleId: string | null;
        authProvider: AuthProvider;
        role: Role;
        status: UserStatus;
        emailVerified: boolean;
        imageUrl: string | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
    accessToken: string;
    refreshToken: string;
}>;
declare const loginUser: (payload: ILoginUserPayload) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare const getMe: (user: IRequestUser) => Promise<{
    id: string;
    name: string;
    email: string;
    googleId: string | null;
    authProvider: AuthProvider;
    role: Role;
    status: UserStatus;
    emailVerified: boolean;
    imageUrl: string | null;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const refreshToken: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare const forgotPassword: (payload: IForgotPasswordPayload) => Promise<void>;
declare const resetPassword: (payload: IResetPasswordPayload) => Promise<void>;
declare const googleLogin: (payload: IGoogleUser) => Promise<{
    id: string;
    name: string;
    email: string;
    password: string | null;
    googleId: string | null;
    authProvider: AuthProvider;
    role: Role;
    status: UserStatus;
    emailVerified: boolean;
    imageUrl: string | null;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const AuthService: {
    register: typeof register;
    verifyEmail: typeof verifyEmail;
    loginUser: typeof loginUser;
    getMe: typeof getMe;
    refreshToken: typeof refreshToken;
    googleLogin: typeof googleLogin;
    forgotPassword: typeof forgotPassword;
    resetPassword: typeof resetPassword;
};
export {};
//# sourceMappingURL=auth.service.d.ts.map