import re

import requests
from attr import asdict
from lambda_decorators import cors_headers, json_http_resp, load_json_body

from bikehero.models import Stand, Stands, Point
from bikehero.util import database


FIXIT_MAP_URL = 'http://www.dero.com/fixitmap/fixitmap.html'

MARKER_RE = re.compile(
    r'markers\.addLayer\(L\.marker\(\[(-?\d+\.\d+), *(-?\d+\.\d+)\]')


@database
def scrape_dero_fixit_map(event, context):
    resp = requests.get(FIXIT_MAP_URL)
    coords = MARKER_RE.findall(str(resp.content))

    context.db.query("delete from stands where source_type='scraper'")

    for lat, lon in coords:
        fixit_stand = Stand(
            location=Point(float(lon), float(lat), srid=4326),
            stand_type='fixit',
            source_type='scraper',
        )
        context.db.query("""
                         insert into stands (location, stand_type, source_type)
                         values (:location, :stand_type, :source_type)
                         """, **asdict(fixit_stand))

@cors_headers
@json_http_resp
@database
def get_stands(event, context):
    return Stands(Stand(**row) for row in context.db.query('select * from stands')).geojson


@cors_headers
@load_json_body
@json_http_resp
@database
def add_stand(event, context):
    stand = Stand(
        location=Point(event['body']['lng'], event['body']['lat'], srid=4326),
        stand_type=event['body']['stand_type'],
        source_type='api',
    )
    context.db.query("""
                     insert into stands (location, stand_type, source_type)
                     values (:location, :stand_type, :source_type)
                     """, **asdict(stand))
    return stand.geojson
