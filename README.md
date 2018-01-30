# domotics-dashboard

_A customizable front to manage domotics with Myfox services, written in NodeJS._

**Warning: development of this software was aborted due to performances problems using Angular1 on the web browser side.
Then a new generation of domotics software is in progress here: [https://github.com/gxapplications/asterism]**

This release is provided AS IS, without any guarantee about security and stability.
The service MUST ONLY be accessible in a private network: there is no authentication feature,
so accessing the server through HTTP means accessing the full service.

The application here uses [https://github.com/gxapplications/myfox-wrapper-api] as library to
call Myfox services through HTML strategy to control many aspects of your domotics stuff.


## PM2 installation and usage

- npm install -g pm2 (with SU privileges if needed)
- pm2 install pm2-logrotate (optional, to have auto log-rotate feature)
- pm2 start ecosystem.config.js (to install the configuration the first time)
- pm2 ls (to check if 'domotics' is well registered)
- pm2 stop domotics (to stop the service)
- pm2 start domotics (to start the service)

For more details about PM2, see [http://pm2.keymetrics.io/docs/usage/quick-start/]

_Warning: the service is stateful: this means you MUST NEVER use a cluster
(or multiple instance with load balancing) with this service_
