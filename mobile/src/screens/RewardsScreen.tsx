import { View, Text } from 'react-native'
import { colors } from '../theme'

export default function RewardsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.gold, fontSize: 24 }}>Rewards</Text>
    </View>
  )
}