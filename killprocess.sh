#!/bin/bash

PID=$(ss -tulnp | grep "3000" | grep -oP 'pid=\K[0-9]+')
sudo kill $PID
