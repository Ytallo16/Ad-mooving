# Integração AbacatePay --- documento explicativo para o Cursor AI

## Sumário rápido

1.  Pré-requisitos & config
2.  Autenticação
3.  Gerar PIX (QR Code)
4.  Simular pagamento
5.  Checar status
6.  Exemplo de backend (FastAPI)
7.  Testes automatizados (pytest)
8.  Checklist de produção e observações
9.  Documento mínimo para Cursor AI

------------------------------------------------------------------------

## 1) Pré-requisitos & configuração

-   Variáveis de ambiente:
    -   `ABACATEPAY_API_KEY` --- sua chave da AbacatePay.
    -   `ABACATEPAY_BASE_URL` --- `https://api.abacatepay.com/v1`
        (padrão).
-   Bibliotecas Python sugeridas: `fastapi`, `uvicorn`, `requests`,
    `pydantic`, `pytest`, `responses`.
-   Fluxo esperado:
    1.  Criar QR Code (chamada `POST /pixQrCode/create`).
    2.  (em dev) simular pagamento do QR Code
        (`POST /pixQrCode/simulate-payment?id=<id>`).
    3.  Checar status (`GET /pixQrCode/check?id=<id>`).

------------------------------------------------------------------------

## 2) Autenticação

Todas as chamadas exigem cabeçalho:

``` http
Authorization: Bearer <abacatepay-api-key>
Content-Type: application/json
```

------------------------------------------------------------------------

## 3) Gerar PIX (QR Code)

**Endpoint**

    POST /pixQrCode/create

URL: `https://api.abacatepay.com/v1/pixQrCode/create`

**Payload (JSON)**

``` json
{
  "amount": 123,
  "expiresIn": 3600,
  "description": "Pagamento do pedido #123",
  "customer": {
    "name": "Daniel Lima",
    "cellphone": "(11) 4002-8922",
    "email": "daniel_lima@abacatepay.com",
    "taxId": "123.456.789-01"
  },
  "metadata": {
    "externalId": "pedido-123"
  }
}
```

**Resposta**

``` json
{
  "data": {
    "id": "pix_char_123456",
    "amount": 100,
    "status": "PENDING",
    "devMode": true,
    "brCode": "...",
    "brCodeBase64": "data:image/png;base64,...",
    "createdAt": "...",
    "expiresAt": "..."
  },
  "error": null
}
```

------------------------------------------------------------------------

## 4) Simular o pagamento (apenas em dev)

**Endpoint**

    POST /pixQrCode/simulate-payment?id=<pix_char_id>

**Exemplo curl**

``` bash
curl --request POST   --url 'https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=pix_char_123456'   --header 'Authorization: Bearer <token>'   --header 'Content-Type: application/json'   --data '{ "metadata": {} }'
```

**Resposta** Retorna objeto do QRCode atualizado com `status` = `PAID`.

------------------------------------------------------------------------

## 5) Checar status do PIX

**Endpoint**

    GET /pixQrCode/check?id=<pix_char_id>

**Exemplo curl**

``` bash
curl --request GET   --url 'https://api.abacatepay.com/v1/pixQrCode/check?id=pix_char_123456'   --header 'Authorization: Bearer <token>'
```

**Resposta**

``` json
{
  "data": {
    "status": "PENDING",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

------------------------------------------------------------------------

## 6) Exemplo de backend (FastAPI)

``` python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os, requests

API_BASE = os.getenv("ABACATEPAY_BASE_URL", "https://api.abacatepay.com/v1")
API_KEY = os.getenv("ABACATEPAY_API_KEY", "replace_me")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

app = FastAPI(title="AbacatePay Proxy")

class Customer(BaseModel):
    name: str
    cellphone: str
    email: str
    taxId: str

class CreatePixReq(BaseModel):
    amount: int
    expiresIn: int = 3600
    description: str | None = None
    customer: Customer | None = None
    metadata: dict | None = None

@app.post("/pix/create")
def create_pix(req: CreatePixReq):
    url = f"{API_BASE}/pixQrCode/create"
    resp = requests.post(url, json=req.dict(exclude_none=True), headers=HEADERS, timeout=10)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

@app.post("/pix/{pix_id}/simulate")
def simulate_pix(pix_id: str, metadata: dict | None = None):
    url = f"{API_BASE}/pixQrCode/simulate-payment"
    params = {"id": pix_id}
    body = {"metadata": metadata or {}}
    resp = requests.post(url, params=params, json=body, headers=HEADERS, timeout=10)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

@app.get("/pix/{pix_id}/status")
def check_pix_status(pix_id: str):
    url = f"{API_BASE}/pixQrCode/check"
    params = {"id": pix_id}
    resp = requests.get(url, params=params, headers=HEADERS, timeout=10)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()
```

------------------------------------------------------------------------

## 7) Testes com pytest

``` python
import responses
from abacatepay_backend import app
from fastapi.testclient import TestClient

client = TestClient(app)
BASE = "https://api.abacatepay.com/v1"

@responses.activate
def test_flow():
    # mock create
    create_resp = {"data": {"id": "pix_char_123", "status": "PENDING"}, "error": None}
    responses.add(responses.POST, f"{BASE}/pixQrCode/create", json=create_resp, status=200)
    r = client.post("/pix/create", json={"amount": 100, "expiresIn": 3600})
    assert r.status_code == 200

    # mock simulate
    simulate_resp = {"data": {"id": "pix_char_123", "status": "PAID"}, "error": None}
    responses.add(responses.POST, f"{BASE}/pixQrCode/simulate-payment", json=simulate_resp, status=200)
    r2 = client.post("/pix/pix_char_123/simulate", json={})
    assert r2.json()["data"]["status"] == "PAID"

    # mock check
    check_resp = {"data": {"status": "PAID"}, "error": None}
    responses.add(responses.GET, f"{BASE}/pixQrCode/check", json=check_resp, status=200)
    r3 = client.get("/pix/pix_char_123/status")
    assert r3.json()["data"]["status"] == "PAID"
```

------------------------------------------------------------------------

## 8) Checklist de produção

-   Não expor `ABACATEPAY_API_KEY` no frontend.
-   Validar `amount` no backend.
-   Usar backoff para polling de `check`.
-   Logging estruturado (id, status, amount, metadata).

------------------------------------------------------------------------

## 9) Documento mínimo para Cursor AI

**Objetivo:** integrar a API de Pix (AbacatePay) --- criar QRCode,
simular pagamento e checar status.\
**Endpoints:**\
- `POST /v1/pixQrCode/create`\
- `POST /v1/pixQrCode/simulate-payment?id=<id>`\
- `GET /v1/pixQrCode/check?id=<id>`\
**Autenticação:** header `Authorization: Bearer <abacatepay-api-key>`.\
**Fluxo:** criar QR -\> simular pagamento (dev) -\> checar status -\>
validar `PAID`.\
**Recomendações:** não expor chave, usar backoff, validar valores no
backend, logs.
