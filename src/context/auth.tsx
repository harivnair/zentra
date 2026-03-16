"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setSecureItem, getSecureItem, removeSecureItem } from "@/lib/secure-storage";
import { API_ENDPOINTS } from "@/lib/endpoint";

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    uid: string;
    phone: string | null;
    role: string | null;
}

export interface AuthState {
    token: string | null;
    tokenType: string;
    expiresIn: number | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (userID: string, password: string) => Promise<void>;
    logout: () => void;
    getAuthHeader: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "zentra_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        tokenType: "Bearer",
        expiresIn: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load auth state from secure storage on mount
    useEffect(() => {
        const loadAuthState = () => {
            try {
                const parsed = getSecureItem<{
                    token: string;
                    tokenType: string;
                    expiresIn: number;
                    user: User;
                    expiresAt: number;
                }>(AUTH_STORAGE_KEY);

                if (parsed) {
                    // Check if token is expired
                    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
                        setAuthState({
                            token: parsed.token,
                            tokenType: parsed.tokenType || "Bearer",
                            expiresIn: parsed.expiresIn,
                            user: parsed.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        // Token expired, clear storage
                        removeSecureItem(AUTH_STORAGE_KEY);
                        setAuthState(prev => ({ ...prev, isLoading: false }));
                    }
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error("Failed to load auth state:", error);
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        };
        loadAuthState();
    }, []);

    const login = async (userID: string, password: string) => {
        try {
            // Call Next.js API route instead of backend directly to avoid CORS
            const response = await fetch(API_ENDPOINTS.auth.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userID,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Login failed. Please check your credentials.");
            }

            const data = await response.json();

            const expiresAt = Date.now() + (data.expiresIn || 86400000); // Default 24 hours

            // Store in state
            setAuthState({
                token: data.token,
                tokenType: data.tokenType || "Bearer",
                expiresIn: data.expiresIn,
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
            });

            // Persist to secure storage (encrypted)
            setSecureItem(AUTH_STORAGE_KEY, {
                token: data.token,
                tokenType: data.tokenType || "Bearer",
                expiresIn: data.expiresIn,
                user: data.user,
                expiresAt,
            });
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        setAuthState({
            token: null,
            tokenType: "Bearer",
            expiresIn: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
        removeSecureItem(AUTH_STORAGE_KEY);
    };

    const getAuthHeader = (): string | null => {
        if (authState.token) {
            return `${authState.tokenType} ${authState.token}`;
        }
        return null;
    };

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        getAuthHeader,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
