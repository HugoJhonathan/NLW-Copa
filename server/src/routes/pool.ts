import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { prisma } from "../lib/prisma"
import { z } from 'zod'
import { authenticate } from "../plugins/authenticate"

export async function poolRoutes(fastify: FastifyInstance) {
    fastify.get("/pools/count", async () => {
        const count = await prisma.pool.count()
        return { count }
    })

    // CRIAR UM BOLÃO
    fastify.post("/pools", async (request, reply) => {
        const createPoolBody = z.object({
            title: z.string(),
        })
        const { title } = createPoolBody.parse(request.body)

        const generate = new ShortUniqueId({ length: 6 })
        const code = String(generate()).toUpperCase()

        let created;
        try {
            await request.jwtVerify()
            //tem um usuario autenticado

            created = await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,
                    participants: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })
        } catch {
            // nao tem usuario autenticado
            created = await prisma.pool.create({
                data: {
                    title, code
                }
            })

        }

        return reply.status(201).send(created)
    })

    // ENTRAR EM UM BOLÃO
    fastify.post('/pools/join', { onRequest: [authenticate] }, async (request, reply) => {

        const joinPoolBody = z.object({
            code: z.string()
        })
        const { code } = joinPoolBody.parse(request.body)

        // busca Bolão a partir de um código e que o usuario atual faz parte dele
        const pool = await prisma.pool.findUnique({
            where: {
                code,
            },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        if (!pool) {
            return reply.status(400).send({
                message: 'Pool not found.'
            })
        }

        if (pool.participants.length > 0) {
            return reply.status(400).send({
                message: 'You already joined this pool.'
            })
        }

        // Se o bolão não tiver dono, adiciona agora
        if (!pool.ownerId) {
            await prisma.pool.update({
                where: {
                    id: pool.id
                },
                data: {
                    ownerId: request.user.sub
                }
            })
        }

        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: request.user.sub
            }
        })

        return reply.status(201).send()
    })

    fastify.get('/pools', { onRequest: [authenticate] }, async (request, reply) => {
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    some: { // some = pelomenos um participante com esse ID
                        userId: request.user.sub
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                }
            }
        })
        return { pools }
    })

    // Busca os dados de um Bolão específico
    fastify.get('/pools/:id', { onRequest: [authenticate] }, async (request, reply) => {
        const getPoolParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolParams.parse(request.params)

        const pool = await prisma.pool.findUnique({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                }
            }
        })
        return { pool }
    })


}