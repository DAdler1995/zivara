import { View, Text } from 'react-native'
import { colors } from '../theme'

export default function CharacterScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.gold, fontSize: 24 }}>Character</Text>
    </View>
  )
}