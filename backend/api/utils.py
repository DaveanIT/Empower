from django.db import connections
from django.db.utils import OperationalError
def switch_tenant_db(tenant):
    print('Switching to database:')
    print(tenant.dbname)
    connections['default'].close()

    # Log current settings before update
    # print("Current DB settings:", connections['default'].settings_dict)
    
    connections['default'].settings_dict.update({
        'ENGINE': 'mssql',
        'NAME': tenant.dbname,
        'USER': tenant.dbusr,
        'PASSWORD': tenant.dbpwd,
        'HOST': '192.168.0.5',
        'PORT': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'MARS_Connection': True,
        },
    })

    # Log settings after update
    # print("Updated DB settings:", connections['default'].settings_dict)

    # Test the connection
