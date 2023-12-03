FROM golang:1.21 AS build
WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -v -o program

# Build runtime image
FROM gcr.io/distroless/base-debian11
WORKDIR /bin
EXPOSE 5090
COPY .env .
COPY --from=build /app/program .
VOLUME var/uploads

USER nonroot:nonroot

ENTRYPOINT ["/bin/program"]
