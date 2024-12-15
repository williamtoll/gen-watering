#setup postgres

createuser openfarm> -P --interactive

GRANT ALL PRIVILEGES ON DATABASE smart_watering  TO openfarm;
