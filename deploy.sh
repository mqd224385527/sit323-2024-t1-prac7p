#!/bin/bash

echo "Building application image..."
docker build -t sit323-node-app .

echo "Applying MongoDB storage configuration..."
kubectl apply -f mongo-storage.yaml

echo "Applying MongoDB Secret..."
kubectl apply -f mongodb-secret.yaml

echo "Applying MongoDB deployment..."
kubectl apply -f mongo-deployment.yaml

echo "Waiting for MongoDB to start..."
sleep 10

echo "Applying application deployment..."
kubectl apply -f app-deployment.yaml

echo "Displaying Pod status..."
kubectl get pods

echo "Displaying Service status..."
kubectl get services 