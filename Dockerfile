# syntax=docker/dockerfile:1

# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY server/go.mod server/go.sum ./
RUN go mod download

# Copy the source code
COPY server ./server/

# Build the Go binary
WORKDIR /app/server
RUN go build -o /app/server/server .

# Final stage
FROM alpine:3.19

# Copy the binary from the builder
COPY --from=builder /app/server/server /app/server/server
COPY --from=builder /app/server/templates /app/server/templates

EXPOSE 8080

ENTRYPOINT ["./app/server/server"]
