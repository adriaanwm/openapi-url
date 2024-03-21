import dts from 'bun-plugin-dts'
import 'index.ts'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  plugins: [dts()]
})

console.log('built', Date.now())

await Bun.spawn(['yalc', 'push'])

console.log('Yalc push completed')
