# Imagem do tutor com IA para o Cloud Run. Contém só a API e os dados do tutor.
FROM node:24-slim
WORKDIR /app
COPY server/tutor.cjs server/catalog.cjs server/
COPY tutor-ef-data.js tutor-fisio-data.js ./
ENV NODE_ENV=production HOST=0.0.0.0 TUTOR_SERVE_SITE=0
USER node
CMD ["node", "server/tutor.cjs"]
