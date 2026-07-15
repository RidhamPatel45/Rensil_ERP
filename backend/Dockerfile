FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install packages
RUN npm install

# Copy source code files
COPY . .

# Expose backend port
EXPOSE 5000

# Start server using nodemon for live reload
CMD ["npm", "run", "dev"]
