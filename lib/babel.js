module.exports = () => ({
  presets: [
    [ require.resolve('@babel/preset-env'), {
      loose: true,
      modules: 'commonjs',
      targets: {
        node: 'current'
      }
    }],
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-stage-3')
  ]
});
