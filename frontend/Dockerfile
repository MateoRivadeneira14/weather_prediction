FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent --include=dev && mv node_modules ../
COPY . .
RUN ln -s ../node_modules node_modules && npm run build
EXPOSE 5173
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
