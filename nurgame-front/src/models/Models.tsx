export const Http = {
    baseURL: "http://localhost:4001/api",
    refreshToken: "/auth/refresh",
    register: "/auth/signup",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password/:token",
    changePassword: "/auth/change-password",
    logout: "/auth/logout",
};

export const Links = {
    login: "/login",
    register: "/register",
    profile: "/profile",
    forgotPassword: "/forgot-password",
    home: "/",
    courses: "/courses",
    lesson: "/lesson",

    test: "/testerArea",
    testLogin: "/testLogin",
};

export interface IUser {
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    roleName: string,
    avatarUrl: string,
}

export interface IChangePassword {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
}

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IDecodedToken {
    id: string;
    email: string;
    role: string;
    exp: number; // Token expiration timestamp
}

