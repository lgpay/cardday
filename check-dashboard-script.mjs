import { renderDashboard } from './src/templates/dashboard.js'

const html = renderDashboard()
const m = html.match(/<script>([\s\S]*)<\/script>/)
if (!m) throw new Error('script not found')
const script = m[1]
console.log('script length', script.length)
try {
  new Function(script)
  console.log('SCRIPT_OK')
} catch (e) {
  console.error('SCRIPT_ERR', e.message)
  const lines = script.split('\n')
  const match = String(e.stack || '').match(/<anonymous>:(\d+):(\d+)/)
  const line = match ? Number(match[1]) : null
  if (line) {
    console.log('around line', line)
    for (let i = Math.max(1, line - 3); i <= Math.min(lines.length, line + 3); i++) {
      console.log(String(i).padStart(4), lines[i - 1])
    }
  }
  process.exit(1)
}
