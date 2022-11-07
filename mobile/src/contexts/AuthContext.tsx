import { createContext, ReactNode, useEffect, useState } from "react";
import * as AuthSession from 'expo-auth-session'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { api } from "../services/api";
import { isPropertyAccessChain } from "typescript";

WebBrowser.maybeCompleteAuthSession()

interface UserProps {
    name: string
    avatarUrl: string
}
export interface AuthContextDataProps {
    user: UserProps
    isUserLoading: boolean
    signIn: () => Promise<void>
}
// armazena o contexto
export const AuthContext = createContext({} as AuthContextDataProps)

interface AuthProviderProps {
    children: ReactNode
}
// compartilha esse contexto com a aplicação
export function AuthContextProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<UserProps>({} as UserProps)

    const [isUserLoading, setIsUserLoading] = useState<boolean>(false)

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.CLIENT_ID,
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
        scopes: ['profile', 'email']
    })

    console.log(AuthSession.makeRedirectUri({ useProxy: false }))
    async function signIn() {

        try {
            setIsUserLoading(true)
            await promptAsync()
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setIsUserLoading(false)
        }
    }

    async function signInWithGoogle(access_token: string) {
        try {
            setIsUserLoading(true)
            const tokenResponse = await api.post('/users', { access_token: access_token })
            // A partir de agora, todas as req terão essa cabeçalho com o JWT
            api.defaults.headers.common['Authorization'] = 'Bearer ' + tokenResponse.data.token


            const userInfoResponse = await api.get('/me')
            setUser(userInfoResponse.data.user)
            console.log(userInfoResponse.data)

        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setIsUserLoading(false)
        }
    }

    useEffect(() => {
        if (response?.type === 'success' && response.authentication.accessToken) {
            signInWithGoogle(response.authentication.accessToken)
        }
    }, [response])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}