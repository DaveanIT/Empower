from django.db import connections
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import redirect
from django.contrib.auth import logout
from .models import SYgtway1
from .utils import switch_tenant_db

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Extract domain and path
        domain = request.get_host().split(':')[0]
        path_parts = request.path.strip('/').split('/')
        last_two_segments = '/' + '/'.join(path_parts[-2:]) if len(path_parts) >= 2 else request.path

        # Function to update database settings
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
            # print(f"Database switched to: {db_name}")

        # Check for `/api/token` path
        if last_two_segments == '/api/token':
            print("Path requested is /api/token")
            try:
                update_db_settings('MPOWER_TEST')
                root_tenant = SYgtway1.objects.get(name='Root')
                switch_tenant_db(root_tenant)
            except SYgtway1.DoesNotExist:
                print("Root tenant not found for /api/token")
            return


        # Check for `/admin/` path
        if request.path == '/admin/':
            print("Path requested is /admin")
            try:
                update_db_settings('MPOWER_TEST')
                root_tenant = SYgtway1.objects.get(name='Root')
                switch_tenant_db(root_tenant)
            except SYgtway1.DoesNotExist:
                print("Root tenant not found for /admin")
            return

        # Check if user is authenticated
        if request.user.is_authenticated:
            print("Authenticated user:", request.user)
            tenant = request.user.cmpid
            if tenant:
                print(f"Switching to tenant database for {tenant}")
                switch_tenant_db(tenant)
        else:
            print("Unauthenticated user - switching to Root tenant")
            print(request.user)
            try:
                update_db_settings('MPOWER_TEST')

                db_settings = connections['default'].settings_dict
                print("middleware else db:", db_settings['NAME'])
                root_tenant = SYgtway1.objects.get(name='Root')
                print("Root tenant ",root_tenant)
                switch_tenant_db(root_tenant)
            except SYgtway1.DoesNotExist:
                print("Root tenant not found for unauthenticated user.")
