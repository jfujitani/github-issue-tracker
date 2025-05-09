# Use a lightweight Nginx image as the base
FROM nginx:alpine

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Copy the public folder to Nginx's default HTML folder
COPY public/ .

# Expose the default HTTP port
EXPOSE 80

# Nginx will serve the files on container startup
CMD ["nginx", "-g", "daemon off;"]

