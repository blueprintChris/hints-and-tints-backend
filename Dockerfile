FROM node:alpine

RUN mkdir -p /usr/src/hints-and-tints-backend

WORKDIR /usr/src/hints-and-tints-backend

COPY package.json /usr/src/hints-and-tints-backend

RUN npm install

COPY . /usr/src/hints-and-tints-backend

RUN npx tsc

EXPOSE 4000

CMD ["node", "./dist/index.js"]

# to get bot back online 
# 1. log into ec2 instance via putty
# 2. docker ps to check if online
# 3. docker run -d 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 4. docker ps 

# to push new update
# 1. Login to docker: aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 978544736059.dkr.ecr.eu-west-2.amazonaws.com
# 2. docker build .
# 3. docker images -> find image ID
# 4. docker tag <image ID> 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 5. docker images -> check tag
# 6. docker push 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 7. login to putty -> docker stop 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend
# 8. docker pull 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend (might have to log back in, see step 1.)
# 9. docker run -d -p 4000:4000 978544736059.dkr.ecr.eu-west-2.amazonaws.com/hints-and-tints-backend 
# 10. docker ps -> check if container is running