export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export const cookieOpts = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
};

export const refreshMaxAge = 60 * 60 * 24 * 7; 
