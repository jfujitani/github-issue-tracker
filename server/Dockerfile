# syntax=docker/dockerfile:1

# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the Go binary
RUN go build -o server ./main.go

# Final stage
FROM alpine:3.19

WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/server .
COPY --from=builder /app/public /app/public

# Optionally copy config/data files if needed
# COPY --from=builder /app/data ./data

EXPOSE 8080

ENTRYPOINT ["./server"]
