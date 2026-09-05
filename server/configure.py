"""Run locally on the tutor server. Never paste the key into the source code."""
from getpass import getpass
from pathlib import Path
import os
import re
import tempfile

key = getpass('Cole a chave Gemini (ela não aparecerá na tela) e pressione Enter: ').strip()
if not re.fullmatch(r'[A-Za-z0-9_.-]{20,200}', key):
    raise SystemExit('Formato inválido. Nenhum arquivo foi alterado.')
folder = Path(__file__).resolve().parent
content = '\n'.join([
    'GEMINI_API_KEY=' + key,
    'GEMINI_MODEL=gemini-3.6-flash',
    'HOST=127.0.0.1', 'PORT=8787', 'TUTOR_SERVE_SITE=1',
    'TUTOR_ALLOWED_ORIGINS=http://127.0.0.1:8787,http://localhost:8787',
    'TUTOR_DAILY_LIMIT=100', ''
])
fd, name = tempfile.mkstemp(dir=folder, prefix='.env-')
try:
    with os.fdopen(fd, 'w', encoding='utf-8') as output:
        output.write(content)
    os.chmod(name, 0o600)
    os.replace(name, folder / '.env')
finally:
    if os.path.exists(name):
        os.unlink(name)
print('Chave configurada. O conteúdo não foi exibido nem enviado ao GitHub.')
