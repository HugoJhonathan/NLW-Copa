import { Heading, Text, useToast, VStack } from "native-base";
import Logo from '../assets/logo.svg';
import { Header } from "../components/Header";
import { Input } from '../components/Input';

import React, { useState } from "react";
import { Button } from "../components/Button";
import { api } from "../services/api";

export default function New() {

    const [titlePool, setTitlePool] = useState<string>('')
    const toast = useToast()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handlePoolCreate() {

        if (!titlePool.trim()) {
            return toast.show({
                title: 'Informe um nome para o seu bolão',
                placement: 'top',
                bgColor: 'red.500',
            })
        }
        setIsLoading(true)

        try {
            await api.post('/pools', { title: titlePool })
            toast.show({
                title: 'Bolão criado com sucesso!',
                placement: 'top',
                bgColor: 'green.500',
            })
            setTitlePool('')


        } catch (error) {
            console.log(error)
            toast.show({
                title: 'Não foi possível criar o bolão!',
                placement: 'top',
                bgColor: 'red.500',
            })
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <VStack flex={1} bgColor='gray.900'>

            <Header title="Criar novo bolão" />

            <VStack mt={8} mx={5} >
                <Logo />

                <Heading fontFamily='heading' color='white' fontSize='xl' my={8} textAlign='center'>
                    Crie seu próprio bolão da copa {'\n'} e  compartilhe entre amigos!
                </Heading>

                <Input
                    mb='2'
                    placeholder="Qual nome do seu bolão"
                    onChangeText={e => setTitlePool(e)}
                    value={titlePool}
                />
                <Button
                    title="CRIAR MEU BOLÃO"
                    onPress={handlePoolCreate}
                    isLoading={isLoading}
                />
                <Text color='gray.200' fontSize='sm' textAlign='center' px='10' mt='4'>
                    Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas.
                </Text>
            </VStack>
        </VStack>
    )
}