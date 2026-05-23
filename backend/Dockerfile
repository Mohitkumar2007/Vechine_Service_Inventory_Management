FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config \
  && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app

EXPOSE 8000

CMD ["gunicorn", "vehicle_service.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"]
