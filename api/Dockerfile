FROM golang:1.21-alpine AS build
WORKDIR /app

COPY . .
RUN go mod download && go mod verify
RUN CGO_ENABLED=0 GOOS=linux go build -v -o main

# Build runtime image
FROM gcr.io/distroless/static-debian12
WORKDIR /bin

COPY .env .
COPY --from=build /app/main .
VOLUME /tmp/uploads
USER nonroot:nonroot

ENTRYPOINT ["main"]
EXPOSE 5090