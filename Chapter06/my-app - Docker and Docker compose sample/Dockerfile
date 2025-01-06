# Use an official Node runtime as a parent image
FROM node:16
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install any needed packages
RUN npm install
# Copy the rest of the application code to the working directory
COPY . .
# Build the TypeScript code
RUN npx tsc
# Run the command to start the app
CMD ["node", "dist/index.js"]
