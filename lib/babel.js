module.exports = () => ({
  presets: [
    [ require.resolve('@babel/preset-env'), {
      modules: false,
      targets: {
        node: 'current'
      }
    }],
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-proposal-object-rest-spread')
  ]
});
