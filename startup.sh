
#!/bin/bash


forever start \
-al sodabox-socket-forever.log \
-ao sodabox-socket-out.log \
-ae sodabox-socket-err.log \
sodabox-socket.js --port 8001 --channel CH001 --server ec2-23-20-135-233.compute-1.amazonaws.com:8001

forever start \
-al sodabox-forever.log \
-ao sodabox-out.log \
-ae sodabox-err.log \
sodabox.js --port 8000

~    