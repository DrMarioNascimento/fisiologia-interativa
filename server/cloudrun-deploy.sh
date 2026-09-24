#!/usr/bin/env bash
# Publica a API do tutor no Cloud Run, num projeto próprio (separado de outros serviços).
# Executar no Cloud Shell: bash cloudrun-deploy.sh
# Para atualizar depois: PROJECT=<id-do-projeto> bash cloudrun-deploy.sh
# Nunca coloque a chave do Gemini neste arquivo; ela é pedida com entrada oculta.
set -euo pipefail

REGION=${REGION:-us-central1}
SERVICE=tutor-fisiologia
REPO_URL=https://github.com/DrMarioNascimento/fisiologia-interativa.git
PROJECT=${PROJECT:-tutor-fisiologia-$(date +%y%m%d%H%M)}

echo "== Projeto: $PROJECT"
if ! gcloud projects describe "$PROJECT" >/dev/null 2>&1; then
  gcloud projects create "$PROJECT" --name="Tutor Fisiologia"
fi
gcloud config set project "$PROJECT" >/dev/null

if [ "$(gcloud billing projects describe "$PROJECT" --format='value(billingEnabled)')" != "True" ]; then
  echo "== O Cloud Run exige uma conta de faturamento vinculada (o uso do tutor fica na cota gratuita)."
  gcloud billing accounts list
  read -rp "Cole o ID da conta de faturamento (XXXXXX-XXXXXX-XXXXXX): " BILLING
  gcloud billing projects link "$PROJECT" --billing-account="$BILLING"
fi

echo "== Ativando serviços"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com

if ! gcloud secrets describe gemini-api-key >/dev/null 2>&1; then
  read -rsp "Cole a chave do Gemini (não aparece na tela) e tecle Enter: " KEY; echo
  test -n "$KEY"
  printf %s "$KEY" | gcloud secrets create gemini-api-key --data-file=- --replication-policy=automatic
  unset KEY
fi

NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
SA="${NUMBER}-compute@developer.gserviceaccount.com"
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA" --role=roles/run.builder --condition=None >/dev/null

echo "== Baixando o código"
WORK=$(mktemp -d)
git clone --depth=1 --branch=main "$REPO_URL" "$WORK/repo"

echo "== Publicando no Cloud Run (leva alguns minutos)"
gcloud run deploy "$SERVICE" --source "$WORK/repo" --region "$REGION" \
  --allow-unauthenticated --max-instances 1 --memory 256Mi --cpu 1 --timeout 60 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars "^|^TUTOR_ALLOWED_ORIGINS=https://drmarionascimento.github.io|TUTOR_DAILY_LIMIT=100|TUTOR_SERVE_SITE=0|HOST=0.0.0.0" \
  --quiet
rm -rf "$WORK"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
echo "== Teste de status"
curl -fsS "$URL/api/tutor/status"; echo
echo
echo "PRONTO. Envie ao Claude este endereço:  $URL/api/tutor"
echo "Guarde o ID do projeto para atualizações:  $PROJECT"
