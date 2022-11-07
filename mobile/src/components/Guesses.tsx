import { FlatList, useToast } from 'native-base';
import { useEffect, useState } from 'react';
import { Game } from '../components/Game';
import { api } from '../services/api';
import { EmptyMyPoolList } from './EmptyMyPoolList';
import { GameProps } from './Game';
import { Loading } from './Loading';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [games, setGames] = useState<GameProps[]>([] as GameProps[])
  const [firstTeamPoints, setFirstTeamPoints] = useState<string>('')
  const [secondTeamPoints, setSecondTeamPoints] = useState<string>('')
  const toast = useToast()

  async function fetchGames() {
    setIsLoading(true)
    try {
      const response = await api.get('/pools/' + poolId + '/games')
      console.log(response.data.games)
      setGames(response.data.games)

    } catch (error) {
      console.log(error)
      toast.show({
        title: 'Não foi possível carregar os jogos deste bolão!',
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGuessConfirm(gameId: string) {

    try {
      setIsLoading(true)
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite!',
          placement: 'top',
          bgColor: 'red.500',

        })
      }

      api.post(`/pools/${poolId}/games/${gameId}/guesses2`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints)
      }).then(res => {
        toast.show({
          title: 'Palpite realizado com sucesso!',
          placement: 'top',
          bgColor: 'green.500'
        })
        fetchGames()
      })
        .catch(error => {
          console.log(error.response?.data.message)
          toast.show({
            title: error.response?.data.message,
            placement: 'top',
            bgColor: 'red.500'
          })
        })


    } catch (error) {
      toast.show({
        title: 'Não foi possível enviar o palpite',
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [poolId])

  if (isLoading) {
    return <Loading />
  }

  return (
    <FlatList
      data={games}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
    />
  );
}
