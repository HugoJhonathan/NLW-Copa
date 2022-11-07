import { Heading, useToast, VStack } from "native-base";
import { Header } from "../components/Header";
import { Input } from '../components/Input';

import React, { useState } from "react";
import { Button } from "../components/Button";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export default function Find() {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [code, setCode] = useState<string>('')
    const toast = useToast()
    const { navigate } = useNavigation()

    async function handleJoinPool() {

        try {
            setIsLoading(true)
            if (!code.trim()) {
                return toast.show({
                    title: 'Informe o código',
                    placement: 'top',
                    bgColor: 'red.500',
                })
            }

            await api.post('/pools/join', { code })
            navigate('pools')
            setCode('')
            return toast.show({
                title: 'Você entrou no bolão com sucesso!',
                placement: 'top',
                bgColor: 'green.500',
            })


        } catch (error) {
            setIsLoading(false)
            if (error.response?.data?.message === 'Pool not found.') {
                return toast.show({
                    title: 'Bolão não encontrado',
                    placement: 'top',
                    bgColor: 'red.500',
                })
            }
            if (error.response?.data?.message === 'You already joined this pool.') {
                return toast.show({
                    title: 'Você já está nesse bolão',
                    placement: 'top',
                    bgColor: 'red.500',
                })
            }

            toast.show({
                title: 'Não foi possível encontrar o bolão!',
                placement: 'top',
                bgColor: 'red.500',
            })
            console.log(error)
        } finally {

        }
    }

    return (
        <VStack flex={1} bgColor='gray.900'>
            <Header title="Buscar por código" showBackButton navigateBackScreen="pools" />

            <VStack mt={8} mx={5} alignItems='center'>
                {/* <Logo /> */}

                <Heading fontFamily='heading' color='white' fontSize='xl' mb='8' textAlign='center'>
                    Encontrar um bolão através de {'\n'} seu código único
                </Heading>

                <Input
                    mb='2'
                    placeholder="Qual o código do bolão?"
                    onChangeText={setCode}
                    textTransform='uppercase'
                    value={code}
                    maxLength={6}
                    autoCapitalize='characters'
                />
                <Button
                    title="BUSCAR POR CÓDIGO"
                    isLoading={isLoading}
                    onPress={handleJoinPool}
                />
            </VStack>
        </VStack>
    )
}