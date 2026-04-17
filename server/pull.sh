#!/bin/bash
# Run this ONCE before starting the server to pre-pull all language images.
# First run of each image takes time; after that they're cached locally.

set -e

echo "Pulling Docker images for Trace..."

docker pull python:3.12-slim
docker pull gcc:13
docker pull node:20-slim
docker pull openjdk:21-slim
docker pull golang:1.22-alpine
docker pull rust:1-slim

echo ""
echo "✅ All images ready. You can now start the server."