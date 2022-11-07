import { useNavigation, useRoute } from "@react-navigation/native";
import { HStack, useToast, VStack } from "native-base";
import { useEffect, useState } from "react";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Header } from "../components/Header";
import { Loading } from '../components/Loading'
import { Option } from "../components/Option";
import { PoolCardPros } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { api } from "../services/api";
import { Share } from 'react-native'
import { Guesses } from "../components/Guesses";

interface RouteParams {
    id: string
}

export default function Details() {

    const [poolDetails, setPoolDetails] = useState<PoolCardPros>({} as PoolCardPros);
    const [optionSelected, setOptionSelected] = useState<'Seus palpites' | 'Ranking do grupo'>('Seus palpites')

    const route = useRoute()
    const { id } = route.params as RouteParams

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const toast = useToast()

    async function fetchPoolDetails() {
        try {
            setIsLoading(true)
            const { data } = await api.get('/pools/' + id)
            console.log(data.pool)
            setPoolDetails(data.pool)

        } catch (error) {
            console.log(error)
            toast.show({
                title: 'Não foi possível carregar os detalhes do bolão!',
                placement: 'top',
                bgColor: 'red.500'
            })

        } finally {
            setIsLoading(false)
        }
    }

    async function handleCodeShare() {
        await Share.share({
            message: poolDetails.code
        })
    }

    useEffect(() => {
        fetchPoolDetails()
    }, [id])

    if (isLoading) {
        return <Loading />
    }

    return (
        <VStack flex={1} bgColor='gray.900'>
            <Header
                title={poolDetails.title}
                showBackButton
                showShareButton
                onShare={handleCodeShare}
                navigateBackScreen='pools'
            />

            {
                poolDetails?._count?.participants > 0 ?
                    <VStack px={5} flex={1}>
                        <PoolHeader
                            data={poolDetails}
                        />
                        <HStack bgColor='gray.800' p={1} rounded='sm' mb='5'>
                            <Option
                                title="Seus palpites"
                                isSelected={optionSelected === 'Seus palpites'}
                                onPress={() => setOptionSelected('Seus palpites')}
                            />
                            <Option
                                title="Ranking do grupo"
                                isSelected={optionSelected === 'Ranking do grupo'}
                                onPress={() => setOptionSelected('Ranking do grupo')}
                            />
                        </HStack>
                        <Guesses
                            poolId={poolDetails.id}
                            code={poolDetails.code}
                        />
                    </VStack>
                    :
                    <EmptyMyPoolList code={poolDetails.code} />
            }

        </VStack>
    )
}