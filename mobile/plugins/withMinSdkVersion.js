const { withGradleProperties } = require('@expo/config-plugins')

module.exports = function withMinSdkVersion(config, minSdkVersion = 26) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => item.key !== 'android.minSdkVersion'
    )
    config.modResults.push({
      type: 'property',
      key: 'android.minSdkVersion',
      value: String(minSdkVersion),
    })
    return config
  })
}