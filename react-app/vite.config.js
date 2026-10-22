import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import https from 'node:https'
import http from 'node:http'
import { URL } from 'node:url'

function apiProxyPlugin() {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api-fetch', (req, res) => {
        const reqUrl = new URL(req.url, 'http://localhost')
        const targetUrl = reqUrl.searchParams.get('url')
        if (!targetUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing url parameter' }))
          return
        }

        try {
          const parsed = new URL(targetUrl)
          const client = parsed.protocol === 'https:' ? https : http
          const clientReq = client.get(targetUrl, (clientRes) => {
            res.statusCode = clientRes.statusCode || 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
            clientRes.pipe(res)
          })
          clientReq.on('error', (err) => {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          })
        } catch (e) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid URL: ' + e.message }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile(), apiProxyPlugin()],
})

