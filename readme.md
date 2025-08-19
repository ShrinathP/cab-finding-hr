Mongoose schema
User -> will feed in name, location

Seeder -> Will feed the route and the time

Seeker -> Will feed the location and the time

Matching algorithm will run for 
-> For every Seeder added - run matchSeeker for all Seekers
-> For every Seeker added - run matchSeeker once
-> For every Seeder removed
-> Avoid too many Seeder - one seeker match - 1 match is sufficient ??
-> For every 5 minutes to check if the route is updated

We are now using photon for geocoding api
<!-- https://photon.komoot.io/api/?q=akme+ballet+mahadevpura+bengaluru -->

We are now using graphhopper api for route matching
<!-- http://127.0.0.1:8989/route?point=${pickup.lat},${pickup.lng}&point=${destination.lat},${destination.lng}&profile=car&instructions=true&type=json -->

1. You will need Rancher Desktop
2. For running GraphHopper container with a pbf file
```
docker run -p 8989:8989 \
  -e JAVA_OPTS="-Xms4g -Xmx4g" \
  israelhikingmap/graphhopper \
  --url https://download.openstreetmap.fr/extracts/asia/india/karnataka-latest.osm.pbf \
  --host 0.0.0.0
```



