export default {
  default: {
    import: [
      'step-definitions/console-steps.js',
      'hooks/hooks.js'
    ],
    format: ['progress'],
    formatOptions: { 
      snippetInterface: 'async-await' 
    },
    publishQuiet: true,
    paths: ['features/**/*.feature']
  }
};