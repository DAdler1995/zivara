const { withMainActivity } = require('@expo/config-plugins')

module.exports = function withHealthConnectActivity(config) {
  return withMainActivity(config, (config) => {
    const contents = config.modResults.contents

    // Add import if not already present
    if (!contents.includes('import dev.matinzd.healthconnect.HealthConnectManager')) {
      config.modResults.contents = contents.replace(
        'import android.os.Bundle',
        'import android.os.Bundle\nimport dev.matinzd.healthconnect.HealthConnectManager'
      )
    }

    // Add permission launcher registration in onCreate if not already present
    if (!contents.includes('HealthConnectManager.onCreateActivity')) {
      config.modResults.contents = config.modResults.contents.replace(
        'super.onCreate(null)',
        'super.onCreate(null)\n    HealthConnectManager.onCreateActivity(this)'
      )
    }

    return config
  })
}