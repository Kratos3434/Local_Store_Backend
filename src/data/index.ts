// export const privateKey = fs.readFileSync('privateKey.key');

export const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');

export const USER_SESSION_TOKEN = "USER_SESSION_TOKEN";
export const USER_VERIFY_TOKEN = "USER_VERIFY_TOKEN";

export interface Signup {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    password2: string
};

export const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

export interface User {
    id: number;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
};

export interface JWTPayload {
    userId: number,
    type: string
};

export interface Store {
    name: string;
    description: string;
    address: Store_Address;
    category: string;
};

export interface Store_Address {
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
};