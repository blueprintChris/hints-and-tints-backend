FROM node:alpine

RUN mkdir -p /usr/src/tints-and-hints

WORKDIR /usr/src/tints-and-hints

COPY package.json /usr/src/tints-and-hints

RUN npm install

COPY . /usr/src/tints-and-hints

RUN yarn tsc

EXPOSE 4000

CMD ["node", "./dist/index.js"]

# 1. Login to docker: 
  # aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 978544736059.dkr.ecr.eu-west-2.amazonaws.com
# 2. 
  # docker build . -t 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 6. docker push 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 7. login to putty -> docker stop 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
 # docker stop  978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 8. docker pull 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend (might have to log back in, see step 1.)
# 9. docker run -d -p 4000:4000 -e SOCKET_KEY=$(aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:eu-west-2:978544736059:secret:tints-and-hints-SfrRcn --region eu-west-2 --query SecretString  --output text | cut -d: -f2 | tr -d \"}) 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 10. docker ps -> check if container is running