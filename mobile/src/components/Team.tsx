import { HStack } from 'native-base';
import CountryFlag from "react-native-country-flag";

import { Input } from './Input';

interface Props {
  code: string;
  position: 'left' | 'right';
  value: number | undefined
  onChangeText: (value: string) => void;
}

export function Team({ code, position, onChangeText, value }: Props) {
  let optionalProps = {};
  if (value) {
    optionalProps['value'] = String(value)
    optionalProps['isDisabled'] = true
  }


  return (
    <HStack alignItems="center">
      {position === 'left' && <CountryFlag isoCode={code} size={25} style={{ marginRight: 12 }} />}

      <Input
        width={20}
        h={20}
        textAlign="center"
        fontSize={40}
        fontWeight='bold'
        keyboardType="numeric"
        onChangeText={onChangeText}
        _disabled={{ opacity: 1, borderColor: 'transparent', fontWeight: 'bold' }}

        {...optionalProps}

      />

      {position === 'right' && <CountryFlag isoCode={code} size={25} style={{ marginLeft: 12 }} />}
    </HStack>
  );
}