# Site — Mercado Campos Salles

Site institucional estático (HTML + CSS + JS puro), sem dependências ou build.

## Estrutura
- `index.html` — página única com todas as seções (empresa, açougue, setores, padaria, workshops, compras online, ofertas, contato)
- `css/style.css` — design system (cores da marca, tipografia Fraunces + Manrope), layout responsivo e animações
- `js/main.js` — preloader, header inteligente, menu mobile, reveal por scroll, contadores, parallax, abas de cortes, status aberto/fechado, formulários
- `assets/` — logo, fotos da loja e fotografia de apoio (Unsplash, licença livre)

## Como visualizar
Abra `index.html` no navegador ou rode um servidor local:

```bash
cd mercado-salles && python3 -m http.server 8080
```

## Como publicar
Envie a pasta inteira para qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages, Hostinger, cPanel). Não há backend.

## Pontos a confirmar com o cliente
- Links do app e-Salles na Google Play / App Store (hoje apontam para a busca nas lojas)
- Formulário de contato abre o WhatsApp com a mensagem preenchida; newsletter abre o e-mail. Para captar leads automaticamente, integrar um serviço (Formspree, Brevo, RD Station)
- Fotos: as de ambiente (fachada, hortifruti, cortes) são do próprio mercado; as demais são de banco de imagens e podem ser trocadas por fotos reais
