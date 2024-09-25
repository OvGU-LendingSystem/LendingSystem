FROM python:3.12.3

WORKDIR /app

RUN apt update
RUN apt install -y pkg-config build-essential

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app
COPY docker-config.ini /app/config.ini

EXPOSE 5000

#ENTRYPOINT python3 -m alembic.config upgrade head && flask run --host 0.0.0.0
ENTRYPOINT flask run --host 0.0.0.0 --debug