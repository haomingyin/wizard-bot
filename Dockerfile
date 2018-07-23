FROM node:8.11.3-alpine

RUN mkdir -p /app
WORKDIR /app

# Install node modules
COPY package.json package-lock.json /app/
RUN npm install

# Set Google dialogflow credential env
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/credentials/google-dialogflow-key.json"
ENV EXPRESS_PORT=8089
ENV HUBOT_ALIAS="!"

# Copy project files into docker image
COPY . /app/

EXPOSE 8089

CMD ["npm", "run", "prod"]
