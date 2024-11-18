
from django.db import connections

def update_db_settings(db_name):
    connections['default'].settings_dict.update({
        'ENGINE': 'mssql',
        'NAME': db_name,
        'USER': 'sa',
        'PASSWORD': 'S@pdb#39',
        'HOST': '192.168.0.5',
        'PORT': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'MARS_Connection': True,
        },
    })