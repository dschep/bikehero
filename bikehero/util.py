import os

import boto3
import records
from lambda_decorators import LambdaDecorator
from postgis.psycopg import register


class database(LambdaDecorator):
    def before(self, event, context):
        self.db = records.Database(boto3.client('ssm').get_parameter(
            Name=f"/bikehero/{os.environ.get('STAGE', '')}/db_url",
            WithDecryption=True)['Parameter']['Value'])
        register(self.db.db.connection) # self.records_db.sqalchemy_connection.dbapi_connection
        context.db = self.db

        return event, context

    def after(self, response):
        self.db.close()
        return response

    def on_exception(self, exception):
        if hasattr(self, 'db'): # in cas something went wrong before setting self.db
            self.db.close()
        raise exception
