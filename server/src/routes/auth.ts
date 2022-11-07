import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"


export async function authRoutes(fastify: FastifyInstance) {
    // antes de executar a função, é executada a função de authenticate
    fastify.get('/me', { onRequest: [authenticate] }, async (req) => {
        // devolve dados do usuario logado atraves do token JWT
        return { user: req.user }
    })

    fastify.post('/users', async (req) => {

        const createUserBody = z.object({
            access_token: z.string(),
        })

        const { access_token } = createUserBody.parse(req.body)

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const userData = await userResponse.json()
        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url(),
        })
        const userInfo = userInfoSchema.parse(userData)
        console.log(userInfo)

        // Pesquisa um usuario no BD com esse id do Google
        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id,
            }
        })
        // Caso nao encontre nenhum user, criamos um com essas informações obtidas do Google
        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture,
                }
            })
        }


        const token = fastify.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl
        }, {
            sub: user.id,
            expiresIn: '7 days'
        })


        return { token }
    })
}