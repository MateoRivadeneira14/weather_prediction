# Stage 1: Builder
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt
FROM python:3.9-slim
WORKDIR /app
COPY . .
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
ENV PORT=8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]