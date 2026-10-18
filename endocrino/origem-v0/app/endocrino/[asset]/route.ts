import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const assets: Record<string, string> = {
  'cortisol.html': 'text/html; charset=utf-8',
  'cortisol.css': 'text/css; charset=utf-8',
  'cortisol.js': 'text/javascript; charset=utf-8',
  'cortisol-model.js': 'text/javascript; charset=utf-8',
  'cortisol-content.js': 'text/javascript; charset=utf-8',
}

// Production publishes endocrino directly; the Next.js preview reuses the same files.
export async function GET(request: Request, context: { params: Promise<{ asset: string }> }) {
  const { asset } = await context.params
  if (asset === 'index.html') return Response.redirect(new URL('/', request.url))
  if (!Object.hasOwn(assets, asset)) return new Response('Não encontrado', { status: 404 })
  try {
    const content = await readFile(path.resolve(process.cwd(), '..', asset), 'utf8')
    return new Response(content, { headers: { 'Content-Type': assets[asset], 'Cache-Control': 'no-store' } })
  } catch {
    return new Response('Arquivo indisponível', { status: 404 })
  }
}
