// export const privateKey = fs.readFileSync('privateKey.key');

export const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');

export const USER_SESSION_TOKEN = "USER_SESSION_TOKEN";
export const USER_VERIFY_TOKEN = "USER_VERIFY_TOKEN";

export const SELLER_SESSION_TOKEN = "SELLER_SESSION_TOKEN";
export const SELLER_VERIFY_TOKEN = "SELLER_VERIFY_TOKEN";

export interface Signup {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    password2: string,
    city: string,
    province: string,
};

export const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

export interface User {
    id: number;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
    location: User_Location
};

interface User_Location {
    city: string;
    province: string;
}

export interface Seller {
    id: number;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
};

export interface JWTPayload {
    userId: number,
    sellerId: number,
    type: string
};

export interface Store {
    id: number;
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

export interface Product {
    name: string;
    description: string;
    priceInCad: number;
    isNew: boolean;
    featuredPhotoURL: string;
    isMeetUpOnly: boolean;
    quantity: number;
    category: string;
    tags: string[];
    store: Store;
};

export interface Create_Order {
    productId: number;
    preferredMeetingPlace: string;
    notes: string | null;
    preferredMeetupDate: Date;
    contactNumber: string;
    quantity: number;
};

export enum Order_Status {
    PENDING = "Pending",
    COMPLETE = "Complete",
    CANCELLED = "Cancelled",
    NO_SHOW = "No Show"
};