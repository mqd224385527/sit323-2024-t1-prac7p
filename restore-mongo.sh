#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup_directory>"
  echo "Example: $0 ./backups/mongodb_backup_20230601_120000"
  exit 1
fi

BACKUP_DIR=$1

if [ ! -d "${BACKUP_DIR}" ]; then
  echo "Error: Backup directory ${BACKUP_DIR} not found."
  exit 1
fi

MONGO_POD=$(kubectl get pods -l app=mongo -o jsonpath='{.items[0].metadata.name}')

if [ -z "${MONGO_POD}" ]; then
  echo "Error: MongoDB pod not found."
  exit 1
fi

echo "Found MongoDB pod: ${MONGO_POD}"
echo "Copying backup files to pod..."

kubectl cp ${BACKUP_DIR} ${MONGO_POD}:/tmp/

BACKUP_NAME=$(basename ${BACKUP_DIR})
echo "Starting restoration from backup: ${BACKUP_NAME}"

kubectl exec ${MONGO_POD} -- mongorestore --username admin --password admin123 --authenticationDatabase admin --db sit323db --drop /tmp/${BACKUP_NAME}/sit323db

echo "Backup restoration completed."
echo "Verifying database content..."

kubectl exec ${MONGO_POD} -- mongo -u admin -p admin123 --authenticationDatabase admin sit323db --eval "db.items.count()"

echo "Cleanup temporary files in pod..."
kubectl exec ${MONGO_POD} -- rm -rf /tmp/${BACKUP_NAME}

echo "Restoration process completed." 