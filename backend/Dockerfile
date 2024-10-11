FROM python:3.12

WORKDIR /backend
COPY . /backend/

# Installiere System-Abhängigkeiten
RUN apt-get update && apt-get install -y \
    pkg-config
RUN pip install -r requirements.txt
EXPOSE 5000

CMD [ "gunicorn", "-w", "1", "-b", "0.0.0.0:5000", "app:app" ]