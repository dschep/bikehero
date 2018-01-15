from collections import UserList
from datetime import datetime

from postgis import Point
from attr import dataclass, asdict

@dataclass
class Stand:
    location: Point
    stand_type: str
    source_type: str
    stand_id: int = None
    created: datetime = None

    @property
    def geojson(self):
        geojson = self.location.geojson
        geojson['properties'] = asdict(self)
        del geojson['properties']['location']
        if geojson['properties']['created'] is not None:
            geojson['properties']['created'] = geojson['properties']['created'].isoformat()
        geojson['id'] = geojson['properties']['stand_id']
        return geojson


class Stands(UserList):
    @property
    def geojson(self):
        return {
            'type': 'FeatureCollection',
            'features': [stand.geojson for stand in self],
        }
