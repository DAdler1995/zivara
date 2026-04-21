import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { colors } from '../theme'
import DashboardScreen from '../screens/DashboardScreen'
import CharacterScreen from '../screens/CharacterScreen'
import RewardsScreen from '../screens/RewardsScreen'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Tab = createBottomTabNavigator()

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '⚔',
    Character: '👤',
    Rewards: '💰',
  }
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {icons[label]}
    </Text>
  )
}

export default function MainTabs() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Character" component={CharacterScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
    </Tab.Navigator>
  )
}