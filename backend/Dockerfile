FROM python:3.12.3-alpine

WORKDIR /app

RUN apk update

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app
COPY docker-config.ini /app/config.ini

EXPOSE 5000

CMD ["flask", "run", "--host", "0.0.0.0"]