#!/usr/bin/env bash

# Get config directory
if [ -L $0 ]; then
    ME=$(readlink $0)
else
    ME=$0
fi
DIR=$(dirname $ME)
FILE="$DIR/../src/.env"

# Get env variables and put them in .env
echo "Internal port to listen on (Default 8000): "
read PORT
if [ -z "$PORT" ]; then
  PORT=8000
fi
echo "PORT=$PORT" > $FILE

echo "Protocol for website (Default http): "
read PROTOCOL
if [ -z "$PROTOCOL" ]; then
  PROTOCOL="http"
fi
echo "PROTOCOL=$PROTOCOL" >> $FILE

echo "Website domain (Default localhost): "
read DOMAIN
if [ -z "$DOMAIN" ]; then
  DOMAIN="localhost"
fi
echo "DOMAIN=$DOMAIN" >> $FILE

echo "External website port (Default 8000): "
read EXTPORT
if [ -z "$EXTPORT" ]; then
  EXTPORT=8000
fi
echo "EXTPORT=$EXTPORT" >> $FILE

echo "Database bolt location (Default localhost): "
read DBURI
if [ -z "$DBURI" ]; then
  DBURI="localhost"
fi
echo "DBURI=$DBURI" >> $FILE

echo "Database bolt port (Default 7687): "
read DBPORT
if [ -z "$DBPORT" ]; then
  DBPORT=7687
fi
echo "DBPORT=$DBPORT" >> $FILE

echo "Database username (Default neo4j): "
read DBUSER
if [ -z "$DBUSER" ]; then
  DBUSER="neo4j"
fi
echo "DBUSER=$DBUSER" >> $FILE

echo "Database password (Default 12345): "
read DBPASS
if [ -z "$DBPASS" ]; then
  DBPASS="12345"
fi
echo "DBPASS=$DBPASS" >> $FILE

echo "Certificate location (Default /etc/letsencrypt/live/$DOMAIN/fullchain.pem): "
read CERT
if [ -z "$CERT" ]; then
  CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
fi
echo "CERT=$CERT" >> $FILE

echo "Certificate key location (Default /etc/letsencrypt/live/$DOMAIN/privkey.pem): "
read CERTKEY
if [ -z "$CERTKEY" ]; then
  CERTKEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
fi
echo "CERTKEY=$CERTKEY" >> $FILE
