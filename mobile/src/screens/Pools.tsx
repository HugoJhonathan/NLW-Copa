import { Octicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Icon, useToast, VStack } from "native-base";
import React, { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { Button } from "../components/Button";
import { EmptyPoolList } from "../components/EmptyPoolList";
import { Header } from "../components/Header";
import { PoolCard, PoolCardPros } from '../components/PoolCard';
import { api } from "../services/api";

export default function Pools() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [pools, setPools] = useState<PoolCardPros[]>([])
    const toast = useToast()

    async function fetchPools() {
        setRefreshing(true);
        setIsLoading(true)
        try {
            const response = await api.get('/pools')
            console.log(response.data)
            setPools(response.data.pools)

        } catch (error) {
            console.log(error)
            toast.show({
                title: 'Não foi possível carregar os bolões',
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }

    }
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPools()
    }


    useEffect(() => {
        fetchPools()
    }, [])

    return (


        <VStack flex='1' bgColor='gray.900' >
            <Header title="Meus bolões" />
            <VStack mt='6' mx='5' borderBottomWidth={1} borderBottomColor='gray.600' pb='4' mb='4'>
                <Button
                    title="BUSCAR BOLÃO POR CÓDIGO"
                    leftIcon={<Icon as={Octicons} name='search' color='black' size='md' />}
                    onPress={() => navigation.navigate('findPool')}
                />
            </VStack>


            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPools} />}
                data={pools}
                ListEmptyComponent={() => !refreshing ? <EmptyPoolList /> : null}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PoolCard onPress={() => navigation.navigate('details', { id: item.id })} data={item} />}
                showsVerticalScrollIndicator={false}
                _contentContainerStyle={{ pb: 10 }}
                px={5}
                mb={20}

            >

            </FlatList>



        </VStack>

    )
}