#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_NAME="mongodb_backup_${TIMESTAMP}"

mkdir -p ${BACKUP_DIR}

echo "Creating MongoDB backup..."

kubectl exec $(kubectl get pods -l app=mongo -o jsonpath='{.items[0].metadata.name}') -- mongodump --username admin --password admin123 --authenticationDatabase admin --db sit323db --out /tmp/${BACKUP_NAME}

echo "Copying backup from container to local machine..."
kubectl cp $(kubectl get pods -l app=mongo -o jsonpath='{.items[0].metadata.name}'):/tmp/${BACKUP_NAME} ${BACKUP_DIR}/${BACKUP_NAME}

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}"
echo "Backup size:"
du -sh ${BACKUP_DIR}/${BACKUP_NAME} 