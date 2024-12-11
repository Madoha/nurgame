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
    lesson: "/course/3/module/:moduleId/lesson/:lessonId",
    test: "/course/3/module/:moduleId/tests",
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

export interface Lessons {
    id: number;
    title: string;
    content: string;
    type: string;
    videoUrl?: string;
    courseModuleId: number;
    icon: string;
    locked: boolean;
    completed: boolean;
}

export interface Modules {
    id: number;
    title: string;
    description: string;
    courseId: number;
    bgColor: string;
    lessons: Lessons[];
}

export interface Course {
    id: number;
    title: string;
    description: string;
    modules: Modules[];
}

export interface Answers {
    id: number;
    text: string;
    isCorrect: boolean;
    questionId: number;
}

export interface Questions {
    id: number;
    text: string;
    answers: Answers[];
}

export interface Test {
    questions: Questions[];
}

export interface Score {
    testScore: number;
}