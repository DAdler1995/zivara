const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0]

    // Set cleartext traffic
    application.$['android:usesCleartextTraffic'] = 'true'

    // Ensure the Health Connect permissions rationale intent filter
    // is on an exported activity so Health Connect can discover the app
    const activities = application.activity || []
    const mainActivity = activities.find(
      (a) => a.$['android:name'] === '.MainActivity'
    )

    if (mainActivity) {
      const intentFilters = mainActivity['intent-filter'] || []
      const hasRationale = intentFilters.some((filter) => {
        const actions = filter.action || []
        return actions.some(
          (a) => a.$['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
        )
      })

      if (!hasRationale) {
        intentFilters.push({
          action: [
            {
              $: {
                'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
              },
            },
          ],
        })
        mainActivity['intent-filter'] = intentFilters
      }

      // Make sure MainActivity is exported
      mainActivity.$['android:exported'] = 'true'
    }

    return config
  })
}