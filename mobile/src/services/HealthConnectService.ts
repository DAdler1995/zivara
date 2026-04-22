import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect'

export async function initializeHealthConnect(): Promise<boolean> {
  try {
    const result = await initialize()
    return result
  } catch {
    return false
  }
}

export async function requestHealthPermissions(): Promise<boolean> {
  try {
    const permissions = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Weight' },
    ])
    return permissions.length > 0
  } catch {
    return false
  }
}

export async function getTodaySteps(): Promise<number> {
  try {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      },
    })

    return result.records.reduce((sum: number, record: any) => sum + record.count, 0)
  } catch {
    return 0
  }
}

export async function getLatestWeight(): Promise<number | null> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await readRecords('Weight', {
      timeRangeFilter: {
        operator: 'between',
        startTime: thirtyDaysAgo.toISOString(),
        endTime: new Date().toISOString(),
      },
    })

    if (result.records.length === 0) return null

    const latest = result.records[result.records.length - 1]
    return latest.weight.inKilograms * 2.20462
  } catch {
    return null
  }
}